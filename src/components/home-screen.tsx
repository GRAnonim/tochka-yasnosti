"use client";

import { useState } from "react";
import { HomeFavorites } from "@/components/package1-practices";
import { PracticeGlyph } from "@/components/practice-icons";
import { Textarea } from "@/components/ui/textarea";
import { DECISION_LABELS } from "@/lib/questions";
import type { MenuPracticeKey } from "@/lib/practices";
import type { SituationRecord } from "@/lib/types";

export type HomeVariant = "a" | "b" | "c" | "d" | "e";

export const HOME_VARIANT_KEY = "tochka-home-variant-v2";

const VALID_HOME: HomeVariant[] = ["a", "b", "c", "d", "e"];

export const HOME_VARIANT_META: Record<
  HomeVariant,
  { label: string; blurb: string }
> = {
  a: {
    label: "A · меню + зелёный",
    blurb: "Разбор решения доминирует",
  },
  b: {
    label: "B · меню + тёмный",
    blurb: "Разбор всё ещё главный CTA",
  },
  c: {
    label: "C · два пути",
    blurb: "Решение и практики как два входа",
  },
  d: {
    label: "D · как дневник",
    blurb: "Сначала текст, потом разбор",
  },
  e: {
    label: "E · практики сначала",
    blurb: "Упражнения в центре; разбор решения наравне с ними",
  },
};

export function loadHomeVariant(): HomeVariant {
  if (typeof window === "undefined") return "e";
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("home");
    if (fromQuery && VALID_HOME.includes(fromQuery as HomeVariant)) {
      return fromQuery as HomeVariant;
    }
    const raw = window.localStorage.getItem(HOME_VARIANT_KEY);
    if (raw && VALID_HOME.includes(raw as HomeVariant)) {
      return raw as HomeVariant;
    }
  } catch {
    /* ignore */
  }
  return "e";
}

export function saveHomeVariant(v: HomeVariant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HOME_VARIANT_KEY, v);
}

type Props = {
  variant: HomeVariant;
  onVariantChange: (v: HomeVariant) => void;
  goalsLabel: string;
  favorites: MenuPracticeKey[];
  pendingFeedback: SituationRecord[];
  onStartDecision: (initialText?: string) => void;
  onOpenPractices: () => void;
  onOpenBreath: () => void;
  onOpenStats: () => void;
  onEditGoals: () => void;
  onOpenFavorite: (key: MenuPracticeKey) => void;
  onOpenFeedback: (id: string) => void;
  onOpenSpecialist: () => void;
  onReset: () => void;
  hasSpecialist: boolean;
  specialistName?: string;
  specialistContact?: string;
};

function GoalsLine({
  goalsLabel,
  onEditGoals,
  whisper = false,
}: {
  goalsLabel: string;
  onEditGoals: () => void;
  whisper?: boolean;
}) {
  return (
    <p
      className={
        whisper
          ? "text-[0.88rem] leading-snug text-[var(--ink-muted)]"
          : "text-[0.92rem] leading-snug text-[var(--ink-muted)]"
      }
      data-testid="home-goals"
    >
      {whisper ? "Сейчас берегу: " : "Ориентиры: "}
      <span className="text-[var(--ink-soft)]">{goalsLabel}</span>
      <span aria-hidden className="mx-1.5 text-[var(--line)]">
        ·
      </span>
      <button
        type="button"
        data-testid="edit-goals"
        className="text-[var(--accent-ink)] underline-offset-2 hover:underline"
        onClick={onEditGoals}
      >
        изменить
      </button>
    </p>
  );
}

