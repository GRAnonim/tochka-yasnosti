"use client";

import { PracticeGlyph } from "@/components/practice-icons";
import {
  buildHeroInsight,
  decisionChips,
  practiceChips,
  recentPracticeLabel,
} from "@/lib/stats-insights";
import type { StatsSnapshot } from "@/lib/stats";
import { FILTER_LABELS, DECISION_LABELS } from "@/lib/questions";
import type { PracticeEntry, SituationRecord } from "@/lib/types";

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function StatsView({
  stats,
  situations,
  practices,
  onOpenPractices,
  onStartDecision,
}: {
  stats: StatsSnapshot;
  situations: SituationRecord[];
  practices: PracticeEntry[];
  onOpenPractices: () => void;
  onStartDecision: () => void;
}) {
  const hero = buildHeroInsight(stats, situations);
  const decisions = decisionChips(stats);
  const chips = practiceChips(stats);
  const empty = stats.total === 0 && stats.practiceTotal === 0;

  return (
    <section className="space-y-6" data-testid="stats-screen">
      <div className="space-y-2">
        <h2 className="font-display text-[1.45rem] leading-tight text-[var(--ink)]">
          Что уже заметили
        </h2>
        <p className="text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">
          Не отчёт и не оценка — мягкое зеркало ваших записей. Можно показать
          специалисту или просто посмотреть на себя без давления.
        </p>
      </div>

      <div
        className={
          hero.tone === "empty"
            ? "rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--ink)_14%,transparent)] bg-[color-mix(in_oklab,white_70%,transparent)] px-4 py-4"
            : "rounded-2xl border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] bg-[color-mix(in_oklab,var(--primary)_7%,white)] px-4 py-4"
        }
        data-testid="stats-hero"
      >
        <p className="text-[0.78rem] tracking-[0.07em] text-[var(--ink-muted)] uppercase">
          Сейчас
        </p>
        <p className="mt-1 font-display text-lg text-[var(--ink)]">{hero.title}</p>
        <p className="mt-2 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
          {hero.body}
        </p>
        {empty && (
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              data-testid="stats-empty-decision"
              className="clarity-cta-primary inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold"
              onClick={onStartDecision}
            >
              Разобрать решение
            </button>
            <button
              type="button"
              data-testid="stats-empty-practices"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-sm font-medium text-[var(--ink)]"
              onClick={onOpenPractices}
            >
              Открыть практики
            </button>
          </div>
        )}
      </div>

      {!empty && (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-[var(--surface)] px-3.5 py-3">
              <p className="text-[0.78rem] text-[var(--ink-muted)]">Решения</p>
              <p className="mt-1 font-display text-2xl tabular-nums text-[var(--ink)]">
                {stats.total}
              </p>
              <p className="mt-1 text-[0.85rem] leading-snug text-[var(--ink-muted)]">
                {stats.withFeedback > 0
                  ? `с отзывом — ${stats.withFeedback}`
                  : "отзывы ещё впереди"}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--surface)] px-3.5 py-3">
              <p className="text-[0.78rem] text-[var(--ink-muted)]">Практики</p>
              <p className="mt-1 font-display text-2xl tabular-nums text-[var(--ink)]">
                {stats.practiceTotal}
              </p>
              <p className="mt-1 text-[0.85rem] leading-snug text-[var(--ink-muted)]">
                {stats.lastMood !== undefined
                  ? `фон: ${moodShort(stats.lastMood)}`
                  : "дневники и дыхание"}
              </p>
            </div>
          </div>

          {decisions.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-display text-base text-[var(--ink)]">
                Как вы выбирали
              </h3>
              <div className="flex flex-wrap gap-2">
                {decisions.map((d) => (
                  <span
                    key={d.key}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,white)] px-3 py-1.5 text-[0.92rem] text-[var(--ink)]"
                  >
                    <span>{d.label}</span>
                    <span className="tabular-nums text-[var(--accent-ink)]">
                      {d.count}
                    </span>
                  </span>
                ))}
              </div>
              {stats.withFeedback === 0 && (
                <p className="text-[0.9rem] text-[var(--ink-muted)]">
                  Когда появится отзыв «как отозвалось» — здесь станет яснее,
                  что вам подходит.
                </p>
              )}
            </div>
          )}

          {chips.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-base text-[var(--ink)]">
                  Чем пользовались
                </h3>
                <button
                  type="button"
                  className="text-[0.9rem] text-[var(--accent-ink)] underline-offset-2 hover:underline"
                  onClick={onOpenPractices}
                >
                  к практикам
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span
                    key={c.key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-[0.92rem] text-[var(--ink-soft)]"
                  >
                    {c.label}
                    <span className="tabular-nums text-[var(--ink-muted)]">
                      {c.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {situations.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-display text-base text-[var(--ink)]">
                Недавние решения
              </h3>
              <ul className="space-y-2">
                {situations.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3"
                  >
                    <p className="line-clamp-2 text-[1.02rem] leading-snug text-[var(--ink)]">
                      {s.text}
                    </p>
                    <p className="mt-1.5 text-[0.88rem] text-[var(--ink-muted)]">
                      {formatShortDate(s.createdAt)} · {FILTER_LABELS[s.filter]} ·{" "}
                      {DECISION_LABELS[s.decision]}
                      {s.feedback
                        ? s.feedback.worthIt
                          ? " · отозвалось хорошо"
                          : " · было тяжеловато"
                        : " · ждёт отклика"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {practices.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-display text-base text-[var(--ink)]">
                Недавние практики
              </h3>
              <ul className="space-y-2">
                {practices.slice(0, 4).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] px-3.5 py-2.5"
                  >
                    <PracticeGlyph
                      name={p.kind}
                      className="h-5 w-5 shrink-0 text-[var(--accent-ink)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.98rem] font-medium text-[var(--ink)]">
                        {recentPracticeLabel(p)}
                      </span>
                      <span className="block text-[0.85rem] text-[var(--ink-muted)]">
                        {formatShortDate(p.createdAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="text-[0.88rem] leading-relaxed text-[var(--ink-muted)]">
        Это не диагноз и не оценка прогресса. Скорее дневник, который помогает
        вам или вашему психологу увидеть повторяющиеся темы.
      </p>
    </section>
  );
}

function moodShort(level: number): string {
  if (level <= 2) return "тяжёлый";
  if (level === 3) return "ровный";
  return "светлее";
}
