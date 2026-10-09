export type LifeFilter = "work" | "close" | "friends";

export type DecisionChoice =
  | "accept"
  | "decline"
  | "postpone"
  | "limit";

export type Feeling = "lighter" | "same" | "heavier";

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

export type AppState = {
  version: 1;
  onboardingDone: boolean;
  goals: Goal[];
  specialist: TrustedSpecialist | null;
  situations: SituationRecord[];
};

export type Screen =
  | "home"
  | "onboarding"
  | "new-situation"
  | "filter"
  | "questions"
  | "summary"
  | "decision"
  | "feedback"
  | "stats"
  | "specialist"
  | "safety";