function MoreBlock({
  variant,
  onVariantChange,
  hasSpecialist,
  specialistName,
  specialistContact,
  onOpenSpecialist,
  onReset,
}: Pick<
  Props,
  | "variant"
  | "onVariantChange"
  | "hasSpecialist"
  | "specialistName"
  | "specialistContact"
  | "onOpenSpecialist"
  | "onReset"
>) {
  return (
    <details className="border-t border-[var(--line)] pt-3 text-[0.95rem] text-[var(--ink-muted)]">
      <summary
        className="cursor-pointer list-none font-medium text-[var(--ink-soft)] marker:content-none [&::-webkit-details-marker]:hidden"
        data-testid="home-more"
      >
        Ещё
      </summary>
      <div className="mt-3 space-y-4">
        <div className="space-y-2" data-testid="home-variant-switcher">
          <p className="font-medium text-[var(--ink)]">Вариант главной</p>
          <div className="grid gap-1.5">
            {(Object.keys(HOME_VARIANT_META) as HomeVariant[]).map((key) => (
              <button
                type="button"
                key={key}
                data-testid={`home-variant-${key}`}
                className={
                  variant === key
                    ? "rounded-xl bg-[var(--ink)] px-3 py-2.5 text-left text-[0.92rem] text-[var(--primary-foreground)]"
                    : "rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-left text-[0.92rem] text-[var(--ink)]"
                }
                onClick={() => onVariantChange(key)}
              >
                <span className="font-medium">{HOME_VARIANT_META[key].label}</span>
                <span className="mt-0.5 block opacity-90">
                  {HOME_VARIANT_META[key].blurb}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-[var(--ink)]">Мой специалист</p>
          {hasSpecialist ? (
            <div className="rounded-xl bg-[var(--surface)] px-3 py-2.5">
              <p className="font-medium text-[var(--ink)]">{specialistName}</p>
              {specialistContact && (
                <p className="text-[var(--ink-soft)]">{specialistContact}</p>
              )}
            </div>
          ) : (
            <p>Пока не указан.</p>
          )}
          <button
            type="button"
            className="text-[var(--accent-ink)] underline-offset-2 hover:underline"
            onClick={onOpenSpecialist}
          >
            {hasSpecialist ? "Изменить контакты" : "Указать контакты"}
          </button>
        </div>
        <button
          type="button"
          className="clarity-link-quiet underline-offset-2 hover:underline"
          onClick={onReset}
        >
          Сбросить данные
        </button>
        <p className="leading-relaxed">
          Не ставит диагнозов и не заменяет врача или психолога. При тяжёлом
          состоянии — к специалисту.
        </p>
      </div>
    </details>
  );
}

function FeedbackBlock({
  pendingFeedback,
  onOpenFeedback,
}: {
  pendingFeedback: SituationRecord[];
  onOpenFeedback: (id: string) => void;
}) {
  if (pendingFeedback.length === 0) return null;
  return (
    <div className="space-y-2.5 border-t border-[var(--line)] pt-4">
      <h3 className="font-display text-base text-[var(--ink)]">
        Обратная связь
      </h3>
      <ul className="space-y-2">
        {pendingFeedback.slice(0, 3).map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-left transition hover:border-[var(--accent)]"
              onClick={() => onOpenFeedback(s.id)}
            >
              <span className="line-clamp-2 text-[0.98rem] text-[var(--ink)]">
                {s.text}
              </span>
              <span className="mt-0.5 block text-[0.88rem] text-[var(--ink-muted)]">
                {DECISION_LABELS[s.decision]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HomeA(props: Props) {
  return (
    <>
      <div className="space-y-4">
        <h2 className="font-display text-[1.55rem] leading-tight text-[var(--ink)] sm:text-[1.7rem]">
          Что сейчас не даёт покоя?
        </h2>
        <button
          type="button"
          data-testid="new-situation"
          className="clarity-cta-primary inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl px-4 text-[1.1rem] font-semibold transition hover:opacity-95"
          onClick={() => props.onStartDecision()}
        >
          <PracticeGlyph name="decision" className="h-5 w-5 opacity-95" />
          Разобрать решение
        </button>
        <button
          type="button"
          data-testid="open-practices"
          className="clarity-path-card flex w-full items-center gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] bg-[color-mix(in_oklab,var(--primary)_6%,white)] px-3.5 py-3.5 text-left"
          onClick={props.onOpenPractices}
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,white_72%,transparent)] text-[var(--accent-ink)]">
            <PracticeGlyph name="practices" className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[1.05rem] font-semibold text-[var(--ink)]">
              Практики для себя
            </span>
            <span className="mt-0.5 block text-[0.92rem] text-[var(--ink-muted)]">
              Когда нет решения, а есть чувство
            </span>
          </span>
        </button>
      </div>
      <GoalsLine
        goalsLabel={props.goalsLabel}
        onEditGoals={props.onEditGoals}
      />
    </>
  );
}

function HomeB(props: Props) {
  return (
    <>
      <div className="space-y-3">
        <h2 className="font-display text-[1.55rem] leading-tight text-[var(--ink)]">
          Что сейчас не даёт покоя?
        </h2>
        <GoalsLine
          goalsLabel={props.goalsLabel}
          onEditGoals={props.onEditGoals}
        />
      </div>
      <div className="space-y-3">
        <button
          type="button"
          data-testid="new-situation"
          className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--ink)] px-4 text-[1.1rem] font-semibold text-[var(--primary-foreground)]"
          onClick={() => props.onStartDecision()}
        >
          Разобрать решение
        </button>
        <button
          type="button"
          data-testid="open-practices"
          className="clarity-path-card flex w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3.5 text-left"
          onClick={props.onOpenPractices}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[1.05rem] font-semibold text-[var(--ink)]">
              Разобраться в себе
            </span>
            <span className="mt-0.5 block text-[0.92rem] text-[var(--ink-muted)]">
              Короткие практики без «надо решить»
            </span>
          </span>
        </button>
      </div>
    </>
  );
}

function HomeC(props: Props) {
  return (
    <>
      <GoalsLine
        goalsLabel={props.goalsLabel}
        onEditGoals={props.onEditGoals}
      />
      <div className="space-y-2">
        <h2 className="font-display text-[1.5rem] leading-tight text-[var(--ink)]">
          С чего начнём?
        </h2>
      </div>
      <div className="grid gap-2.5">
        <button
          type="button"
          data-testid="new-situation"
          className="flex w-full items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--ink)_16%,transparent)] bg-[var(--surface-strong)] px-3.5 py-3.5 text-left"
          onClick={() => props.onStartDecision()}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[1.08rem] font-semibold text-[var(--ink)]">
              Нужно решить
            </span>
            <span className="mt-0.5 block text-[0.92rem] text-[var(--ink-muted)]">
              Разбор выбора по шагам
            </span>
          </span>
        </button>
        <button
          type="button"
          data-testid="open-practices"
          className="flex w-full items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3.5 text-left"
          onClick={props.onOpenPractices}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[1.08rem] font-semibold text-[var(--ink)]">
              Побыть с собой
            </span>
            <span className="mt-0.5 block text-[0.92rem] text-[var(--ink-muted)]">
              Настроение, дыхание, мысли
            </span>
          </span>
        </button>
      </div>
    </>
  );
}

function EqualEntry({
  testId,
  icon,
  title,
  blurb,
  onClick,
}: {
  testId: string;
  icon: "breath" | "mood" | "decision" | "practices";
  title: string;
  blurb: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      className="flex w-full items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3.5 text-left transition hover:border-[color-mix(in_oklab,var(--ink)_18%,transparent)]"
      onClick={onClick}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--ink-soft)]">
        <PracticeGlyph name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[1.05rem] font-semibold text-[var(--ink)]">
          {title}
        </span>
        <span className="mt-0.5 block text-[0.92rem] leading-snug text-[var(--ink-muted)]">
          {blurb}
        </span>
      </span>
      <span className="mt-1 text-[var(--ink-muted)]" aria-hidden>
        ›
      </span>
    </button>
  );
}

/** E — practices first; decision is one equal peer, not the hero */
function HomeE(props: Props) {
  return (
    <div className="space-y-5" data-testid="home-practices-first">
      <div className="space-y-2">
        <h2 className="font-display text-[1.55rem] leading-tight text-[var(--ink)] sm:text-[1.7rem]">
          Практики и ясность
        </h2>
        <p className="text-[0.98rem] leading-relaxed text-[var(--ink-muted)]">
          Упражнения для себя — и разбор решения рядом, на одном уровне. Без
          главного «надо».
        </p>
      </div>

      <div className="grid gap-2.5">
        <EqualEntry
          testId="home-equal-breath"
          icon="breath"
          title="Дыхание"
          blurb="1–3 минуты, чтобы чуть отпустить тело"
          onClick={props.onOpenBreath}
        />
        <EqualEntry
          testId="home-equal-mood"
          icon="mood"
          title="Настроение"
          blurb="Отметить фон дня — без оценки"
          onClick={() => props.onOpenFavorite("mood")}
        />
        <EqualEntry
          testId="new-situation"
          icon="decision"
          title="Разобрать решение"
          blurb="Когда есть конкретный выбор — по шагам"
          onClick={() => props.onStartDecision()}
        />
        <EqualEntry
          testId="open-practices"
          icon="practices"
          title="Все практики"
          blurb="Благодарность, эмоции, ABC, колесо и другие"
          onClick={props.onOpenPractices}
        />
      </div>

      <GoalsLine
        goalsLabel={props.goalsLabel}
        onEditGoals={props.onEditGoals}
        whisper
      />
    </div>
  );
}

/** D — journal entry: write first, no button menu */
function HomeD(props: Props) {
  const [text, setText] = useState("");
  const ready = text.trim().length >= 8;

  return (
    <div className="space-y-6" data-testid="home-journal">
      <GoalsLine
        goalsLabel={props.goalsLabel}
        onEditGoals={props.onEditGoals}
        whisper
      />

      <div className="space-y-3">
        <h2 className="font-display text-[1.65rem] leading-[1.2] text-[var(--ink)] sm:text-[1.8rem]">
          Что не отпускает?
        </h2>
        <p className="max-w-md text-[1rem] leading-relaxed text-[var(--ink-muted)]">
          Напишите своими словами. Дальше разберём мягко — или просто оставим
          как заметку для себя.
        </p>
      </div>

      <div className="space-y-3">
        <Textarea
          data-testid="home-journal-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Например: не знаю, ехать ли к маме в выходные…"
          className="min-h-[8.5rem] resize-none rounded-2xl border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-[color-mix(in_oklab,white_55%,transparent)] px-3.5 py-3 text-[1.05rem] leading-relaxed shadow-none focus-visible:ring-[var(--ink)]/20"
        />
        <button
          type="button"
          data-testid="new-situation"
          disabled={!ready}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--ink)] px-4 text-[1.05rem] font-semibold text-[var(--primary-foreground)] transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => props.onStartDecision(text.trim())}
        >
          Разобрать
        </button>
      </div>

      <nav
        className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem] text-[var(--ink-muted)]"
        aria-label="Тихие действия"
      >
        <button
          type="button"
          data-testid="home-quiet-breath"
          className="clarity-link-quiet font-medium underline-offset-2 hover:underline"
          onClick={props.onOpenBreath}
        >
          дыхание
        </button>
        <span aria-hidden>·</span>
        <button
          type="button"
          data-testid="open-practices"
          className="clarity-link-quiet font-medium underline-offset-2 hover:underline"
          onClick={props.onOpenPractices}
        >
          практики
        </button>
        <span aria-hidden>·</span>
        <button
          type="button"
          data-testid="open-stats"
          className="clarity-link-quiet font-medium underline-offset-2 hover:underline"
          onClick={props.onOpenStats}
        >
          записи
        </button>
      </nav>
    </div>
  );
}

