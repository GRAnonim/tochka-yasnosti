type TelegramBackButton = {
  isVisible?: boolean;
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
};

type SafeAreaInset = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  initData?: string;
  themeParams?: Record<string, string>;
  colorScheme?: "light" | "dark";
  platform?: string;
  initDataUnsafe?: { user?: { first_name?: string } };
  BackButton?: TelegramBackButton;
  safeAreaInset?: SafeAreaInset;
  contentSafeAreaInset?: SafeAreaInset;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** True only inside a real Telegram client (not desktop browser with the script loaded). */
function isInsideTelegram(): boolean {
  const wa = getTelegramWebApp();
  if (!wa) return false;
  return Boolean(
    (typeof wa.initData === "string" && wa.initData.length > 0) ||
      wa.initDataUnsafe?.user,
  );
}

export function initTelegram(): TelegramWebApp | null {
  const wa = getTelegramWebApp();
  if (!wa) return null;
  try {
    wa.ready();
    wa.expand();
    if (isInsideTelegram()) {
      wa.setHeaderColor?.("#eef4f2");
      wa.setBackgroundColor?.("#eef4f2");
    }
  } catch {
    // ignore — still usable as a regular web app in browser
  }
  return wa;
}

export function hasTelegramBackButton(): boolean {
  if (!isInsideTelegram()) return false;
  return Boolean(getTelegramWebApp()?.BackButton);
}

/**
 * Show/hide Telegram header BackButton and bind it to in-app navigation.
 * Returns cleanup that hides the button and removes the handler.
 */
export function syncTelegramBackButton(
  canGoBack: boolean,
  onBack: () => void,
): () => void {
  if (!hasTelegramBackButton()) return () => {};
  const bb = getTelegramWebApp()?.BackButton;
  if (!bb) return () => {};

  const handler = () => {
    onBack();
  };

  try {
    bb.onClick(handler);
    if (canGoBack) bb.show();
    else bb.hide();
  } catch {
    return () => {};
  }

  return () => {
    try {
      bb.offClick(handler);
      bb.hide();
    } catch {
      /* ignore */
    }
  };
}

/** Write combined device + Telegram content insets into CSS variables on :root */
export function applyTelegramSafeArea(): () => void {
  if (typeof document === "undefined") return () => {};

  const write = (top: number, bottom: number, left: number, right: number) => {
    const root = document.documentElement;
    root.style.setProperty("--app-safe-top", `${top}px`);
    root.style.setProperty("--app-safe-bottom", `${bottom}px`);
    root.style.setProperty("--app-safe-left", `${left}px`);
    root.style.setProperty("--app-safe-right", `${right}px`);
  };

  const wa = getTelegramWebApp();
  if (!wa || !isInsideTelegram()) {
    write(0, 0, 0, 0);
    return () => write(0, 0, 0, 0);
  }

  const apply = () => {
    const s = wa.safeAreaInset;
    const c = wa.contentSafeAreaInset;
    write(
      (s?.top ?? 0) + (c?.top ?? 0),
      (s?.bottom ?? 0) + (c?.bottom ?? 0),
      (s?.left ?? 0) + (c?.left ?? 0),
      (s?.right ?? 0) + (c?.right ?? 0),
    );
  };

  apply();

  const onChange = () => apply();
  try {
    wa.onEvent?.("safeAreaChanged", onChange);
    wa.onEvent?.("contentSafeAreaChanged", onChange);
  } catch {
    /* older clients */
  }

  return () => {
    try {
      wa.offEvent?.("safeAreaChanged", onChange);
      wa.offEvent?.("contentSafeAreaChanged", onChange);
    } catch {
      /* ignore */
    }
    write(0, 0, 0, 0);
  };
}
