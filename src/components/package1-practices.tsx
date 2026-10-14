"use client";

import { useState, type ReactNode } from "react";
import {
  IconGroupBody,
  IconGroupDay,
  IconGroupThoughts,
  IconStar,
  PracticeGlyph,
  PracticeIconMark,
} from "@/components/practice-icons";
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
  type MenuPracticeKey,
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

export type PracticeMenuKey = MenuPracticeKey;

function PracticeRow({
  practiceKey,
  favorite,
  onOpen,
  onToggleFavorite,
}: {
  practiceKey: MenuPracticeKey;
  favorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  const meta = PRACTICE_META[practiceKey];
  return (
    <div
      className="practice-tile flex w-full items-stretch rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)]"
      data-testid={`practice-${practiceKey}`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-2.5 px-3 py-3.5 text-left transition hover:opacity-95"
        onClick={onOpen}
      >
        <PracticeIconMark
          name={practiceKey}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[1.02rem] font-semibold leading-snug text-[var(--ink)]">
            {meta.title}
          </span>
          <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--ink-muted)]">
            {meta.blurb}
          </span>
        </span>
      </button>
      <button
        type="button"
        data-testid={`favorite-${practiceKey}`}
        aria-label={
          favorite ? "Убрать из избранного" : "Добавить в избранное"
        }
        aria-pressed={favorite}
        className={
          favorite
            ? "flex w-11 shrink-0 items-center justify-center text-[var(--accent-ink)]"
            : "flex w-11 shrink-0 items-center justify-center text-[var(--ink-muted)] opacity-70 hover:opacity-100"
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <IconStar filled={favorite} className="h-5 w-5" />
      </button>
    </div>
  );
}

export function PracticesMenu({
  onOpen,
  onLog,
  favorites,
  onFavoritesChange,
}: {
  onOpen: (screen: PracticeMenuKey) => void;
  onLog: () => void;
  favorites: MenuPracticeKey[];
  onFavoritesChange: (next: MenuPracticeKey[]) => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFavorite = (key: MenuPracticeKey) => {
    const next = favorites.includes(key)
      ? favorites.filter((k) => k !== key)
      : [...favorites, key];
    onFavoritesChange(next);
  };

  const groupTone: Record<string, string> = {
    day: "bg-[color-mix(in_oklab,#d8ebe4_55%,white)] border-[color-mix(in_oklab,var(--primary)_22%,transparent)]",
    thoughts:
      "bg-[color-mix(in_oklab,#d9e4ec_55%,white)] border-[color-mix(in_oklab,#7aa3ae_28%,transparent)]",
    body: "bg-[color-mix(in_oklab,#e4eee6_55%,white)] border-[color-mix(in_oklab,#8eb8a8_28%,transparent)]",
  };

  const groupIcon = {
    day: IconGroupDay,
    thoughts: IconGroupThoughts,
    body: IconGroupBody,
  } as const;

  const startHere: {
    key: MenuPracticeKey;
    why: string;
  }[] = [
    { key: "breath", why: "Если тяжело в теле — 1 минута дыхания" },
    { key: "mood", why: "Если просто нужно назвать фон дня" },
    { key: "abc", why: "Если мысли крутятся по кругу" },
  ];

  return (
    <section
      className="-mx-1 space-y-4 sm:-mx-2"
      data-testid="practices-menu"
    >
      <div className="px-0.5">
        <h2 className="font-display text-lg text-[var(--ink)]">Практики</h2>
        <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">
          Можно начать с короткого шага ниже — или открыть раздел.
        </p>
      </div>

      <div
        className="space-y-2 rounded-2xl border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] bg-[color-mix(in_oklab,var(--primary)_6%,white)] p-2.5"
        data-testid="practices-start-here"
      >
        <p className="px-1 text-[0.78rem] font-medium tracking-[0.07em] text-[var(--ink-muted)] uppercase">
          Начни здесь
        </p>
        <div className="grid gap-1.5">
          {startHere.map((item) => (
            <button
              type="button"
              key={item.key}
              data-testid={`start-here-${item.key}`}
              className="flex w-full items-center gap-3 rounded-xl bg-[color-mix(in_oklab,white_78%,transparent)] px-3 py-2.5 text-left transition hover:opacity-95"
              onClick={() => onOpen(item.key)}
            >
              <PracticeIconMark name={item.key} className="h-9 w-9" />
              <span className="min-w-0 flex-1">
                <span className="block text-[1rem] font-semibold text-[var(--ink)]">
                  {PRACTICE_META[item.key].title}
                </span>
                <span className="mt-0.5 block text-[0.9rem] leading-snug text-[var(--ink-muted)]">
                  {item.why}
                </span>
              </span>
              <span className="text-[var(--ink-muted)]" aria-hidden>
                ›
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        {PRACTICE_MENU_GROUPS.map((group) => {
          const open = Boolean(openGroups[group.id]);
          const GroupIcon =
            groupIcon[group.id as keyof typeof groupIcon] ?? IconGroupDay;
          return (
            <div
              key={group.id}
              className={`overflow-hidden rounded-2xl border ${groupTone[group.id] ?? "border-[var(--line)] bg-[var(--surface)]"}`}
              data-testid={`practice-group-${group.id}`}
            >
              <button
                type="button"
                data-testid={`practice-group-toggle-${group.id}`}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-4 text-left"
                aria-expanded={open}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,white_72%,transparent)] text-[var(--accent-ink)]">
                    <GroupIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[1.05rem] font-semibold text-[var(--ink)]">
                      {group.title}
                    </span>
                    <span className="mt-1 block text-[0.95rem] text-[var(--ink-muted)]">
                      {group.items.length} практики
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,white_70%,transparent)] text-[var(--ink-muted)] transition-transform"
                  style={{
                    transform: open ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  ›
                </span>
              </button>
              {open && (
                <div className="space-y-0 border-t border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-[color-mix(in_oklab,white_72%,transparent)] px-2 py-2">
                  {group.items.map((key, index) => (
                    <div
                      key={key}
                      className={
                        index > 0
                          ? "mt-2 border-t border-[color-mix(in_oklab,var(--ink)_8%,transparent)] pt-2"
                          : undefined
                      }
                    >
                      <PracticeRow
                        practiceKey={key}
                        favorite={favorites.includes(key)}
                        onOpen={() => onOpen(key)}
                        onToggleFavorite={() => toggleFavorite(key)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        data-testid="practice-log"
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[color-mix(in_oklab,var(--primary)_20%,transparent)] bg-[color-mix(in_oklab,var(--primary)_8%,white)] px-4 text-[1.02rem] font-medium text-[var(--ink)]"
        onClick={onLog}
      >
        <PracticeGlyph name="log" className="h-5 w-5 text-[var(--accent-ink)]" />
        Журнал практик
      </button>

      {favorites.length > 0 && (
        <div
          className="space-y-2 rounded-2xl border border-[color-mix(in_oklab,var(--primary)_20%,transparent)] bg-[color-mix(in_oklab,var(--primary)_8%,white)] p-2.5"
          data-testid="favorites-in-menu"
        >
          <div className="flex items-center gap-2 px-1">
            <IconStar filled className="h-4 w-4 text-[var(--accent-ink)]" />
            <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--ink-muted)] uppercase">
              Избранное
            </p>
          </div>
          <div className="grid gap-2">
            {favorites.map((key) => (
              <PracticeRow
                key={key}
                practiceKey={key}
                favorite
                onOpen={() => onOpen(key)}
                onToggleFavorite={() => toggleFavorite(key)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Quick favorites on the home screen */
export function HomeFavorites({
  favorites,
  onOpen,
}: {
  favorites: MenuPracticeKey[];
  onOpen: (key: MenuPracticeKey) => void;
}) {
  if (favorites.length === 0) return null;
  return (
    <div className="space-y-2" data-testid="home-favorites">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-[var(--ink)]">Избранное</h2>
        <span className="text-xs text-[var(--ink-muted)]">частое</span>
      </div>
      <div className="grid gap-1.5">
        {favorites.map((key) => (
          <button
            type="button"
            key={key}
            data-testid={`home-favorite-${key}`}
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-3 text-left transition hover:border-[var(--accent)]"
            onClick={() => onOpen(key)}
          >
            <PracticeIconMark name={key} />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-[var(--ink)]">
                {PRACTICE_META[key].title}
              </span>
            </span>
            <IconStar filled className="h-4 w-4 shrink-0 text-[var(--accent-ink)]" />
          </button>
        ))}
      </div>
    </div>
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
