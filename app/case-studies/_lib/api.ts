import axios, { AxiosError } from "axios";

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
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  },
): Promise<T> {
  try {
    const res = await axios.request<T>({
      url,
      method: init?.method ?? "GET",
      data: init?.body,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },

      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      throw new ApiError(`Request failed (${res.status})`, res.status, url);
    }

    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const err = e as AxiosError;

      if (err.response) {
        throw new ApiError(
          `Request failed (${err.response.status})`,
          err.response.status,
          url,
          e,
        );
      }

      throw new ApiError("Network error", 0, url, e);
    }

    throw new ApiError("Network error", 0, url, e);
  }
}
