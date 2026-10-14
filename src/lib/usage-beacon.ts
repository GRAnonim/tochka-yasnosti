/**
 * Quiet usage ping for the Telegram bot admin panel.
 * Sends only event type (open / screen / practice key), never diary text.
 */

const PRACTICE_SCREENS = new Set([
  "mood",
  "gratitude",
  "emotions",
  "abc",
  "questions",
  "wheel",
  "breath",
  "ideal-day",
  "five-whys",
  "new-situation",
]);

const SCREEN_TO_PRACTICE: Record<string, string> = {
  "new-situation": "decision",
  "wheel-result": "wheel",
};

type BeaconEvent = "open" | "active" | "practice";

let ingestUrl: string | null | undefined;
let lastActiveAt = 0;
let lastPracticeKey = "";
let openSent = false;

function initData(): string {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initData || "";
}

async function resolveIngestUrl(): Promise<string | null> {
  if (ingestUrl !== undefined) return ingestUrl;
  const fromEnv = (process.env.NEXT_PUBLIC_STATS_URL || "").trim();
  if (fromEnv) {
    ingestUrl = fromEnv.replace(/\/$/, "");
    return ingestUrl;
  }
  try {
    const path = window.location.pathname.endsWith("/")
      ? `${window.location.pathname}stats-ingest.json`
      : `${window.location.pathname}/stats-ingest.json`;
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      ingestUrl = null;
      return null;
    }
    const json = (await res.json()) as { url?: string };
    const url = (json?.url || "").trim();
    ingestUrl = url ? url.replace(/\/$/, "") : null;
    return ingestUrl;
  } catch {
    ingestUrl = null;
    return null;
  }
}

async function postEvent(event: BeaconEvent, practice?: string) {
  const data = initData();
  if (!data) return;
  const base = await resolveIngestUrl();
  if (!base) return;
  try {
    await fetch(`${base}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: data,
        event,
        ...(practice ? { practice } : {}),
      }),
      keepalive: true,
    });
  } catch {
    /* bot is offline or Pages cannot reach the laptop */
  }
}

/** Call once after Telegram.WebApp.ready(). */
export function reportAppOpen(): void {
  if (openSent) return;
  if (!initData()) return;
  openSent = true;
  void postEvent("open");
}

/** Screen changes: practice start or a quiet heartbeat. */
export function reportAppScreen(screen: string): void {
  if (!initData()) return;
  const practice = SCREEN_TO_PRACTICE[screen] || (PRACTICE_SCREENS.has(screen) ? screen : "");
  const now = Date.now();
  if (practice) {
    if (practice === lastPracticeKey && now - lastActiveAt < 8000) return;
    lastPracticeKey = practice;
    lastActiveAt = now;
    void postEvent("practice", practice);
    return;
  }
  if (now - lastActiveAt < 60_000) return;
  lastActiveAt = now;
  void postEvent("active");
}