export function HomeScreen(props: Props) {
  const isJournal = props.variant === "d";
  const isPracticesFirst = props.variant === "e";

  return (
    <section
      className={isJournal || isPracticesFirst ? "space-y-6" : "space-y-7"}
      data-testid="home-screen"
      data-variant={props.variant}
    >
      {props.variant === "a" && <HomeA {...props} />}
      {props.variant === "b" && <HomeB {...props} />}
      {props.variant === "c" && <HomeC {...props} />}
      {props.variant === "d" && <HomeD {...props} />}
      {props.variant === "e" && <HomeE {...props} />}

      <HomeFavorites
        favorites={props.favorites}
        onOpen={props.onOpenFavorite}
      />

      {!isJournal && !isPracticesFirst && props.favorites.length === 0 && (
        <p className="text-[0.92rem] text-[var(--ink-muted)]">
          Звёздочка в практиках — частое появится здесь.
        </p>
      )}

      {!isJournal && (
        <button
          type="button"
          data-testid="open-stats"
          className="clarity-link-quiet inline-flex items-center gap-1.5 text-[0.95rem] font-medium"
          onClick={props.onOpenStats}
        >
          <PracticeGlyph name="stats" className="h-4 w-4" />
          {isPracticesFirst || props.variant === "c"
            ? "Мои записи"
            : "Что уже заметили"}
        </button>
      )}

      <FeedbackBlock
        pendingFeedback={props.pendingFeedback}
        onOpenFeedback={props.onOpenFeedback}
      />

      <MoreBlock
        variant={props.variant}
        onVariantChange={props.onVariantChange}
        hasSpecialist={props.hasSpecialist}
        specialistName={props.specialistName}
        specialistContact={props.specialistContact}
        onOpenSpecialist={props.onOpenSpecialist}
        onReset={props.onReset}
      />
    </section>
  );
}
