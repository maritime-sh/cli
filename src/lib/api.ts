import { getApiUrl } from "./config.js";

export interface ApiError {
  detail: string;
}

export async function api<T = unknown>(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    apiKey: string;
  },
): Promise<T> {
  const base = getApiUrl();
  const url = `${base}${path}`;

  const headers: Record<string, string> = {
    "X-API-Key": opts.apiKey,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as ApiError;
      detail = err.detail || detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}
