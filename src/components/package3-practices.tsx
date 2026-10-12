"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BREATH_DURATIONS,
  PRACTICE_META,
  WHEEL_AREAS,
} from "@/lib/practices";
import type { BreathDurationSec } from "@/lib/types";

export function WheelPracticeForm({
  scores,
  setScore,
  focusNote,
  setFocusNote,
  onSave,
}: {
  scores: Record<string, number>;
  setScore: (areaId: string, score: number) => void;
  focusNote: string;
  setFocusNote: (v: string) => void;
  onSave: () => void;
}) {
  const ready = WHEEL_AREAS.every((a) => (scores[a.id] ?? 0) >= 1);
  const lowest = useMemo(() => {
    if (!ready) return [];
    const ranked = WHEEL_AREAS.map((a) => ({
      ...a,
      score: scores[a.id] ?? 0,
    })).sort((x, y) => x.score - y.score);
    const min = ranked[0]?.score ?? 0;
    return ranked.filter((a) => a.score === min).slice(0, 2);
  }, [ready, scores]);

  return (
    <section className="space-y-4" data-testid="wheel-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META.wheel.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Оцените каждую сферу от 1 (совсем не устраивает) до 10 (устраивает).
          Это снимок сейчас, не приговор.
        </p>
      </div>

      <div className="space-y-4">
        {WHEEL_AREAS.map((area) => (
          <div key={area.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>{area.label}</Label>
              <span className="text-sm text-[var(--ink-muted)]">
                {scores[area.id] ?? "—"}
              </span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  data-testid={`wheel-${area.id}-${n}`}
                  className={
                    scores[area.id] === n
                      ? "h-8 rounded-md bg-[var(--primary)] text-xs font-medium text-[var(--primary-foreground)]"
                      : "h-8 rounded-md bg-[var(--secondary)] text-xs font-medium"
                  }
                  onClick={() => setScore(area.id, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {lowest.length > 0 && (
        <p className="rounded-xl bg-[var(--surface)] px-3 py-3 text-sm text-[var(--ink-soft)]">
          Сейчас ниже всего:{" "}
          {lowest.map((a) => `${a.label} (${a.score})`).join(", ")}. Можно
          коротко отметить один мягкий шаг.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="wheel-note">Куда хочу чуть больше внимания</Label>
        <Textarea
          id="wheel-note"
          data-testid="wheel-note"
          rows={3}
          value={focusNote}
          onChange={(e) => setFocusNote(e.target.value)}
          placeholder="Например: 15 минут прогулки завтра…"
        />
      </div>

      <button
        type="button"
        data-testid="wheel-save"
        disabled={!ready}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить колесо
      </button>
    </section>
  );
}

type BreathPhase = "idle" | "running" | "done";

export function BreathPracticeForm({
  durationSec,
  setDurationSec,
  notice,
  setNotice,
  onSave,
}: {
  durationSec: BreathDurationSec;
  setDurationSec: (n: BreathDurationSec) => void;
  notice: string;
  setNotice: (v: string) => void;
  onSave: (completed: boolean) => void;
}) {
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [remaining, setRemaining] = useState<number>(durationSec);
  const [cycleLabel, setCycleLabel] = useState("Вдох");
  const [completedFull, setCompletedFull] = useState(false);

  useEffect(() => {
    if (phase !== "running") return;
    setRemaining(durationSec);
    setCompletedFull(false);
  }, [durationSec, phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(
        0,
        durationSec - Math.floor((Date.now() - started) / 1000),
      );
      setRemaining(left);
      // 4s inhale / 4s exhale cycle
      const beat = Math.floor((Date.now() - started) / 1000) % 8;
      setCycleLabel(beat < 4 ? "Вдох" : "Выдох");
      if (left <= 0) {
        window.clearInterval(tick);
        setCompletedFull(true);
        setPhase("done");
        setCycleLabel("Готово");
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [phase, durationSec]);

  const expand = phase === "running" && cycleLabel === "Вдох";

  return (
    <section className="space-y-4" data-testid="breath-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META.breath.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Спокойный ритм: примерно 4 секунды вдох и 4 секунды выдох. Можно
          остановить раньше.
        </p>
      </div>

      {phase === "idle" && (
        <>
          <div className="grid gap-2">
            {BREATH_DURATIONS.map((d) => (
              <button
                type="button"
                key={d.sec}
                data-testid={`breath-duration-${d.sec}`}
                className={
                  durationSec === d.sec
                    ? "rounded-xl bg-[var(--primary)] px-4 py-3 text-left text-sm font-medium text-[var(--primary-foreground)]"
                    : "rounded-xl bg-[var(--secondary)] px-4 py-3 text-left text-sm font-medium"
                }
                onClick={() => setDurationSec(d.sec)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-testid="breath-start"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)]"
            onClick={() => setPhase("running")}
          >
            Начать
          </button>
        </>
      )}

      {phase === "running" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="flex h-40 w-40 items-center justify-center rounded-full transition-transform duration-1000 ease-in-out"
            style={{
              transform: expand ? "scale(1.12)" : "scale(0.9)",
              background:
                "color-mix(in oklab, var(--primary) 35%, white)",
            }}
            data-testid="breath-orb"
          >
            <div className="text-center">
              <p className="font-display text-xl text-[var(--ink)]">
                {cycleLabel}
              </p>
              <p className="text-sm text-[var(--ink-muted)]">{remaining} с</p>
            </div>
          </div>
          <button
            type="button"
            data-testid="breath-stop"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium"
            onClick={() => setPhase("done")}
          >
            Завершить раньше
          </button>
        </div>
      )}

      {phase === "done" && (
        <>
          <p className="rounded-xl bg-[var(--surface)] px-3 py-3 text-sm text-[var(--ink-soft)]">
            Практика завершена. Что заметили в теле или настроении?
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="breath-notice">Заметка после дыхания</Label>
            <Textarea
              id="breath-notice"
              data-testid="breath-notice"
              rows={3}
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="Например: плечи чуть мягче…"
            />
          </div>
          <button
            type="button"
            data-testid="breath-save"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)]"
            onClick={() => onSave(completedFull)}
          >
            Сохранить
          </button>
        </>
      )}
    </section>
  );
}
