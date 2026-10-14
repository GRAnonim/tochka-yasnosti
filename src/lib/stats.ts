import type {
  DecisionChoice,
  PracticeEntry,
  SituationRecord,
} from "./types";

export type StatsSnapshot = {
  total: number;
  withFeedback: number;
  decisions: Record<DecisionChoice, number>;
  declineFeltLighter: number;
  declineWithFeedback: number;
  worthItYes: number;
  worthItNo: number;
  practiceTotal: number;
  moodCount: number;
  gratitudeCount: number;
  emotionsCount: number;
  questionsCount: number;
  abcCount: number;
  wheelCount: number;
  breathCount: number;
  idealDayCount: number;
  fiveWhysCount: number;
  lastMood?: number;
};

export function computeStats(
  situations: SituationRecord[],
  practices: PracticeEntry[] = [],
): StatsSnapshot {
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

  let moodCount = 0;
  let gratitudeCount = 0;
  let emotionsCount = 0;
  let questionsCount = 0;
  let abcCount = 0;
  let wheelCount = 0;
  let breathCount = 0;
  let idealDayCount = 0;
  let fiveWhysCount = 0;
  let lastMood: number | undefined;
  for (const p of practices) {
    if (p.kind === "mood") {
      moodCount += 1;
      if (lastMood === undefined) lastMood = p.mood;
    } else if (p.kind === "gratitude") gratitudeCount += 1;
    else if (p.kind === "emotions") emotionsCount += 1;
    else if (p.kind === "questions") questionsCount += 1;
    else if (p.kind === "abc") abcCount += 1;
    else if (p.kind === "wheel") wheelCount += 1;
    else if (p.kind === "breath") breathCount += 1;
    else if (p.kind === "ideal-day") idealDayCount += 1;
    else if (p.kind === "five-whys") fiveWhysCount += 1;
  }

  return {
    total: situations.length,
    withFeedback,
    decisions,
    declineFeltLighter,
    declineWithFeedback,
    worthItYes,
    worthItNo,
    practiceTotal: practices.length,
    moodCount,
    gratitudeCount,
    emotionsCount,
    questionsCount,
    abcCount,
    wheelCount,
    breathCount,
    idealDayCount,
    fiveWhysCount,
    lastMood,
  };
}
