"use client";

import type { ReactNode } from "react";
import { PracticeIconMark } from "@/components/practice-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_TAGS,
  EMOTION_TAGS,
  MOOD_OPTIONS,
  PRACTICE_MENU_GROUPS,
  PRACTICE_META,
  formatPracticeDate,
  moodLabel,
} from "@/lib/practices";
import type {
  AbcPractice,
  BreathPractice,
  EmotionsPractice,
  FiveWhysPractice,
  GratitudePractice,
  IdealDayPractice,
  MoodLevel,
  MoodPractice,
  PracticeEntry,
  QuestionsPractice,
  WheelPractice,
} from "@/lib/types";

function Chip({
  active,
  children,
  onClick,
  testId,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]"
          : "rounded-full bg-[var(--secondary)] px-3 py-1.5 text-sm text-[var(--secondary-foreground)]"
      }
    >
      {children}
    </button>
  );
}

export type PracticeMenuKey =
  | "mood"
  | "gratitude"
  | "emotions"
  | "questions"
  | "abc"
  | "wheel"
  | "breath"
  | "ideal-day"
  | "five-whys"
  | "decision";

export function PracticesMenu({
  onOpen,
  onLog,
}: {
  onOpen: (screen: PracticeMenuKey) => void;
  onLog: () => void;
}) {
  return (
    <section className="space-y-5" data-testid="practices-menu">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">Практики</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Короткий список по смыслу — выберите, что нужно сейчас.
        </p>
      </div>

      <div className="space-y-5">
        {PRACTICE_MENU_GROUPS.map((group) => (
          <div key={group.id} className="space-y-2">
            <p className="px-0.5 text-[11px] font-medium tracking-[0.08em] text-[var(--ink-muted)] uppercase">
              {group.title}
            </p>
            <div className="grid gap-1.5">
              {group.items.map((key) => {
                const meta = PRACTICE_META[key];
                return (
                  <button
                    type="button"
                    key={key}
                    data-testid={`practice-${key}`}
                    className="practice-tile flex w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-3 text-left transition hover:border-[var(--accent)]"
                    onClick={() => onOpen(key)}
                  >
                    <PracticeIconMark name={key} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-[var(--ink)]">
                        {meta.title}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-[var(--ink-muted)]">
                        {meta.blurb}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 text-[var(--ink-muted)] opacity-50"
                    >
                      ›
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="practice-log"
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium text-[var(--ink)]"
        onClick={onLog}
      >
        <PracticeIconMark
          name="log"
          className="h-9 w-9 rounded-xl bg-[color-mix(in_oklab,white_55%,transparent)]"
        />
        Журнал практик
      </button>
    </section>
  );
}

export function MoodPracticeForm({
  mood,
  setMood,
  activities,
  setActivities,
  note,
  setNote,
  onSave,
}: {
  mood: MoodLevel | null;
  setMood: (m: MoodLevel) => void;
  activities: string[];
  setActivities: (a: string[]) => void;
  note: string;
  setNote: (n: string) => void;
  onSave: () => void;
}) {
  const toggle = (tag: string) => {
    setActivities(
      activities.includes(tag)
        ? activities.filter((t) => t !== tag)
        : [...activities, tag],
    );
  };

  return (
    <section className="space-y-4" data-testid="mood-form">
      <h2 className="font-display text-xl text-[var(--ink)]">
        {PRACTICE_META.mood.title}
      </h2>
      <p className="text-sm text-[var(--ink-muted)]">
        Как общий фон прямо сейчас?
      </p>
      <div className="grid gap-2">
        {MOOD_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            data-testid={`mood-${opt.value}`}
            className={
              mood === opt.value
                ? "rounded-xl bg-[var(--primary)] px-4 py-3 text-left text-sm font-medium text-[var(--primary-foreground)]"
                : "rounded-xl bg-[var(--secondary)] px-4 py-3 text-left text-sm font-medium"
            }
            onClick={() => setMood(opt.value)}
          >
            {opt.hint}. {opt.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Чем были заняты? (по желанию)</Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TAGS.map((tag) => (
            <Chip
              key={tag}
              testId={`activity-${tag}`}
              active={activities.includes(tag)}
              onClick={() => toggle(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mood-note">Короткая заметка</Label>
        <Textarea
          id="mood-note"
          data-testid="mood-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Что повлияло на настроение…"
        />
      </div>
      <button
        type="button"
        data-testid="mood-save"
        disabled={mood === null}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить
      </button>
    </section>
  );
}

export function GratitudePracticeForm({
  items,
  setItem,
  onSave,
}: {
  items: [string, string, string];
  setItem: (index: number, value: string) => void;
  onSave: () => void;
}) {
  const filled = items.filter((i) => i.trim()).length;
  return (
    <section className="space-y-4" data-testid="gratitude-form">
      <h2 className="font-display text-xl text-[var(--ink)]">
        {PRACTICE_META.gratitude.title}
      </h2>
      <p className="text-sm text-[var(--ink-muted)]">
        Запишите 1–3 вещи — даже совсем маленькие.
      </p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-1.5">
          <Label htmlFor={`gratitude-${i}`}>Пункт {i + 1}</Label>
          <Input
            id={`gratitude-${i}`}
            data-testid={`gratitude-${i}`}
            value={items[i]}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={
              i === 0
                ? "Например: тёплый чай утром"
                : i === 1
                  ? "Например: сообщение от друга"
                  : "Опционально"
            }
          />
        </div>
      ))}
      <button
        type="button"
        data-testid="gratitude-save"
        disabled={filled < 1}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить
      </button>
    </section>
  );
}

export function EmotionsPracticeForm({
  emotions,
  setEmotions,
  intensity,
  setIntensity,
  note,
  setNote,
  onSave,
}: {
  emotions: string[];
  setEmotions: (e: string[]) => void;
  intensity: MoodLevel | null;
  setIntensity: (n: MoodLevel) => void;
  note: string;
  setNote: (n: string) => void;
  onSave: () => void;
}) {
  const toggle = (tag: string) => {
    setEmotions(
      emotions.includes(tag)
        ? emotions.filter((t) => t !== tag)
        : [...emotions, tag],
    );
  };

  return (
    <section className="space-y-4" data-testid="emotions-form">
      <h2 className="font-display text-xl text-[var(--ink)]">
        {PRACTICE_META.emotions.title}
      </h2>
      <p className="text-sm text-[var(--ink-muted)]">
        Какие чувства заметны сейчас? Можно выбрать несколько.
      </p>
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map((tag) => (
          <Chip
            key={tag}
            testId={`emotion-${tag}`}
            active={emotions.includes(tag)}
            onClick={() => toggle(tag)}
          >
            {tag}
          </Chip>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Насколько сильно (1–5)</Label>
        <div className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((n) => (
            <button
              type="button"
              key={n}
              data-testid={`intensity-${n}`}
              className={
                intensity === n
                  ? "h-11 rounded-xl bg-[var(--primary)] text-sm font-medium text-[var(--primary-foreground)]"
                  : "h-11 rounded-xl bg-[var(--secondary)] text-sm font-medium"
              }
              onClick={() => setIntensity(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="emotion-note">Контекст (по желанию)</Label>
        <Textarea
          id="emotion-note"
          data-testid="emotion-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="С чем связано…"
        />
      </div>
      <button
        type="button"
        data-testid="emotions-save"
        disabled={emotions.length === 0 || intensity === null}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить
      </button>
    </section>
  );
}

function practiceSummary(entry: PracticeEntry): string {
  if (entry.kind === "mood") {
    const mood = entry as MoodPractice;
    const acts = mood.activities.length
      ? ` · ${mood.activities.slice(0, 3).join(", ")}`
      : "";
    return `${moodLabel(mood.mood)}${acts}`;
  }
  if (entry.kind === "gratitude") {
    const g = entry as GratitudePractice;
    return g.items.join("; ");
  }
  if (entry.kind === "emotions") {
    const e = entry as EmotionsPractice;
    return `${e.emotions.join(", ")} · сила ${e.intensity}`;
  }
  if (entry.kind === "abc") {
    const a = entry as AbcPractice;
    return `A: ${a.activating} · B: ${a.beliefs}`;
  }
  if (entry.kind === "questions") {
    const q = entry as QuestionsPractice;
    return `${q.topicLabel}: ${q.answers[0]?.answer ?? ""}`;
  }
  if (entry.kind === "wheel") {
    const w = entry as WheelPractice;
    const avg =
      w.scores.reduce((sum, s) => sum + s.score, 0) /
      Math.max(w.scores.length, 1);
    const low = [...w.scores].sort((a, b) => a.score - b.score)[0];
    return `среднее ${avg.toFixed(1)} · ниже всего: ${low?.label ?? "—"} (${low?.score ?? "—"})`;
  }
  if (entry.kind === "breath") {
    const b = entry as BreathPractice;
    return `${Math.round(b.durationSec / 60)} мин · ${b.completed ? "до конца" : "остановлено раньше"}${b.notice ? ` · ${b.notice}` : ""}`;
  }
  if (entry.kind === "ideal-day") {
    const d = entry as IdealDayPractice;
    return `${d.horizon}: ${d.smallStep}`;
  }
  const f = entry as FiveWhysPractice;
  return `${f.starting} → ${f.steps.length} «почему» · нужно: ${f.needNow}`;
}

export function PracticeLog({
  entries,
  onOpenWheel,
}: {
  entries: PracticeEntry[];
  onOpenWheel?: (id: string) => void;
}) {
  return (
    <section className="space-y-4" data-testid="practice-log-view">
      <h2 className="font-display text-xl text-[var(--ink)]">Журнал практик</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">
          Пока пусто — сохраните практику из меню.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const clickable = entry.kind === "wheel" && onOpenWheel;
            const body = (
              <>
                <p className="font-medium text-[var(--ink)]">
                  {PRACTICE_META[entry.kind].title}
                </p>
                <p className="mt-1 line-clamp-3 text-[var(--ink-soft)]">
                  {practiceSummary(entry)}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {formatPracticeDate(entry.createdAt)}
                  {entry.kind === "wheel" ? " · открыть круг" : ""}
                </p>
              </>
            );
            return (
              <li key={entry.id}>
                {clickable ? (
                  <button
                    type="button"
                    data-testid={`open-wheel-${entry.id}`}
                    className="w-full rounded-2xl bg-[var(--surface-strong)] px-3 py-3 text-left text-sm transition hover:border-[var(--accent)] border border-[var(--line)]"
                    onClick={() => onOpenWheel(entry.id)}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="rounded-2xl bg-[var(--surface)] px-3 py-3 text-sm">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
