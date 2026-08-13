/**
 * The ONLY place in this app that knows the backend's base URL.
 *
 * Every network call goes through `api()`. It handles the base URL,
 * JSON encoding, cookie/credential forwarding, and error shaping in
 * one place — so swapping backends (or adding an auth header) is a
 * one-file change.
 *
 * Mirrors `lib/api.ts` in TarrsAI/nextjs-standalone on purpose: this
 * app is the mobile client for the SAME backend that a Next.js web
 * client would talk to.
 */

/**
 * Only vars prefixed EXPO_PUBLIC_ are inlined into the bundle. That
 * also means they are PUBLIC — never put a secret here. Server-side
 * secrets belong in the backend repo, not in a mobile binary.
 *
 * Read via the full `process.env.EXPO_PUBLIC_API_URL` expression:
 * Expo's babel transform does a literal text substitution, so
 * destructuring `process.env` or building the key dynamically yields
 * `undefined` at runtime.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Thrown for any non-2xx response. Carries the status so callers can
 *  branch on 401 (→ sign out) vs 4xx (→ show message) vs 5xx (→ retry). */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  /** Plain object → JSON.stringify'd with the right Content-Type.
   *  Pass a string/FormData through `rawBody` if you need control. */
  body?: unknown;
  rawBody?: RequestInit['body'];
  /** Bearer token. On native there is no cookie jar you can rely on,
   *  so token auth is the default shape for a mobile client. */
  token?: string | null;
  /** Abort after N ms. Default 15s — mobile networks stall silently. */
  timeoutMs?: number;
}

/**
 * Typed fetch wrapper.
 *
 *   const { posts } = await api<{ posts: Post[] }>('/api/posts');
 *   await api('/api/posts', { method: 'POST', body: { title }, token });
 */
export const api = async <T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> => {
  const { body, rawBody, token, timeoutMs = 15_000, headers, ...rest } = options;

  const url = path.startsWith('http')
    ? path
    : `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (body !== undefined && finalHeaders['Content-Type'] === undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  // AbortSignal.timeout() is not in every RN engine yet — use a
  // controller so this works on Hermes, JSC and web alike.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      // Harmless on native; on web (the Tarrs preview pane) this is
      // what lets a cookie-session backend work unchanged.
      credentials: 'include',
      body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(0, `Request timed out after ${timeoutMs}ms`, null);
    }
    throw new ApiError(0, err instanceof Error ? err.message : 'Network error', null);
  }
  clearTimeout(timer);

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const message =
      (parsed as { error?: string; message?: string } | null)?.error ??
      (parsed as { error?: string; message?: string } | null)?.message ??
      `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
};
