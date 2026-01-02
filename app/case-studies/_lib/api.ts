export class ApiError extends Error {
  status: number;
  url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });
  } catch (e) {
    throw new ApiError("Network error", 0, url);
  }

  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status})`, res.status, url);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("Invalid JSON from server", res.status, url);
  }
}
