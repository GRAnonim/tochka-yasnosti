"use client";

import type { ReactNode } from "react";
import {
  PracticeIconMark,
  type PracticeIconKey,
} from "@/components/practice-icons";
import { PRACTICE_META } from "@/lib/practices";

export function PracticeHeader({
  practiceKey,
  intro,
}: {
  practiceKey: keyof typeof PRACTICE_META;
  intro: string;
}) {
  const meta = PRACTICE_META[practiceKey];
  return (
    <header className="practice-hero">
      <PracticeIconMark
        name={practiceKey as PracticeIconKey}
        className="h-12 w-12 rounded-2xl"
      />
      <div className="min-w-0 flex-1">
        <p className="practice-hero-pace">{meta.pace}</p>
        <h2 className="font-display text-[1.38rem] leading-tight text-[var(--ink)]">
          {meta.title}
        </h2>
        <p className="mt-1.5 text-[0.98rem] leading-relaxed text-[var(--ink-muted)]">
          {intro}
        </p>
      </div>
    </header>
  );
}

export function PracticeCard({
  step,
  title,
  hint,
  children,
}: {
  step?: number | string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="practice-card">
      <div className="mb-3 flex items-start gap-3">
        {step != null && (
          <span className="practice-step" aria-hidden>
            {step}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.02rem] font-semibold leading-snug text-[var(--ink)]">
            {title}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-[0.9rem] leading-snug text-[var(--ink-muted)]">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function PracticeChoice({
  active,
  onClick,
  testId,
  title,
  hint,
  leading,
}: {
  active: boolean;
  onClick: () => void;
  testId?: string;
  title: string;
  hint?: string;
  leading?: ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      data-active={active ? "true" : "false"}
      className="practice-choice"
      onClick={onClick}
    >
      {leading}
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[1.02rem] font-medium leading-snug text-[var(--ink)]">
          {title}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-[0.88rem] leading-snug text-[var(--ink-muted)]">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="practice-choice-mark" aria-hidden />
    </button>
  );
}

export function PracticeChip({
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
      data-active={active ? "true" : "false"}
      className="practice-chip"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function PracticeSave({
  testId,
  disabled,
  onClick,
  children,
}: {
  testId: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      className="clarity-cta-primary mt-1 inline-flex h-12 w-full items-center justify-center rounded-2xl px-4 text-[1.02rem] font-semibold disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
