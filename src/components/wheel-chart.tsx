"use client";

import { useEffect, useRef, useState } from "react";
import type { WheelPractice } from "@/lib/types";
import { isInsideTelegram } from "@/lib/telegram";
import {
  WHEEL_CHART_COLORS,
  WHEEL_LAYOUT,
  buildWheelChartModel,
  canSharePngFile,
  prefersGallerySave,
  rasterizeSvgToPng,
  sharePngFile,
  triggerPngDownload,
  wheelCaptionDate,
  wheelFileDate,
  type WheelPng,
} from "@/lib/wheel-chart";

export function WheelChartCard({
  entry,
  showDownload = true,
}: {
  entry: WheelPractice;
  showDownload?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [png, setPng] = useState<WheelPng | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const model = buildWheelChartModel(entry.scores);
  const c = WHEEL_CHART_COLORS;
  const dateLabel = wheelCaptionDate(entry.createdAt);
  const filename = `tochka-koleso-${wheelFileDate(entry.createdAt)}.png`;
  const { width, height } = model;
  const { titleY, subtitleY, dateY } = WHEEL_LAYOUT;

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const preparePng = async (): Promise<WheelPng> => {
    if (!svgRef.current) {
      throw new Error("Круг ещё не готов");
    }
    const next = await rasterizeSvgToPng(svgRef.current, filename);
    setPng(next);
    return next;
  };

  const onSharePrepared = async (prepared: WheelPng) => {
    const result = await sharePngFile(prepared.file);
    if (result === "shared") {
      setStatus("В меню выберите «Сохранить изображение», чтобы фото попало в галерею.");
      return result;
    }
    if (result === "aborted") {
      setStatus("Можно зажать фото ниже и сохранить его в галерею.");
      return result;
    }
    return result;
  };

  const onDownload = async () => {
    if (!svgRef.current) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const prepared = await preparePng();
      setSheetOpen(true);
      if (canSharePngFile(prepared.file)) {
        const shared = await onSharePrepared(prepared);
        if (shared === "unavailable") {
          setStatus("Зажмите фото и выберите «Сохранить изображение».");
        }
        return;
      }
      if (prefersGallerySave() || isInsideTelegram()) {
        setStatus("Зажмите фото и выберите «Сохранить изображение».");
        return;
      }
      triggerPngDownload(prepared.blob, filename);
      setStatus(
        "Файл ушёл в загрузки. На телефоне зажмите фото, чтобы сохранить в галерею.",
      );
    } catch {
      setError("Не получилось подготовить фото. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const onShareClick = async () => {
    if (!png) return;
    setBusy(true);
    setError(null);
    try {
      const shared = await onSharePrepared(png);
      if (shared === "unavailable") {
        triggerPngDownload(png.blob, filename);
        setStatus("Файл ушёл в загрузки. Если его нет в галерее, зажмите фото выше.");
      }
    } catch {
      setError("Не получилось поделиться. Зажмите фото и сохраните его вручную.");
    } finally {
      setBusy(false);
    }
  };

  const onFileDownload = () => {
    if (!png) return;
    triggerPngDownload(png.blob, filename);
    setStatus("Файл ушёл в загрузки. В Telegram это не галерея: зажмите фото выше.");
  };

  return (
    <div
      className="wheel-card space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-3"
      data-testid="wheel-chart-card"
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Колесо баланса от ${dateLabel}`}
        className="mx-auto h-auto w-full max-w-[360px]"
        data-testid="wheel-chart-svg"
      >
        <rect width={width} height={height} fill={c.bg} rx="24" />
        <text
          x={width / 2}
          y={titleY}
          textAnchor="middle"
          fill={c.ink}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="18"
          fontWeight="600"
        >
          Точка ясности
        </text>
        <text
          x={width / 2}
          y={subtitleY}
          textAnchor="middle"
          fill={c.muted}
          fontFamily="system-ui, sans-serif"
          fontSize="13"
        >
          Колесо баланса
        </text>
        <text
          x={width / 2}
          y={dateY}
          textAnchor="middle"
          fill={c.muted}
          fontFamily="system-ui, sans-serif"
          fontSize="12"
          data-testid="wheel-chart-date"
        >
          {dateLabel}
        </text>

        {model.rings.map((ring) => (
          <circle
            key={ring.level}
            cx={model.cx}
            cy={model.cy}
            r={ring.r}
            fill="none"
            stroke={c.grid}
            strokeWidth="1"
          />
        ))}
        {model.axes.map((axis) => (
          <line
            key={axis.label}
            x1={model.cx}
            y1={model.cy}
            x2={axis.outer.x}
            y2={axis.outer.y}
            stroke={c.grid}
            strokeWidth="1"
          />
        ))}
        <polygon
          points={model.polygon}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {model.points.map((p) => (
          <circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill={c.stroke}
          />
        ))}
        {model.axes.map((axis) => {
          const lines = axis.lines;
          const lineH = 12;
          const startY = axis.labelPos.y - ((lines.length - 1) * lineH) / 2;
          return (
            <text
              key={`label-${axis.label}`}
              x={axis.labelPos.x}
              y={startY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={c.soft}
              fontFamily="system-ui, sans-serif"
              fontSize="11"
            >
              {lines.map((line, i) => (
                <tspan
                  key={line}
                  x={axis.labelPos.x}
                  dy={i === 0 ? 0 : lineH}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

        {entry.focusNote ? (
          <text
            x={width / 2}
            y={height - 22}
            textAnchor="middle"
            fill={c.muted}
            fontFamily="system-ui, sans-serif"
            fontSize="11"
          >
            {entry.focusNote.length > 52
              ? `${entry.focusNote.slice(0, 50)}…`
              : entry.focusNote}
          </text>
        ) : null}
      </svg>

      {showDownload && (
        <div className="space-y-2 px-1 pb-1">
          <button
            type="button"
            data-testid="wheel-download"
            disabled={busy}
            onClick={onDownload}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {busy ? "Готовим фото…" : "Сохранить круг"}
          </button>
          <p className="text-center text-xs text-[var(--ink-muted)]">
            На телефоне откроется меню или само фото: сохраните его в галерею,
            чтобы потом сравнить с новым колесом.
          </p>
          {error && (
            <p className="text-center text-xs text-[var(--danger-soft)]">
              {error}
            </p>
          )}
          {status && !sheetOpen && (
            <p className="text-center text-xs text-[var(--ink-soft)]">{status}</p>
          )}
        </div>
      )}

      {sheetOpen && png && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_oklab,black_42%,transparent)] p-3 sm:items-center"
          style={{
            paddingTop: "max(12px, var(--app-safe-top))",
            paddingBottom: "max(12px, var(--app-safe-bottom))",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wheel-save-title"
          data-testid="wheel-save-sheet"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="max-h-full w-full max-w-[420px] overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="wheel-save-title"
              className="font-display text-lg text-[var(--ink)]"
            >
              Сохранить в галерею
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
              Зажмите фото на секунду и выберите «Сохранить изображение» или
              «Добавить в Фото». Так снимок попадает в галерею, а не только в
              загрузки.
            </p>
            <img
              src={png.dataUrl}
              alt={`Колесо баланса от ${dateLabel}`}
              className="wheel-save-photo mt-3 w-full rounded-2xl"
              data-testid="wheel-save-photo"
              draggable
            />
            {status && (
              <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">
                {status}
              </p>
            )}
            <div className="mt-3 grid gap-2">
              {canSharePngFile(png.file) && (
                <button
                  type="button"
                  data-testid="wheel-share"
                  disabled={busy}
                  onClick={onShareClick}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
                >
                  Поделиться, чтобы сохранить
                </button>
              )}
              <button
                type="button"
                data-testid="wheel-file-download"
                onClick={onFileDownload}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium"
              >
                Скачать файл
              </button>
              <button
                type="button"
                data-testid="wheel-save-close"
                onClick={() => setSheetOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm text-[var(--accent-ink)]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WheelResultView({
  entry,
  onJournal,
  onHome,
}: {
  entry: WheelPractice;
  onJournal: () => void;
  onHome: () => void;
}) {
  return (
    <section className="space-y-4" data-testid="wheel-result">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          Ваше колесо
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Снимок на дату ниже. Можно сохранить в галерею и позже сравнить с новым.
        </p>
      </div>
      <WheelChartCard entry={entry} />
      <div className="grid gap-2">
        <button
          type="button"
          data-testid="wheel-to-log"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium"
          onClick={onJournal}
        >
          Дальше
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm text-[var(--accent-ink)]"
          onClick={onHome}
        >
          На главную
        </button>
      </div>
    </section>
  );
}
