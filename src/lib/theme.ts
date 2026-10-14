export type AtmosphereId = "mist" | "dusk" | "warm";

export type AtmosphereOption = {
  id: AtmosphereId;
  label: string;
  hint: string;
  /** Swatch for the picker */
  swatch: string;
  /** Telegram header / chrome color */
  telegramBg: string;
};

const ATMOSPHERE_KEY = "tochka-atmosphere-v1";

export const ATMOSPHERES: AtmosphereOption[] = [
  {
    id: "dusk",
    label: "Сумерки",
    hint: "чуть темнее, мягче для глаз",
    swatch: "#c5d4d0",
    telegramBg: "#cfdad6",
  },
  {
    id: "mist",
    label: "Туман",
    hint: "светлее и воздушнее",
    swatch: "#e4eeea",
    telegramBg: "#eef4f2",
  },
  {
    id: "warm",
    label: "Камень",
    hint: "тёплый приглушённый тон",
    swatch: "#d8d2c8",
    telegramBg: "#ddd6cb",
  },
];

const DEFAULT_ATMOSPHERE: AtmosphereId = "dusk";

function isAtmosphereId(value: unknown): value is AtmosphereId {
  return value === "mist" || value === "dusk" || value === "warm";
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
