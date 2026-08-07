import { createClient } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/** Fetch wrapper that attaches the current Supabase access token as a Bearer
 * header -- this is what lets FastAPI forward the caller's own identity to
 * PostgREST/Storage so Row-Level Security enforces tenant isolation. */
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
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}
