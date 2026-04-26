import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is required");

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No active session — cannot make authenticated API request");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...init.headers,
    },
  });

  if (response.status === 401) {
    throw new Error("API request unauthorized — session may have expired");
  }

  if (response.status >= 500) {
    throw new Error(`API server error: ${response.status} ${response.statusText}`);
  }

  return response;
}
