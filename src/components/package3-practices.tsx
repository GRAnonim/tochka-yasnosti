"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WheelChartCard } from "@/components/wheel-chart";
import {
  playBreathPhaseCue,
  unlockBreathAudio,
} from "@/lib/breath-audio";
import {
  BREATH_DURATIONS,
  BREATH_RHYTHMS,
  loadBreathSettings,
  PRACTICE_META,
  saveBreathSettings,
  WHEEL_AREAS,
  type BreathRhythmId,
} from "@/lib/practices";
import type { BreathDurationSec, WheelPractice } from "@/lib/types";

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

  const previewEntry = useMemo<WheelPractice | null>(() => {
    if (!ready) return null;
    return {
      id: "preview",
      kind: "wheel",
      scores: WHEEL_AREAS.map((area) => ({
        areaId: area.id,
        label: area.label,
        score: scores[area.id] ?? 0,
      })),
      focusNote: focusNote.trim(),
      createdAt: new Date().toISOString(),
    };
  }, [ready, scores, focusNote]);

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
                      ? "h-8 rounded-lg bg-[var(--primary)] text-xs font-medium text-[var(--primary-foreground)]"
                      : "h-8 rounded-lg bg-[var(--secondary)] text-xs font-medium text-[var(--ink-soft)]"
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
        <p className="rounded-2xl bg-[var(--surface)] px-3 py-3 text-sm text-[var(--ink-soft)]">
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

      {previewEntry && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--ink-muted)]">Предпросмотр круга</p>
          <WheelChartCard entry={previewEntry} showDownload={false} />
        </div>
      )}

      <button
        type="button"
        data-testid="wheel-save"
        disabled={!ready}
        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить колесо
      </button>
    </section>
  );
}

type BreathPhase = "idle" | "running" | "done";
type BreathCycle = "inhale" | "exhale";

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
  const [cycle, setCycle] = useState<BreathCycle>("inhale");
  const [completedFull, setCompletedFull] = useState(false);
  const [rhythmId, setRhythmId] = useState<BreathRhythmId>("4-6");
  const [soundOn, setSoundOn] = useState(true);
  const [settingsReady, setSettingsReady] = useState(false);
  const lastCycleRef = useRef<BreathCycle | null>(null);

  const rhythm =
    BREATH_RHYTHMS.find((r) => r.id === rhythmId) ?? BREATH_RHYTHMS[1];
  const inhaleSec = rhythm.inhale;
  const exhaleSec = rhythm.exhale;
  const cycleLen = inhaleSec + exhaleSec;

  useEffect(() => {
    const saved = loadBreathSettings();
    setRhythmId(saved.rhythmId);
    setSoundOn(saved.soundOn);
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    saveBreathSettings({ rhythmId, soundOn });
  }, [rhythmId, soundOn, settingsReady]);

  useEffect(() => {
    if (phase !== "running") return;
    setRemaining(durationSec);
    setCompletedFull(false);
    setCycle("inhale");
    lastCycleRef.current = null;
  }, [durationSec, phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const started = Date.now();

    const applyTick = () => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(0, durationSec - elapsed);
      setRemaining(left);

      const beat = elapsed % cycleLen;
      const next: BreathCycle = beat < inhaleSec ? "inhale" : "exhale";
      setCycle(next);

      if (lastCycleRef.current !== next) {
        lastCycleRef.current = next;
        if (soundOn) {
          playBreathPhaseCue(next);
        }
      }

      if (left <= 0) {
        setCompletedFull(true);
        setPhase("done");
      }
    };

    applyTick();
    const tick = window.setInterval(applyTick, 200);
    return () => window.clearInterval(tick);
  }, [phase, durationSec, cycleLen, inhaleSec, soundOn]);

  const expand = phase === "running" && cycle === "inhale";
  const cycleLabel =
    phase === "done" ? "Готово" : cycle === "inhale" ? "Вдох" : "Выдох";

  const startSession = async () => {
    if (soundOn) await unlockBreathAudio();
    lastCycleRef.current = null;
    setPhase("running");
  };

  return (
    <section className="space-y-4" data-testid="breath-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META.breath.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Ритм {inhaleSec} с вдох · {exhaleSec} с выдох. Можно закрыть глаза —
          мягкие сигналы подскажут фазу. Остановить можно раньше.
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

          <div
            className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3"
            data-testid="breath-settings"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-[var(--ink)]">Ритм</p>
              <p className="text-xs text-[var(--ink-muted)]">
                вдох / выдох, сек
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {BREATH_RHYTHMS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  data-testid={`breath-rhythm-${r.id}`}
                  className={
                    rhythmId === r.id
                      ? "rounded-xl bg-[var(--primary)] px-2 py-2.5 text-center text-sm font-medium text-[var(--primary-foreground)]"
                      : "rounded-xl bg-[var(--secondary)] px-2 py-2.5 text-center text-sm font-medium text-[var(--ink-soft)]"
                  }
                  onClick={() => setRhythmId(r.id)}
                >
                  <span className="block">{r.label}</span>
                  <span className="mt-0.5 block text-[10px] font-normal opacity-80">
                    {r.hint}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--ink)]">
                  Звук фаз
                </p>
                <p className="text-xs text-[var(--ink-muted)]">
                  Тихий сигнал на вдох и другой — на выдох
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                data-testid="breath-sound-toggle"
                className={
                  soundOn
                    ? "relative h-7 w-12 shrink-0 rounded-full bg-[var(--primary)] transition"
                    : "relative h-7 w-12 shrink-0 rounded-full bg-[var(--secondary)] transition"
                }
                onClick={() => setSoundOn((v) => !v)}
              >
                <span
                  className={
                    soundOn
                      ? "absolute top-0.5 left-[22px] h-6 w-6 rounded-full bg-white transition"
                      : "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition"
                  }
                />
              </button>
            </div>
            {soundOn && (
              <button
                type="button"
                data-testid="breath-sound-preview"
                className="text-left text-xs text-[var(--accent-ink)] underline-offset-2 hover:underline"
                onClick={async () => {
                  await unlockBreathAudio();
                  playBreathPhaseCue("inhale");
                  window.setTimeout(() => playBreathPhaseCue("exhale"), 700);
                }}
              >
                Прослушать сигналы
              </button>
            )}
          </div>

          <button
            type="button"
            data-testid="breath-start"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)]"
            onClick={() => void startSession()}
          >
            Начать
          </button>
        </>
      )}

      {phase === "running" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-xs text-[var(--ink-muted)]">
            {inhaleSec} с вдох · {exhaleSec} с выдох
            {soundOn ? " · звук включён" : " · без звука"}
          </p>
          <div
            className="flex h-40 w-40 items-center justify-center rounded-full ease-in-out"
            style={{
              transform: expand ? "scale(1.12)" : "scale(0.9)",
              transitionProperty: "transform",
              transitionTimingFunction: "ease-in-out",
              transitionDuration: `${expand ? inhaleSec : exhaleSec}s`,
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
