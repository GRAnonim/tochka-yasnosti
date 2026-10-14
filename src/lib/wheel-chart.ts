import type { WheelScore } from "./types";
import { formatPracticeDate } from "./practices";

export type WheelChartColors = {
  ink: string;
  muted: string;
  soft: string;
  fill: string;
  stroke: string;
  grid: string;
  bg: string;
};

export const WHEEL_CHART_COLORS: WheelChartColors = {
  ink: "#2a3f45",
  muted: "#6a858c",
  soft: "#3d5a61",
  fill: "rgba(95, 158, 149, 0.38)",
  stroke: "#4f8f87",
  grid: "rgba(74, 108, 114, 0.22)",
  bg: "#f3f7f6",
};

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function labelLines(label: string): string[] {
  if (label.includes(" / ")) return label.split(" / ").map((p) => p.trim());
  if (label.length > 16) return [`${label.slice(0, 14)}…`];
  return [label];
}

/** Keep title + date in the header, wheel labels below it. */
export const WHEEL_LAYOUT = {
  width: 360,
  titleY: 26,
  subtitleY: 46,
  dateY: 64,
  headerBottom: 112,
  maxR: 100,
  labelR: 134,
  footer: 52,
};

export function buildWheelChartModel(scores: WheelScore[]) {
  const n = scores.length;
  const { width, headerBottom, maxR, labelR, footer } = WHEEL_LAYOUT;
  const cx = width / 2;
  const cy = headerBottom + labelR;
  const height = cy + labelR + footer;
  const start = -Math.PI / 2;

  const points = scores.map((s, i) => {
    const angle = start + (i * 2 * Math.PI) / n;
    const r = (Math.max(0, Math.min(10, s.score)) / 10) * maxR;
    return { ...polar(cx, cy, r, angle), angle, label: s.label, score: s.score };
  });

  const polygon = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const rings = [2, 4, 6, 8, 10].map((level) => ({
    level,
    r: (level / 10) * maxR,
  }));

  const axes = scores.map((s, i) => {
    const angle = start + (i * 2 * Math.PI) / n;
    const outer = polar(cx, cy, maxR, angle);
    const labelPos = polar(cx, cy, labelR, angle);
    return {
      label: s.label,
      lines: labelLines(s.label),
      score: s.score,
      outer,
      labelPos,
      angle,
    };
  });

  return { size: width, width, height, cx, cy, maxR, polygon, rings, axes, points };
}

export function wheelFileDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date(iso))
      .replace(/[^\d.]/g, "-")
      .replace(/\./g, "-");
  } catch {
    return "date";
  }
}

export function wheelCaptionDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return formatPracticeDate(iso);
  }
}

export type WheelPng = {
  blob: Blob;
  dataUrl: string;
  file: File;
};

/** Phone / Telegram WebView: silent <a download> does not put a photo in the gallery. */
export function prefersGallerySave(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  try {
    if (window.matchMedia?.("(pointer: coarse)").matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function canSharePngFile(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  try {
    if (typeof navigator.canShare === "function") {
      return navigator.canShare({ files: [file] });
    }
    return true;
  } catch {
    return false;
  }
}

export async function sharePngFile(
  file: File,
): Promise<"shared" | "aborted" | "unavailable"> {
  if (!canSharePngFile(file)) return "unavailable";
  try {
    await navigator.share({
      files: [file],
      title: "Колесо баланса",
      text: "Точка ясности",
    });
    return "shared";
  } catch (err) {
    const name =
      err && typeof err === "object" && "name" in err
        ? String((err as { name: string }).name)
        : "";
    if (name === "AbortError") return "aborted";
    return "unavailable";
  }
}

/** Desktop / files app fallback. Telegram Mini App usually ignores this. */
export function triggerPngDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

/** Rasterize an SVG element to a PNG blob + data URL for gallery save. */
export async function rasterizeSvgToPng(
  svg: SVGSVGElement,
  filename: string,
): Promise<WheelPng> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  const width = Number(svg.getAttribute("width") || 360);
  const height = Number(svg.getAttribute("height") || 420);

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Не удалось подготовить изображение"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas недоступен");
  }
  ctx.scale(2, 2);
  ctx.fillStyle = WHEEL_CHART_COLORS.bg;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/png");
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => {
      if (next) resolve(next);
      else reject(new Error("Не удалось собрать PNG"));
    }, "image/png");
  });
  const file = new File([blob], filename, { type: "image/png" });
  return { blob, dataUrl, file };
}
