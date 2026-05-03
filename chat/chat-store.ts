// LocalStorage-backed settings for the chat UI.
// All functions are safe to call during SSR — they return defaults when
// window is unavailable, so they can be imported from any module.

const STORAGE_KEY = "dejaq_chat_settings";

export interface ChatSettings {
  apiKey: string;
  deptSlug: string;
  apiBaseUrl: string; // overrides NEXT_PUBLIC_API_BASE_URL when non-empty
  modelProfile: ModelProfile;
  routingMode: RoutingMode;
}

export type ModelProfile = "default" | "weak_cpu";
export type RoutingMode = "auto" | "easy_local" | "hard_external";

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  apiKey: "",
  deptSlug: "",
  apiBaseUrl: "",
  modelProfile: "default",
  routingMode: "auto",
};

function parseModelProfile(value: unknown): ModelProfile {
  return value === "weak_cpu" ? "weak_cpu" : "default";
}

function parseRoutingMode(value: unknown): RoutingMode {
  return value === "easy_local" || value === "hard_external" ? value : "auto";
}

export function loadSettings(): ChatSettings {
  if (typeof window === "undefined") return DEFAULT_CHAT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHAT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      deptSlug: typeof parsed.deptSlug === "string" ? parsed.deptSlug : "",
      apiBaseUrl: typeof parsed.apiBaseUrl === "string" ? parsed.apiBaseUrl : "",
      modelProfile: parseModelProfile(parsed.modelProfile),
      routingMode: parseRoutingMode(parsed.routingMode),
    };
  } catch {
    return DEFAULT_CHAT_SETTINGS;
  }
}

export function persistSettings(settings: ChatSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
