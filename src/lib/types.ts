export type LifeFilter = "work" | "close" | "friends";

export type DecisionChoice =
  | "accept"
  | "decline"
  | "postpone"
  | "limit";

export type Feeling = "lighter" | "same" | "heavier";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type Goal = {
  id: string;
  text: string;
};

export type TrustedSpecialist = {
  name: string;
  contact: string;
  note: string;
};

export type QuestionAnswer = {
  questionId: string;
  value: number; // -2..+2 lean toward decline(-) vs accept(+)
  label: string;
};

export type Feedback = {
  gained: string;
  spent: string;
  feeling: Feeling;
  worthIt: boolean;
  answeredAt: string;
};

export type SituationRecord = {
  id: string;
  text: string;
  filter: LifeFilter;
  answers: QuestionAnswer[];
  summary: string;
  lean: "accept" | "decline" | "mixed";
  decision: DecisionChoice;
  createdAt: string;
  feedbackDueAt: string;
  feedback?: Feedback;
};

export type MoodPractice = {
  id: string;
  kind: "mood";
  mood: MoodLevel;
  activities: string[];
  note: string;
  createdAt: string;
};

export type GratitudePractice = {
  id: string;
  kind: "gratitude";
  items: string[];
  createdAt: string;
};

export type EmotionsPractice = {
  id: string;
  kind: "emotions";
  emotions: string[];
  intensity: MoodLevel;
  note: string;
  createdAt: string;
};

export type AbcPractice = {
  id: string;
  kind: "abc";
  activating: string; // A
  beliefs: string; // B
  consequences: string; // C
  reframe: string; // мягкая альтернативная мысль (опционально)
  createdAt: string;
};

export type ReflectionQa = {
  questionId: string;
  question: string;
  answer: string;
};

export type QuestionsPractice = {
  id: string;
  kind: "questions";
  topicId: string;
  topicLabel: string;
  answers: ReflectionQa[];
  createdAt: string;
};

export type WheelScore = {
  areaId: string;
  label: string;
  score: number; // 1-10
};

export type WheelPractice = {
  id: string;
  kind: "wheel";
  scores: WheelScore[];
  focusNote: string;
  createdAt: string;
};

export type BreathDurationSec = 60 | 120 | 180;

export type BreathPractice = {
  id: string;
  kind: "breath";
  durationSec: BreathDurationSec;
  completed: boolean;
  notice: string;
  createdAt: string;
};

export type IdealDayPractice = {
  id: string;
  kind: "ideal-day";
  horizon: string; // e.g. "через год" / "обычный хороший день"
  setting: string;
  actions: string;
  feelings: string;
  people: string;
  smallStep: string;
  createdAt: string;
};

export type FiveWhysStep = {
  index: number;
  why: string;
};

export type FiveWhysPractice = {
  id: string;
  kind: "five-whys";
  starting: string;
  steps: FiveWhysStep[];
  needNow: string;
  createdAt: string;
};

export type PracticeEntry =
  | MoodPractice
  | GratitudePractice
  | EmotionsPractice
  | AbcPractice
  | QuestionsPractice
  | WheelPractice
  | BreathPractice
  | IdealDayPractice
  | FiveWhysPractice;

export type AppState = {
  version: 2;
  onboardingDone: boolean;
  goals: Goal[];
  specialist: TrustedSpecialist | null;
  situations: SituationRecord[];
  practices: PracticeEntry[];
};

export type Screen =
  | "home"
  | "onboarding"
  | "practices"
  | "mood"
  | "gratitude"
  | "emotions"
  | "abc"
  | "questions"
  | "wheel"
  | "breath"
  | "ideal-day"
  | "five-whys"
  | "practice-log"
  | "new-situation"
  | "filter"
  | "decision-questions"
  | "summary"
  | "decision"
  | "feedback"
  | "stats"
  | "specialist";
