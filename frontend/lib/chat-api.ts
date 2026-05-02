// Client-side API utility for the DejaQ chat gateway and feedback endpoints.
// Unlike lib/api.ts (server-only), this module runs in the browser and reads
// credentials from React state, not Supabase session cookies.

function getApiBase(): string {
  // Allow the user to override the base URL via the settings modal at runtime.
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("dejaq_chat_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.apiBaseUrl === "string" && parsed.apiBaseUrl.trim()) {
          return parsed.apiBaseUrl.trim().replace(/\/$/, "");
        }
      }
    } catch {
      // Ignore parse errors — fall through to env var.
    }
  }
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}

export interface ChatApiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatSuccess {
  kind: "success";
  text: string;
  modelUsed: string | null;
  responseId: string | null;
  conversationId: string | null;
  promptTokens: number;
  completionTokens: number;
}

export interface ApiError {
  kind: "error";
  status: number;
  message: string;
}

export type ChatResult = ChatSuccess | ApiError;

export function isApiError(v: unknown): v is ApiError {
  return typeof v === "object" && v !== null && (v as ApiError).kind === "error";
}

const HTTP_MESSAGES: Record<number, string> = {
  401: "Invalid or missing API key — check your organization API key in Settings.",
  402: "No external LLM credential configured for this organization. Add a provider key in the DejaQ dashboard.",
  403: "Access denied to this organization.",
  404: "Endpoint not found. Verify the API base URL in Settings.",
  422: "Malformed request body.",
  429: "Rate limited — wait a moment and try again.",
  500: "Internal server error from the DejaQ backend.",
  503: "Service unavailable — make sure the DejaQ server is running.",
};

function userFacingError(status: number, fallback: string): string {
  return HTTP_MESSAGES[status] ?? (fallback.trim() || `Request failed (HTTP ${status}).`);
}

function buildHeaders(apiKey: string, deptSlug: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const dept = deptSlug.trim();
  if (dept) headers["X-DejaQ-Department"] = dept;
  return headers;
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail ?? body?.message ?? "";
  } catch {
    return "";
  }
}

export async function sendChatMessage(
  messages: ChatApiMessage[],
  apiKey: string,
  deptSlug: string,
): Promise<ChatResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBase()}/v1/chat/completions`, {
      method: "POST",
      headers: buildHeaders(apiKey, deptSlug),
      body: JSON.stringify({ model: "default", messages, stream: false }),
    });
  } catch {
    return { kind: "error", status: 0, message: "Network error — could not reach the DejaQ server." };
  }

  if (!response.ok) {
    const detail = await parseErrorDetail(response);
    return { kind: "error", status: response.status, message: userFacingError(response.status, detail) };
  }

  // Extract DejaQ-specific metadata headers before consuming the body.
  const modelUsed = response.headers.get("x-dejaq-model-used");
  const responseId = response.headers.get("x-dejaq-response-id");
  const conversationId = response.headers.get("x-dejaq-conversation-id");

  const data = await response.json();
  const choice = data.choices?.[0];
  const usage = data.usage ?? {};

  return {
    kind: "success",
    text: choice?.message?.content ?? "",
    modelUsed,
    responseId,
    conversationId,
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
  };
}

export type FeedbackRating = "positive" | "negative";

export interface FeedbackSuccess {
  kind: "success";
  status: "ok" | "deleted";
  newScore?: number;
}

export type FeedbackResult = FeedbackSuccess | ApiError;

export async function sendFeedback(
  responseId: string,
  rating: FeedbackRating,
  comment: string,
  apiKey: string,
  deptSlug: string,
): Promise<FeedbackResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBase()}/v1/feedback`, {
      method: "POST",
      headers: buildHeaders(apiKey, deptSlug),
      body: JSON.stringify({
        response_id: responseId,
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }),
    });
  } catch {
    return { kind: "error", status: 0, message: "Network error — could not submit feedback." };
  }

  if (!response.ok) {
    const detail = await parseErrorDetail(response);
    return { kind: "error", status: response.status, message: userFacingError(response.status, detail) };
  }

  const data = await response.json();
  return { kind: "success", status: data.status, newScore: data.new_score };
}

export interface Department {
  id: number;
  label: string;
  slug: string;
}

export type DepartmentsResult = Department[] | ApiError;

export async function fetchDepartments(
  apiKey: string,
  apiBaseUrl?: string,
): Promise<DepartmentsResult> {
  const base = apiBaseUrl?.trim().replace(/\/$/, "") || getApiBase();
  try {
    const response = await fetch(`${base}/departments`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      const detail = await parseErrorDetail(response);
      return { kind: "error", status: response.status, message: userFacingError(response.status, detail) };
    }
    return await response.json() as Department[];
  } catch {
    return { kind: "error", status: 0, message: "Network error — could not reach the DejaQ server." };
  }
}

export async function checkServerHealth(): Promise<{ reachable: boolean; celery: string }> {
  try {
    const response = await fetch(`${getApiBase()}/health`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { reachable: false, celery: "" };
    const data = await response.json();
    return { reachable: data.status === "ok", celery: data.celery ?? "" };
  } catch {
    return { reachable: false, celery: "" };
  }
}
