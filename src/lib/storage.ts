import type { AppState } from "./types";

const KEY = "tochka-yasnosti:v1";

export const emptyState = (): AppState => ({
  version: 1,
  onboardingDone: false,
  goals: [],
  specialist: null,
  situations: [],
});

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed?.version !== 1) return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      goals: parsed.goals ?? [],
      situations: parsed.situations ?? [],
      specialist: parsed.specialist ?? null,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  const next = emptyState();
  saveState(next);
  return next;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
