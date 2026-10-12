import type { AppState } from "./types";

const KEY = "tochka-yasnosti:v1";

export const emptyState = (): AppState => ({
  version: 2,
  onboardingDone: false,
  goals: [],
  specialist: null,
  situations: [],
  practices: [],
});

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as {
      version?: number;
      onboardingDone?: boolean;
      goals?: AppState["goals"];
      situations?: AppState["situations"];
      practices?: AppState["practices"];
      specialist?: AppState["specialist"];
    };
    if (parsed.version !== 1 && parsed.version !== 2) return emptyState();
    return {
      ...emptyState(),
      version: 2,
      goals: parsed.goals ?? [],
      situations: parsed.situations ?? [],
      practices: parsed.practices ?? [],
      specialist: parsed.specialist ?? null,
      onboardingDone: Boolean(parsed.onboardingDone),
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ ...state, version: 2 }));
}

export function resetState(): AppState {
  const next = emptyState();
  saveState(next);
  return next;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
