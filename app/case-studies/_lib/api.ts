export class ApiError extends Error {
  status: number;
  url: string;
  cause?: unknown;

  constructor(message: string, status: number, url: string, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.cause = cause;
  }
}

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch (e) {
    throw new ApiError("Network error", 0, url, e);
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
