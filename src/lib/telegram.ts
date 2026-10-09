type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  themeParams?: Record<string, string>;
  colorScheme?: "light" | "dark";
  initDataUnsafe?: { user?: { first_name?: string } };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function initTelegram(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const wa = window.Telegram?.WebApp;
  if (!wa) return null;
  try {
    wa.ready();
    wa.expand();
  } catch {
    // ignore — still usable as a regular web app in browser
  }
  return wa;
}

export function isInsideTelegram(): boolean {
  return Boolean(typeof window !== "undefined" && window.Telegram?.WebApp);
}
