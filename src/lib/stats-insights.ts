import { moodLabel } from "./practices";
import { countLabel } from "./plural";
import { DECISION_LABELS } from "./questions";
import type { StatsSnapshot } from "./stats";
import type { DecisionChoice, PracticeEntry, SituationRecord } from "./types";

type InsightTone = "calm" | "soft" | "empty";

export type StatsInsight = {
  id: string;
  title: string;
  body: string;
  tone: InsightTone;
};

export type PracticeChip = {
  key: string;
  label: string;
  count: number;
};

const PRACTICE_LABELS: Record<string, string> = {
  mood: "Настроение",
  gratitude: "Благодарность",
  emotions: "Эмоции",
  questions: "Вопросы",
  abc: "ABC",
  wheel: "Колесо",
  breath: "Дыхание",
  "ideal-day": "Идеальный день",
  "five-whys": "5 почему",
};

export function buildHeroInsight(
  stats: StatsSnapshot,
  situations: SituationRecord[],
): StatsInsight {
  if (stats.total === 0 && stats.practiceTotal === 0) {
    return {
      id: "empty",
      title: "Пока тихо",
      body: "Здесь появится мягкая картина ваших разборов и практик. Можно начать с одного маленького шага, без оценки и без спешки.",
      tone: "empty",
    };
  }

  if (stats.total === 0) {
    const practicePhrase = countLabel(
      stats.practiceTotal,
      "запись практики",
      "записи практик",
      "записей практик",
    );
    return {
      id: "practices-only",
      title: "Вы уже замечаете себя",
      body:
        stats.lastMood !== undefined
          ? `Есть ${practicePhrase}. Последнее настроение: ${moodLabel(stats.lastMood)}. Решений ещё нет: это нормально, если сейчас важнее просто быть с собой.`
          : `Есть ${practicePhrase}. Когда появится сложный выбор, разбор решения тоже оставит здесь след.`,
      tone: "soft",
    };
  }

  if (stats.withFeedback === 0) {
    return {
      id: "decisions-no-feedback",
      title: "Вы фиксируете выборы",
      body: `${countLabel(stats.total, "решение", "решения", "решений")} уже записано. Если позже ответите, как отозвалось, картина станет теплее и точнее.`,
      tone: "calm",
    };
  }

  const parts: string[] = [];
  parts.push(
    `У вас уже ${countLabel(stats.total, "записанное решение", "записанных решения", "записанных решений")}.`,
  );

  if (stats.worthItYes > 0 && stats.worthItNo === 0) {
    parts.push("В отзывах чаще звучит: «стоило того».");
  } else if (stats.worthItNo > 0 && stats.worthItYes === 0) {
    parts.push("В отзывах пока чаще тяжело: это тоже важный сигнал для себя.");
  } else if (stats.worthItYes > 0 && stats.worthItNo > 0) {
    parts.push(
      `Иногда выбор отзывался тепло (${stats.worthItYes}), иногда тяжелее (${stats.worthItNo}).`,
    );
  }

  if (stats.declineWithFeedback > 0 && stats.declineFeltLighter > 0) {
    parts.push(
      stats.declineFeltLighter === stats.declineWithFeedback
        ? "После отказов вы отмечали облегчение: похоже, границы работают на вас."
        : `После части отказов приходило облегчение (${stats.declineFeltLighter} из ${stats.declineWithFeedback}).`,
    );
  }

  parts.push("Это не оценка «хорошо/плохо», а скорее зеркало ощущений.");

  return {
    id: "full",
    title: "Что уже видно",
    body: parts.join(" "),
    tone: "calm",
  };
}

export function practiceChips(stats: StatsSnapshot): PracticeChip[] {
  const pairs: [string, number][] = [
    ["mood", stats.moodCount],
    ["gratitude", stats.gratitudeCount],
    ["emotions", stats.emotionsCount],
    ["questions", stats.questionsCount],
    ["abc", stats.abcCount],
    ["wheel", stats.wheelCount],
    ["breath", stats.breathCount],
    ["ideal-day", stats.idealDayCount],
    ["five-whys", stats.fiveWhysCount],
  ];
  return pairs
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: PRACTICE_LABELS[key] ?? key,
      count,
    }));
}

export function decisionChips(stats: StatsSnapshot): PracticeChip[] {
  return (Object.keys(stats.decisions) as DecisionChoice[])
    .filter((k) => stats.decisions[k] > 0)
    .map((k) => ({
      key: k,
      label: DECISION_LABELS[k],
      count: stats.decisions[k],
    }));
}

export function recentPracticeLabel(entry: PracticeEntry): string {
  return PRACTICE_LABELS[entry.kind] ?? entry.kind;
}
