"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WheelChartCard } from "@/components/wheel-chart";
import {
  PracticeCard,
  PracticeChoice,
  PracticeHeader,
  PracticeSave,
} from "@/components/practice-ui";
import {
  playBreathPhaseCue,
  unlockBreathAudio,
} from "@/lib/breath-audio";
import {
  BREATH_DURATIONS,
  BREATH_RHYTHMS,
  loadBreathSettings,
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
    <section className="practice-sheet" data-testid="wheel-form">
      <PracticeHeader
        practiceKey="wheel"
        intro="Оцените каждую сферу от 1 (совсем не устраивает) до 10 (устраивает). Это снимок сейчас, не приговор."
      />

      {WHEEL_AREAS.map((area, index) => {
        const value = scores[area.id] ?? 0;
        return (
          <PracticeCard
            key={area.id}
            step={index + 1}
            title={area.label}
            hint={value ? `${value} из 10` : "Ещё не отмечено"}
          >
            <div className="practice-fill">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  data-testid={`wheel-${area.id}-${n}`}
                  data-on={n <= value ? "true" : "false"}
                  data-current={value === n ? "true" : "false"}
                  className="practice-fill-cell"
                  onClick={() => setScore(area.id, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </PracticeCard>
        );
      })}

      {lowest.length > 0 && (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
          Сейчас ниже всего:{" "}
          {lowest.map((a) => `${a.label} (${a.score})`).join(", ")}. Можно
          коротко отметить один мягкий шаг.
        </p>
      )}

      <PracticeCard
        title="Куда хочу чуть больше внимания"
        hint="Один маленький шаг, по желанию"
      >
        <Label htmlFor="wheel-note" className="sr-only">
          Куда хочу чуть больше внимания
        </Label>
        <Textarea
          id="wheel-note"
          data-testid="wheel-note"
          rows={3}
          className="min-h-[5.5rem]"
          value={focusNote}
          onChange={(e) => setFocusNote(e.target.value)}
          placeholder="Например: 15 минут прогулки завтра"
        />
      </PracticeCard>

      {previewEntry && (
        <PracticeCard title="Предпросмотр круга">
          <WheelChartCard entry={previewEntry} showDownload={false} />
        </PracticeCard>
      )}

      <PracticeSave testId="wheel-save" disabled={!ready} onClick={onSave}>
        Сохранить колесо
      </PracticeSave>
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
    <section className="practice-sheet" data-testid="breath-form">
      <PracticeHeader
        practiceKey="breath"
        intro={`Ритм ${inhaleSec} с вдох, ${exhaleSec} с выдох. Можно закрыть глаза: мягкие сигналы подскажут фазу. Остановить можно раньше.`}
      />

      {phase === "idle" && (
        <>
          <PracticeCard step={1} title="Сколько времени" hint="Короче часто лучше">
            <div className="grid gap-2">
              {BREATH_DURATIONS.map((d) => (
                <PracticeChoice
                  key={d.sec}
                  testId={`breath-duration-${d.sec}`}
                  active={durationSec === d.sec}
                  onClick={() => setDurationSec(d.sec)}
                  title={d.label}
                />
              ))}
            </div>
          </PracticeCard>

          <div
            className="practice-card space-y-3"
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
                  data-active={rhythmId === r.id ? "true" : "false"}
                  className="practice-chip w-full flex-col justify-center rounded-xl px-2 py-2.5 text-center"
                  onClick={() => setRhythmId(r.id)}
                >
                  <span className="block text-[0.98rem] font-semibold">
                    {r.label}
                  </span>
                  <span className="mt-0.5 block text-[0.72rem] font-normal opacity-80">
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
                  Тихий сигнал на вдох и другой на выдох
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

          <PracticeSave testId="breath-start" onClick={() => void startSession()}>
            Начать
          </PracticeSave>
        </>
      )}

      {phase === "running" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-6">
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
          <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
            Практика завершена. Что заметили в теле или настроении?
          </p>
          <PracticeCard title="Заметка после дыхания" hint="По желанию">
            <Label htmlFor="breath-notice" className="sr-only">
              Заметка после дыхания
            </Label>
            <Textarea
              id="breath-notice"
              data-testid="breath-notice"
              rows={3}
              className="min-h-[5.5rem]"
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="Например: плечи чуть мягче"
            />
          </PracticeCard>
          <PracticeSave
            testId="breath-save"
            onClick={() => onSave(completedFull)}
          >
            Сохранить
          </PracticeSave>
        </>
      )}
    </section>
  );
}
