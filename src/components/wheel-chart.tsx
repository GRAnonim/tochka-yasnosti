"use client";

import { useRef, useState } from "react";
import type { WheelPractice } from "@/lib/types";
import {
  WHEEL_CHART_COLORS,
  WHEEL_LAYOUT,
  buildWheelChartModel,
  downloadSvgAsPng,
  wheelCaptionDate,
  wheelFileDate,
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
  const model = buildWheelChartModel(entry.scores);
  const c = WHEEL_CHART_COLORS;
  const dateLabel = wheelCaptionDate(entry.createdAt);
  const { width, height, titleY, subtitleY, dateY } = {
    width: model.width,
    height: model.height,
    ...WHEEL_LAYOUT,
  };

  const onDownload = async () => {
    if (!svgRef.current) return;
    setBusy(true);
    setError(null);
    try {
      await downloadSvgAsPng(
        svgRef.current,
        `tochka-koleso-${wheelFileDate(entry.createdAt)}.png`,
      );
    } catch {
      setError("Не получилось скачать. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
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
            {busy ? "Готовим файл…" : "Скачать круг (PNG)"}
          </button>
          <p className="text-center text-xs text-[var(--ink-muted)]">
            Сохраните снимок, чтобы потом сравнить с новым колесом.
          </p>
          {error && (
            <p className="text-center text-xs text-[var(--danger-soft)]">
              {error}
            </p>
          )}
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
          Снимок на дату ниже. Можно скачать и позже сравнить с новым.
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
