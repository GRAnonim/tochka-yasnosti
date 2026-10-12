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

export type PracticeEntry = MoodPractice | GratitudePractice | EmotionsPractice;

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
  | "practice-log"
  | "new-situation"
  | "filter"
  | "questions"
  | "summary"
  | "decision"
  | "feedback"
  | "stats"
  | "specialist";
