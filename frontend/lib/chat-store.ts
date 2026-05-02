// LocalStorage-backed settings for the chat UI.
// All functions are safe to call during SSR — they return defaults when
// window is unavailable, so they can be imported from any module.

const STORAGE_KEY = "dejaq_chat_settings";

export interface ChatSettings {
  apiKey: string;
  deptSlug: string;
  apiBaseUrl: string; // overrides NEXT_PUBLIC_API_BASE_URL when non-empty
}

const DEFAULTS: ChatSettings = { apiKey: "", deptSlug: "", apiBaseUrl: "" };

export function loadSettings(): ChatSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      deptSlug: typeof parsed.deptSlug === "string" ? parsed.deptSlug : "",
      apiBaseUrl: typeof parsed.apiBaseUrl === "string" ? parsed.apiBaseUrl : "",
    };
  } catch {
    return DEFAULTS;
  }
}

export function persistSettings(settings: ChatSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
