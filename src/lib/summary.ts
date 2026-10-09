import type { DecisionChoice, Goal, LifeFilter, QuestionAnswer } from "./types";
import { FILTER_LABELS } from "./questions";

export function scoreAnswers(answers: QuestionAnswer[]): number {
  if (answers.length === 0) return 0;
  return answers.reduce((sum, a) => sum + a.value, 0) / answers.length;
}

export function leanFromScore(score: number): "accept" | "decline" | "mixed" {
  if (score >= 0.55) return "accept";
  if (score <= -0.55) return "decline";
  return "mixed";
}

export function buildSoftSummary(input: {
  filter: LifeFilter;
  goals: Goal[];
  answers: QuestionAnswer[];
  situation: string;
}): { summary: string; lean: "accept" | "decline" | "mixed"; score: number } {
  const score = scoreAnswers(input.answers);
  const lean = leanFromScore(score);
  const filterLabel = FILTER_LABELS[input.filter];
  const goalBits =
    input.goals.length > 0
      ? input.goals.map((g) => g.text).join(", ")
      : "ваши ориентиры";

  const leanPhrase =
    lean === "accept"
      ? "похоже, у вас больше оснований согласиться — если условия вам ок"
      : lean === "decline"
        ? "похоже, у вас больше оснований защитить время и энергию — отказ здесь может быть заботой о себе"
        : "сигналы смешанные: решение не обязано быть жёстким «да» или «нет»";

  const summary = [
    `Контекст: ${filterLabel.toLowerCase()}.`,
    `Ориентиры, которые вы задали: ${goalBits}.`,
    leanPhrase.charAt(0).toUpperCase() + leanPhrase.slice(1) + ".",
    lean === "mixed"
      ? "Можно перенести, сузить формат или согласиться лишь на часть — это тоже ясное решение."
      : "Ниже можно зафиксировать тот вариант, который кажется честнее всего сейчас.",
  ].join(" ");

  return { summary, lean, score };
}

export function suggestDecisions(lean: "accept" | "decline" | "mixed"): DecisionChoice[] {
  if (lean === "accept") return ["accept", "limit", "postpone", "decline"];
  if (lean === "decline") return ["decline", "limit", "postpone", "accept"];
  return ["limit", "postpone", "accept", "decline"];
}

/** Feedback due after ~2 days; for demo we also allow immediate answer. */
export function feedbackDueAt(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 2);
  return d.toISOString();
}
