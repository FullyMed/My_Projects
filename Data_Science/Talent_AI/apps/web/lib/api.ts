import { createClient } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/** An error response from the API. `message` is the server's own `detail`
 * sentence (already written for people to read), and `status` is the HTTP
 * status, for the few places that react to a specific one (402 = plan limit). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Build an ApiError from a failed response, pulling FastAPI's `detail` out of
 * the JSON body. A 422 validation error has a list there instead of a
 * sentence, and some failures have no JSON at all, so both fall back to a
 * generic message rather than showing raw JSON. */
export async function toApiError(response: Response): Promise<ApiError> {
  let detail: unknown;
  try {
    detail = (await response.json()).detail;
  } catch {
    detail = undefined;
  }
  return new ApiError(response.status, typeof detail === "string" ? detail : GENERIC_ERROR);
}

const GENERIC_ERROR = "Something went wrong. Try again in a moment.";

/** The sentence to show for anything a page's try/catch catches. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  // fetch() throws a TypeError when it can't reach the server at all.
  if (err instanceof TypeError) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return GENERIC_ERROR;
}

/** Fetch wrapper that attaches the current Supabase access token as a Bearer
 * header. That's what lets FastAPI pass the caller's own identity on to
 * PostgREST/Storage, so Row-Level Security enforces tenant isolation. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}
