export type AtmosphereId = "original" | "dark" | "white";

export type AtmosphereOption = {
  id: AtmosphereId;
  label: string;
  hint: string;
  swatch: string;
  telegramBg: string;
};

const ATMOSPHERE_KEY = "tochka-atmosphere-v2";

export const ATMOSPHERES: AtmosphereOption[] = [
  {
    id: "original",
    label: "Основной",
    hint: "как было",
    swatch: "#e8f0ed",
    telegramBg: "#eef4f2",
  },
  {
    id: "dark",
    label: "Тёмный",
    hint: "тише для глаз",
    swatch: "#1a211f",
    telegramBg: "#161c1b",
  },
  {
    id: "white",
    label: "Белый",
    hint: "светлая бумага",
    swatch: "#f7f8f7",
    telegramBg: "#f7f8f7",
  },
];

const DEFAULT_ATMOSPHERE: AtmosphereId = "original";

function isAtmosphereId(value: unknown): value is AtmosphereId {
  return value === "original" || value === "dark" || value === "white";
}

export function loadAtmosphere(): AtmosphereId {
  if (typeof window === "undefined") return DEFAULT_ATMOSPHERE;
  try {
    const raw = window.localStorage.getItem(ATMOSPHERE_KEY);
    if (isAtmosphereId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_ATMOSPHERE;
}

export function saveAtmosphere(id: AtmosphereId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ATMOSPHERE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function applyAtmosphere(id: AtmosphereId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.atmosphere = id;
}

export function atmosphereMeta(id: AtmosphereId): AtmosphereOption {
  return ATMOSPHERES.find((a) => a.id === id) ?? ATMOSPHERES[0];
}
