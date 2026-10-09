import type { DecisionChoice, SituationRecord } from "./types";
import { DECISION_LABELS } from "./questions";

export type StatsSnapshot = {
  total: number;
  withFeedback: number;
  decisions: Record<DecisionChoice, number>;
  declineFeltLighter: number;
  declineWithFeedback: number;
  worthItYes: number;
  worthItNo: number;
};

export function computeStats(situations: SituationRecord[]): StatsSnapshot {
  const decisions: Record<DecisionChoice, number> = {
    accept: 0,
    decline: 0,
    postpone: 0,
    limit: 0,
  };

  let withFeedback = 0;
  let declineFeltLighter = 0;
  let declineWithFeedback = 0;
  let worthItYes = 0;
  let worthItNo = 0;

  for (const s of situations) {
    decisions[s.decision] += 1;
    if (!s.feedback) continue;
    withFeedback += 1;
    if (s.feedback.worthIt) worthItYes += 1;
    else worthItNo += 1;
    if (s.decision === "decline") {
      declineWithFeedback += 1;
      if (s.feedback.feeling === "lighter") declineFeltLighter += 1;
    }
  }

  return {
    total: situations.length,
    withFeedback,
    decisions,
    declineFeltLighter,
    declineWithFeedback,
    worthItYes,
    worthItNo,
  };
}

export function statsLines(stats: StatsSnapshot): string[] {
  const lines: string[] = [];
  if (stats.total === 0) {
    return ["Пока нет закрытых ситуаций — пройдите один цикл от описания до решения."];
  }

  lines.push(`Всего зафиксированных решений: ${stats.total}.`);

  const parts = (Object.keys(stats.decisions) as DecisionChoice[])
    .filter((k) => stats.decisions[k] > 0)
    .map((k) => `${DECISION_LABELS[k].toLowerCase()} — ${stats.decisions[k]}`);
  if (parts.length) lines.push(`Среди них: ${parts.join("; ")}.`);

  if (stats.declineWithFeedback > 0) {
    lines.push(
      `Из ${stats.declineWithFeedback} отказов с обратной связью облегчение отметили в ${stats.declineFeltLighter} случаях.`,
    );
  }

  if (stats.withFeedback > 0) {
    lines.push(
      `После факта «стоило того»: да — ${stats.worthItYes}, нет — ${stats.worthItNo}.`,
    );
  } else {
    lines.push("Обратная связь ещё не собрана — ответьте по ситуации через пару дней (или сразу в тестовом режиме).");
  }

  return lines;
}
