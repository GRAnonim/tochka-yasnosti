"use client";

import { useState } from "react";
import {
  IconGroupBody,
  IconGroupDay,
  IconGroupThoughts,
  PracticeGlyph,
  PracticeIconMark,
} from "@/components/practice-icons";
import { HomeFavorites } from "@/components/package1-practices";
import { DECISION_LABELS } from "@/lib/questions";
import {
  PRACTICE_MENU_GROUPS,
  PRACTICE_META,
  type MenuPracticeKey,
} from "@/lib/practices";
import type { SituationRecord } from "@/lib/types";

type Props = {
  goalsLabel: string;
  favorites: MenuPracticeKey[];
  pendingFeedback: SituationRecord[];
  onStartDecision: () => void;
  onOpenPractice: (key: MenuPracticeKey) => void;
  onOpenPracticeLog: () => void;
  onOpenStats: () => void;
  onEditGoals: () => void;
  onOpenFeedback: (id: string) => void;
  onOpenSpecialist: () => void;
  onReset: () => void;
  hasSpecialist: boolean;
  specialistName?: string;
  specialistContact?: string;
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

export function HomeScreen({
  goalsLabel,
  favorites,
  pendingFeedback,
  onStartDecision,
  onOpenPractice,
  onOpenPracticeLog,
  onOpenStats,
  onEditGoals,
  onOpenFeedback,
  onOpenSpecialist,
  onReset,
  hasSpecialist,
  specialistName,
  specialistContact,
}: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <section className="space-y-6" data-testid="home-screen">
      <div className="space-y-2">
        <h2 className="font-display text-[1.5rem] leading-tight text-[var(--ink)]">
          Практики
        </h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">
          Три раздела — по три упражнения. Откройте нужный и выберите.
        </p>
        <p
          className="text-[0.88rem] leading-snug text-[var(--ink-muted)]"
          data-testid="home-goals"
        >
          Сейчас берегу:{" "}
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
      </div>

      <div className="space-y-3" data-testid="home-practice-groups">
        {PRACTICE_MENU_GROUPS.map((group) => {
          const open = Boolean(openGroups[group.id]);
          const GroupIcon =
            groupIcon[group.id as keyof typeof groupIcon] ?? IconGroupDay;
          return (
            <div
              key={group.id}
              className={`overflow-hidden rounded-2xl border ${groupTone[group.id] ?? "border-[var(--line)] bg-[var(--surface)]"}`}
              data-testid={`home-group-${group.id}`}
            >
              <button
                type="button"
                data-testid={`home-group-toggle-${group.id}`}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-4 text-left"
                aria-expanded={open}
                onClick={() =>
                  setOpenGroups((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,white_72%,transparent)] text-[var(--accent-ink)]">
                    <GroupIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[1.05rem] font-semibold text-[var(--ink)]">
                      {group.title}
                    </span>
                    <span className="mt-1 block text-[0.92rem] text-[var(--ink-soft)]">
                      {group.items.map((k) => PRACTICE_META[k].title).join(" · ")}
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
                <div className="space-y-2 border-t border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-[color-mix(in_oklab,white_72%,transparent)] px-2 py-2">
                  {group.items.map((key) => (
                    <button
                      type="button"
                      key={key}
                      data-testid={`home-practice-${key}`}
                      className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[color-mix(in_oklab,white_80%,transparent)]"
                      onClick={() => onOpenPractice(key)}
                    >
                      <PracticeIconMark
                        name={key}
                        className="mt-0.5 h-9 w-9 rounded-lg"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[1rem] font-semibold text-[var(--ink)]">
                          {PRACTICE_META[key].title}
                        </span>
                        <span className="mt-0.5 block text-[0.9rem] leading-snug text-[var(--ink-muted)]">
                          {PRACTICE_META[key].blurb}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-[var(--line)] pt-4">
        <p className="text-[0.78rem] tracking-[0.06em] text-[var(--ink-muted)] uppercase">
          Отдельно
        </p>
        <button
          type="button"
          data-testid="new-situation"
          className="flex w-full items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3.5 text-left transition hover:border-[color-mix(in_oklab,var(--ink)_18%,transparent)]"
          onClick={onStartDecision}
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--ink-soft)]">
            <PracticeGlyph name="decision" className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[1.05rem] font-semibold text-[var(--ink)]">
              Разобрать решение
            </span>
            <span className="mt-0.5 block text-[0.92rem] leading-snug text-[var(--ink-muted)]">
              Когда есть конкретный выбор — мягкий разбор по шагам
            </span>
          </span>
          <span className="mt-1 text-[var(--ink-muted)]" aria-hidden>
            ›
          </span>
        </button>
      </div>

      <HomeFavorites favorites={favorites} onOpen={onOpenPractice} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem]">
        <button
          type="button"
          data-testid="open-stats"
          className="clarity-link-quiet inline-flex items-center gap-1.5 font-medium"
          onClick={onOpenStats}
        >
          <PracticeGlyph name="stats" className="h-4 w-4" />
          Мои записи
        </button>
        <span className="text-[var(--line)]" aria-hidden>
          ·
        </span>
        <button
          type="button"
          data-testid="open-practice-log"
          className="clarity-link-quiet font-medium underline-offset-2 hover:underline"
          onClick={onOpenPracticeLog}
        >
          Журнал
        </button>
      </div>

      {pendingFeedback.length > 0 && (
        <div className="space-y-2.5 border-t border-[var(--line)] pt-4">
          <h3 className="font-display text-base text-[var(--ink)]">
            Обратная связь
          </h3>
          <ul className="space-y-2">
            {pendingFeedback.slice(0, 3).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-left"
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
      )}

      <details className="border-t border-[var(--line)] pt-3 text-[0.95rem] text-[var(--ink-muted)]">
        <summary
          className="cursor-pointer list-none font-medium text-[var(--ink-soft)] marker:content-none [&::-webkit-details-marker]:hidden"
          data-testid="home-more"
        >
          Ещё
        </summary>
        <div className="mt-3 space-y-4">
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
    </section>
  );
}
