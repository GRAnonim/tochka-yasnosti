"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DECISION_LABELS,
  FILTER_LABELS,
  QUESTIONS_BY_FILTER,
} from "@/lib/questions";
import {
  buildSoftSummary,
  feedbackDueAt,
  suggestDecisions,
} from "@/lib/summary";
import { computeStats } from "@/lib/stats";
import { StatsView } from "@/components/stats-view";
import { emptyState, loadState, saveState, uid } from "@/lib/storage";
import {
  applyTelegramSafeArea,
  hasTelegramBackButton,
  initTelegram,
  syncTelegramBackButton,
} from "@/lib/telegram";
import type {
  AbcPractice,
  AppState,
  BreathDurationSec,
  DecisionChoice,
  Feeling,
  LifeFilter,
  MoodLevel,
  QuestionAnswer,
  Screen,
  SituationRecord,
  WheelPractice,
} from "@/lib/types";
import {
  EmotionsPracticeForm,
  GratitudePracticeForm,
  MoodPracticeForm,
  PracticeLog,
  PracticesMenu,
} from "@/components/package1-practices";
import { HomeScreen } from "@/components/home-screen";
import {
  AbcPracticeForm,
  QuestionsPracticeForm,
} from "@/components/package2-practices";
import {
  BreathPracticeForm,
  WheelPracticeForm,
} from "@/components/package3-practices";
import {
  FiveWhysPracticeForm,
  IdealDayPracticeForm,
} from "@/components/package4-practices";
import { WheelResultView } from "@/components/wheel-chart";
import { IconBrand, PracticeGlyph } from "@/components/practice-icons";
import {
  loadPracticeFavorites,
  PRACTICE_META,
  QUESTION_TOPICS,
  savePracticeFavorites,
  WHEEL_AREAS,
  type MenuPracticeKey,
  type QuestionTopicId,
} from "@/lib/practices";

const FILTERS: LifeFilter[] = ["work", "close", "friends"];

const DECISION_STEPS: Screen[] = [
  "new-situation",
  "filter",
  "decision-questions",
  "summary",
  "decision",
];

function DecisionFlowProgress({ screen }: { screen: Screen }) {
  const index = DECISION_STEPS.indexOf(screen);
  if (index < 0) return null;
  const step = index + 1;
  const total = DECISION_STEPS.length;
  return (
    <div className="mb-4 space-y-1.5" data-testid="decision-flow-progress">
      <p className="text-[0.8rem] tracking-wide text-[var(--ink-muted)]">
        Шаг {step} из {total}
      </p>
      <div className="clarity-step-rail" aria-hidden>
        <span style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function ClarityApp() {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [draftText, setDraftText] = useState("");
  const [draftFilter, setDraftFilter] = useState<LifeFilter | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<QuestionAnswer[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [draftSummary, setDraftSummary] = useState("");
  const [draftLean, setDraftLean] = useState<"accept" | "decline" | "mixed">(
    "mixed",
  );
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [goalInputs, setGoalInputs] = useState(["", "", ""]);
  const [goalError, setGoalError] = useState<string | null>(null);
  const goalRefs = useRef<Array<HTMLInputElement | null>>([null, null, null]);
  const [specName, setSpecName] = useState("");
  const [specContact, setSpecContact] = useState("");
  const [specNote, setSpecNote] = useState("");
  const [fbGained, setFbGained] = useState("");
  const [fbSpent, setFbSpent] = useState("");
  const [fbFeeling, setFbFeeling] = useState<Feeling>("same");
  const [fbWorth, setFbWorth] = useState<boolean | null>(null);
  const [tgHint, setTgHint] = useState("Браузерный режим");
  const [moodValue, setMoodValue] = useState<MoodLevel | null>(null);
  const [moodActivities, setMoodActivities] = useState<string[]>([]);
  const [moodNote, setMoodNote] = useState("");
  const [gratitudeItems, setGratitudeItems] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [emotionIntensity, setEmotionIntensity] = useState<MoodLevel | null>(
    null,
  );
  const [emotionNote, setEmotionNote] = useState("");
  const [abcA, setAbcA] = useState("");
  const [abcB, setAbcB] = useState("");
  const [abcC, setAbcC] = useState("");
  const [abcReframe, setAbcReframe] = useState("");
  const [questionsTopicId, setQuestionsTopicId] =
    useState<QuestionTopicId | null>(null);
  const [questionsAnswers, setQuestionsAnswers] = useState<
    Record<string, string>
  >({});
  const [wheelScores, setWheelScores] = useState<Record<string, number>>({});
  const [wheelNote, setWheelNote] = useState("");
  const [activeWheelId, setActiveWheelId] = useState<string | null>(null);
  const [breathDuration, setBreathDuration] =
    useState<BreathDurationSec>(60);
  const [breathNotice, setBreathNotice] = useState("");
  const [idealHorizon, setIdealHorizon] = useState("");
  const [idealSetting, setIdealSetting] = useState("");
  const [idealActions, setIdealActions] = useState("");
  const [idealFeelings, setIdealFeelings] = useState("");
  const [idealPeople, setIdealPeople] = useState("");
  const [idealStep, setIdealStep] = useState("");
  const [fiveStarting, setFiveStarting] = useState("");
  const [fiveSteps, setFiveSteps] = useState<string[]>([""]);
  const [fiveNeedNow, setFiveNeedNow] = useState("");
  const [favorites, setFavorites] = useState<MenuPracticeKey[]>([]);
  const [lastDoneTitle, setLastDoneTitle] = useState("");
  const [lastDoneKey, setLastDoneKey] = useState<MenuPracticeKey | null>(null);
  const [exportNotice, setExportNotice] = useState("");
  const [tgNativeBack, setTgNativeBack] = useState(false);

  const finishPractice = (key: MenuPracticeKey) => {
    setLastDoneTitle(PRACTICE_META[key]?.title ?? "Практика");
    setLastDoneKey(key);
    setExportNotice("");
    setScreen("practice-done");
  };

  const latestAbc = (): AbcPractice | null => {
    const found = state.practices.find((p) => p.kind === "abc");
    return found && found.kind === "abc" ? found : null;
  };

  const fillGoalInputs = (goals: { text: string }[]) => {
    setGoalInputs([
      goals[0]?.text ?? "",
      goals[1]?.text ?? "",
      goals[2]?.text ?? "",
    ]);
    setGoalError(null);
  };

  const readGoalInputs = () => {
    // Prefer live DOM values (covers browser autofill that skips React onChange)
    const fromDom = goalRefs.current.map((el) => el?.value ?? "");
    const hasDom = fromDom.some((v) => v.trim().length > 0);
    return hasDom ? fromDom : goalInputs;
  };

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setScreen(loaded.onboardingDone ? "home" : "onboarding");
    if (!loaded.onboardingDone && loaded.goals.length > 0) {
      fillGoalInputs(loaded.goals);
    }
    if (loaded.specialist) {
      setSpecName(loaded.specialist.name);
      setSpecContact(loaded.specialist.contact);
      setSpecNote(loaded.specialist.note);
    }
    setFavorites(loadPracticeFavorites());

    // Telegram script may load later (lazyOnload)
    let stopSafeArea = () => {};
    const syncTg = () => {
      const wa = initTelegram();
      stopSafeArea();
      stopSafeArea = applyTelegramSafeArea();
      setTgNativeBack(hasTelegramBackButton());
      if (!wa) {
        setTgHint("Браузерный режим");
        return;
      }
      const name = wa.initDataUnsafe?.user?.first_name;
      setTgHint(
        name
          ? `Telegram · ${name}`
          : hasTelegramBackButton()
            ? "Telegram Mini App"
            : "Браузерный режим",
      );
    };
    syncTg();
    const t = window.setTimeout(syncTg, 800);
    const t2 = window.setTimeout(syncTg, 2000);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      stopSafeArea();
    };
  }, []);

  const persist = (next: AppState) => {
    setState(next);
    saveState(next);
  };

  const pendingFeedback = useMemo(
    () => state.situations.filter((s) => !s.feedback),
    [state],
  );

  const stats = useMemo(
    () => computeStats(state.situations, state.practices),
    [state.situations, state.practices],
  );

  const resetMoodDraft = () => {
    setMoodValue(null);
    setMoodActivities([]);
    setMoodNote("");
  };

  const resetGratitudeDraft = () => {
    setGratitudeItems(["", "", ""]);
  };

  const resetEmotionsDraft = () => {
    setEmotionTags([]);
    setEmotionIntensity(null);
    setEmotionNote("");
  };

  const resetAbcDraft = () => {
    setAbcA("");
    setAbcB("");
    setAbcC("");
    setAbcReframe("");
  };

  const resetQuestionsDraft = () => {
    setQuestionsTopicId(null);
    setQuestionsAnswers({});
  };

  const resetWheelDraft = () => {
    setWheelScores({});
    setWheelNote("");
  };

  const resetBreathDraft = () => {
    setBreathDuration(60);
    setBreathNotice("");
  };

  const resetIdealDayDraft = () => {
    setIdealHorizon("");
    setIdealSetting("");
    setIdealActions("");
    setIdealFeelings("");
    setIdealPeople("");
    setIdealStep("");
  };

  const resetFiveWhysDraft = () => {
    setFiveStarting("");
    setFiveSteps([""]);
    setFiveNeedNow("");
  };

  const saveMood = () => {
    if (moodValue === null) return;
    persist({
      ...state,
      practices: [
        {
          id: uid("mood"),
          kind: "mood",
          mood: moodValue,
          activities: moodActivities,
          note: moodNote.trim(),
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetMoodDraft();
    finishPractice("mood");
  };

  const saveGratitude = () => {
    const items = gratitudeItems.map((i) => i.trim()).filter(Boolean);
    if (items.length === 0) return;
    persist({
      ...state,
      practices: [
        {
          id: uid("grat"),
          kind: "gratitude",
          items,
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetGratitudeDraft();
    finishPractice("gratitude");
  };

  const saveEmotions = () => {
    if (emotionTags.length === 0 || emotionIntensity === null) return;
    persist({
      ...state,
      practices: [
        {
          id: uid("emo"),
          kind: "emotions",
          emotions: emotionTags,
          intensity: emotionIntensity,
          note: emotionNote.trim(),
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetEmotionsDraft();
    finishPractice("emotions");
  };

  const saveAbc = () => {
    if (
      abcA.trim().length < 3 ||
      abcB.trim().length < 3 ||
      abcC.trim().length < 3
    ) {
      return;
    }
    persist({
      ...state,
      practices: [
        {
          id: uid("abc"),
          kind: "abc",
          activating: abcA.trim(),
          beliefs: abcB.trim(),
          consequences: abcC.trim(),
          reframe: abcReframe.trim(),
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetAbcDraft();
    finishPractice("abc");
  };

  const saveQuestionsPractice = () => {
    const topic = QUESTION_TOPICS.find((t) => t.id === questionsTopicId);
    if (!topic) return;
    const answers = topic.questions.map((q) => ({
      questionId: q.id,
      question: q.text,
      answer: (questionsAnswers[q.id] ?? "").trim(),
    }));
    if (answers.some((a) => a.answer.length < 2)) return;
    persist({
      ...state,
      practices: [
        {
          id: uid("qgen"),
          kind: "questions",
          topicId: topic.id,
          topicLabel: topic.label,
          answers,
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetQuestionsDraft();
    finishPractice("questions");
  };

  const saveWheel = () => {
    const scores = WHEEL_AREAS.map((area) => ({
      areaId: area.id,
      label: area.label,
      score: wheelScores[area.id] ?? 0,
    }));
    if (scores.some((s) => s.score < 1)) return;
    const entry: WheelPractice = {
      id: uid("wheel"),
      kind: "wheel",
      scores,
      focusNote: wheelNote.trim(),
      createdAt: new Date().toISOString(),
    };
    persist({
      ...state,
      practices: [entry, ...state.practices],
    });
    resetWheelDraft();
    setActiveWheelId(entry.id);
    setLastDoneTitle(PRACTICE_META.wheel.title);
    setScreen("wheel-result");
  };

  const activeWheel = useMemo(() => {
    if (!activeWheelId) return null;
    const found = state.practices.find((p) => p.id === activeWheelId);
    return found && found.kind === "wheel" ? found : null;
  }, [activeWheelId, state.practices]);

  const saveBreath = (completed: boolean) => {
    persist({
      ...state,
      practices: [
        {
          id: uid("breath"),
          kind: "breath",
          durationSec: breathDuration,
          completed,
          notice: breathNotice.trim(),
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetBreathDraft();
    finishPractice("breath");
  };

  const saveIdealDay = () => {
    if (
      !idealHorizon.trim() ||
      idealSetting.trim().length < 3 ||
      idealActions.trim().length < 3 ||
      idealFeelings.trim().length < 3 ||
      idealStep.trim().length < 3
    ) {
      return;
    }
    persist({
      ...state,
      practices: [
        {
          id: uid("ideal"),
          kind: "ideal-day",
          horizon: idealHorizon.trim(),
          setting: idealSetting.trim(),
          actions: idealActions.trim(),
          feelings: idealFeelings.trim(),
          people: idealPeople.trim(),
          smallStep: idealStep.trim(),
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetIdealDayDraft();
    finishPractice("ideal-day");
  };

  const saveFiveWhys = () => {
    const steps = fiveSteps
      .map((why, index) => ({ index: index + 1, why: why.trim() }))
      .filter((s) => s.why.length >= 2);
    if (fiveStarting.trim().length < 3 || steps.length < 2 || fiveNeedNow.trim().length < 2) {
      return;
    }
    persist({
      ...state,
      practices: [
        {
          id: uid("five"),
          kind: "five-whys",
          starting: fiveStarting.trim(),
          steps,
          needNow: fiveNeedNow.trim(),
          createdAt: new Date().toISOString(),
        },
        ...state.practices,
      ],
    });
    resetFiveWhysDraft();
    finishPractice("five-whys");
  };

  const questions = draftFilter ? QUESTIONS_BY_FILTER[draftFilter] : [];

  const openPractice = (key: MenuPracticeKey) => {
    if (key === "mood") resetMoodDraft();
    if (key === "gratitude") resetGratitudeDraft();
    if (key === "emotions") resetEmotionsDraft();
    if (key === "abc") resetAbcDraft();
    if (key === "questions") resetQuestionsDraft();
    if (key === "wheel") resetWheelDraft();
    if (key === "breath") resetBreathDraft();
    if (key === "ideal-day") resetIdealDayDraft();
    if (key === "five-whys") resetFiveWhysDraft();
    setScreen(key);
  };

  const startNew = (initialText?: string) => {
    const text = (initialText ?? "").trim();
    setDraftText(text);
    setDraftFilter(null);
    setDraftAnswers([]);
    setQIndex(0);
    setDraftSummary("");
    setDraftLean("mixed");
    // Journal home already captured the situation — skip retyping
    setScreen(text.length >= 8 ? "filter" : "new-situation");
  };

  const openEditGoals = () => {
    fillGoalInputs(state.goals);
    setScreen("edit-goals");
  };

  const saveGoals = () => {
    const raw = readGoalInputs();
    // Keep React state in sync with what we actually save
    setGoalInputs([raw[0] ?? "", raw[1] ?? "", raw[2] ?? ""]);
    const goals = raw
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((text) => ({ id: uid("goal"), text }));
    if (goals.length < 1) {
      setGoalError("Напишите хотя бы одно: что сейчас важнее беречь.");
      return;
    }
    setGoalError(null);
    persist({ ...state, goals, onboardingDone: true });
    setScreen("home");
  };

  const skipOnboarding = () => {
    const goals = [
      { id: uid("goal"), text: "Свои силы" },
      { id: uid("goal"), text: "Честность с собой" },
    ];
    fillGoalInputs(goals);
    setGoalError(null);
    persist({ ...state, goals, onboardingDone: true });
    setScreen("home");
  };

  const chooseFilter = (filter: LifeFilter) => {
    setDraftFilter(filter);
    setDraftAnswers([]);
    setQIndex(0);
    setScreen("decision-questions");
  };

  const answerCurrent = (value: number, label: string) => {
    if (!draftFilter) return;
    const q = questions[qIndex];
    const nextAnswers = [
      ...draftAnswers.filter((a) => a.questionId !== q.id),
      { questionId: q.id, value, label },
    ];
    setDraftAnswers(nextAnswers);
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      return;
    }
    const built = buildSoftSummary({
      filter: draftFilter,
      goals: state.goals,
      answers: nextAnswers,
      situation: draftText,
    });
    setDraftSummary(built.summary);
    setDraftLean(built.lean);
    setScreen("summary");
  };

  const saveDecision = (decision: DecisionChoice) => {
    if (!draftFilter) return;
    const record: SituationRecord = {
      id: uid("sit"),
      text: draftText.trim(),
      filter: draftFilter,
      answers: draftAnswers,
      summary: draftSummary,
      lean: draftLean,
      decision,
      createdAt: new Date().toISOString(),
      feedbackDueAt: feedbackDueAt(),
    };
    persist({ ...state, situations: [record, ...state.situations] });
    setScreen("home");
  };

  const openFeedback = (id: string) => {
    setActiveFeedbackId(id);
    setFbGained("");
    setFbSpent("");
    setFbFeeling("same");
    setFbWorth(null);
    setScreen("feedback");
  };

  const saveFeedback = () => {
    if (!activeFeedbackId || fbWorth === null) return;
    const situations = state.situations.map((s) =>
      s.id === activeFeedbackId
        ? {
            ...s,
            feedback: {
              gained: fbGained.trim(),
              spent: fbSpent.trim(),
              feeling: fbFeeling,
              worthIt: fbWorth,
              answeredAt: new Date().toISOString(),
            },
          }
        : s,
    );
    persist({ ...state, situations });
    setActiveFeedbackId(null);
    setScreen("stats");
  };

  const saveSpecialist = () => {
    const name = specName.trim();
    persist({
      ...state,
      specialist: name
        ? {
            name,
            contact: specContact.trim(),
            note: specNote.trim(),
          }
        : null,
    });
    setScreen("home");
  };

  // Practices live on home now — back from a practice returns to home
  const screenBack: Partial<Record<Screen, Screen>> = {
    "edit-goals": "home",
    practices: "home",
    mood: "home",
    gratitude: "home",
    emotions: "home",
    abc: "home",
    questions: "home",
    wheel: "home",
    "wheel-result": "practice-done",
    breath: "home",
    "ideal-day": "home",
    "five-whys": "home",
    "practice-log": "home",
    "practice-done": "home",
    "new-situation": "home",
    filter: "new-situation",
    "decision-questions": "filter",
    summary: "decision-questions",
    decision: "summary",
    feedback: "home",
    stats: "home",
    specialist: "home",
  };

  const backScreen = screenBack[screen];
  const goBack = () => {
    if (backScreen) setScreen(backScreen);
  };

  // Native Telegram header back — hide duplicate in-app «Назад» when available
  useEffect(() => {
    return syncTelegramBackButton(Boolean(backScreen), () => {
      const target = screenBack[screen];
      if (target) setScreen(target);
    });
  }, [screen, backScreen]);

  const showInAppBack = Boolean(backScreen) && !tgNativeBack;
  const showHomeChip = Boolean(backScreen && backScreen !== "home");

  return (
    <div className="clarity-shell relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="clarity-orb clarity-orb-a" />
        <div className="clarity-orb clarity-orb-b" />
        <div className="clarity-grain" />
      </div>

      <header className="mb-4 space-y-2.5">
        {screen === "onboarding" ? (
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--primary)_18%,white)] text-[var(--accent-ink)]">
              <IconBrand className="h-6 w-6" />
            </span>
            <h1 className="font-display text-2xl leading-tight text-[var(--ink)] sm:text-[1.8rem]">
              Точка ясности
            </h1>
            <p className="mt-1 max-w-xs text-[0.95rem] leading-snug text-[var(--ink-muted)]">
              Спокойный помощник для решений, без давления
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--primary)_16%,white)] text-[var(--accent-ink)]">
                <IconBrand className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display truncate text-[1.15rem] leading-tight text-[var(--ink)]">
                  Точка ясности
                </h1>
                {screen === "home" && (
                  <p className="truncate text-[0.78rem] text-[var(--ink-muted)]">
                    {tgHint}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {(showInAppBack || showHomeChip) && (
          <div className="flex items-center gap-2">
            {showInAppBack && (
              <button
                type="button"
                data-testid="nav-back"
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm font-medium text-[var(--ink)]"
                onClick={goBack}
              >
                <span aria-hidden>←</span>
                Назад
              </button>
            )}
            {showHomeChip && (
              <button
                type="button"
                data-testid="nav-home"
                className={
                  showInAppBack
                    ? "inline-flex h-10 items-center justify-center rounded-xl bg-[var(--secondary)] px-3 text-sm font-medium text-[var(--ink-soft)]"
                    : "inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm font-medium text-[var(--ink)]"
                }
                onClick={() => setScreen("home")}
              >
                На главную
              </button>
            )}
          </div>
        )}
      </header>

      <main className="clarity-panel flex-1 animate-in fade-in duration-500">
        {(screen === "onboarding" || screen === "edit-goals") && (
          <section className="space-y-5" data-testid="goals-form">
            <div className="space-y-2">
              <h2 className="font-display text-[1.35rem] leading-tight text-[var(--ink)]">
                {screen === "edit-goals"
                  ? "Что сейчас важнее беречь?"
                  : "Что сейчас важнее беречь?"}
              </h2>
              <p className="text-[0.98rem] leading-relaxed text-[var(--ink-muted)]">
                {screen === "edit-goals"
                  ? "Можно стереть и написать заново: одним словом или короткой фразой."
                  : "Одно слово или короткая фраза. Потом можно изменить. Не терапия и не диагноз."}
              </p>
            </div>
            <div className="space-y-3">
              {goalInputs.map((g, i) => (
                <Input
                  key={i}
                  ref={(el) => {
                    goalRefs.current[i] = el;
                  }}
                  data-testid={`goal-${i}`}
                  value={g}
                  autoComplete="off"
                  placeholder={
                    i === 0
                      ? "Например: сон"
                      : i === 1
                        ? "Например: свои границы"
                        : "Ещё, по желанию"
                  }
                  onChange={(e) => {
                    const next = [...goalInputs];
                    next[i] = e.target.value;
                    setGoalInputs(next);
                    if (goalError) setGoalError(null);
                  }}
                />
              ))}
            </div>
            {goalError && (
              <p
                className="text-sm text-[var(--danger-soft)]"
                data-testid="goal-error"
              >
                {goalError}
              </p>
            )}
            <button
              type="button"
              data-testid="start-onboarding"
              className="clarity-cta-primary inline-flex h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold transition hover:opacity-95"
              onClick={saveGoals}
            >
              {screen === "edit-goals" ? "Сохранить" : "Дальше"}
            </button>
            {screen === "onboarding" && (
              <button
                type="button"
                data-testid="skip-onboarding"
                className="inline-flex h-10 w-full items-center justify-center text-sm text-[var(--accent-ink)]"
                onClick={skipOnboarding}
              >
                Пропустить, заполню позже
              </button>
            )}
            {screen === "edit-goals" && (
              <button
                type="button"
                className="inline-flex h-10 w-full items-center justify-center text-sm text-[var(--accent-ink)]"
                onClick={() => {
                  setGoalError(null);
                  setScreen("home");
                }}
              >
                Отмена
              </button>
            )}
          </section>
        )}

        {screen === "home" && (
          <HomeScreen
            goalsLabel={
              state.goals.map((g) => g.text).join(", ") || "не заданы"
            }
            favorites={favorites}
            pendingFeedback={pendingFeedback}
            onStartDecision={() => startNew()}
            onOpenPractice={(key) => openPractice(key)}
            onOpenPracticeLog={() => setScreen("practice-log")}
            onOpenStats={() => setScreen("stats")}
            onEditGoals={openEditGoals}
            onOpenFeedback={openFeedback}
            onOpenSpecialist={() => setScreen("specialist")}
            onReset={() => {
              const next = emptyState();
              persist(next);
              fillGoalInputs([]);
              setScreen("onboarding");
            }}
            hasSpecialist={Boolean(state.specialist)}
            specialistName={state.specialist?.name}
            specialistContact={state.specialist?.contact}
          />
        )}

        {screen === "practices" && (
          <PracticesMenu
            favorites={favorites}
            onFavoritesChange={(next) => {
              setFavorites(next);
              savePracticeFavorites(next);
            }}
            onOpen={(key) => openPractice(key)}
            onLog={() => setScreen("practice-log")}
          />
        )}

        {screen === "mood" && (
          <MoodPracticeForm
            mood={moodValue}
            setMood={setMoodValue}
            activities={moodActivities}
            setActivities={setMoodActivities}
            note={moodNote}
            setNote={setMoodNote}
            onSave={saveMood}
          />
        )}

        {screen === "gratitude" && (
          <GratitudePracticeForm
            items={gratitudeItems}
            setItem={(index, value) => {
              const next: [string, string, string] = [...gratitudeItems];
              next[index] = value;
              setGratitudeItems(next);
            }}
            onSave={saveGratitude}
          />
        )}

        {screen === "emotions" && (
          <EmotionsPracticeForm
            emotions={emotionTags}
            setEmotions={setEmotionTags}
            intensity={emotionIntensity}
            setIntensity={setEmotionIntensity}
            note={emotionNote}
            setNote={setEmotionNote}
            onSave={saveEmotions}
          />
        )}

        {screen === "abc" && (
          <AbcPracticeForm
            activating={abcA}
            setActivating={setAbcA}
            beliefs={abcB}
            setBeliefs={setAbcB}
            consequences={abcC}
            setConsequences={setAbcC}
            reframe={abcReframe}
            setReframe={setAbcReframe}
            onSave={saveAbc}
          />
        )}

        {screen === "questions" && (
          <QuestionsPracticeForm
            topicId={questionsTopicId}
            setTopicId={(id) => {
              setQuestionsTopicId(id);
              if (id === null) setQuestionsAnswers({});
            }}
            answers={questionsAnswers}
            setAnswer={(questionId, value) => {
              setQuestionsAnswers((prev) => ({ ...prev, [questionId]: value }));
            }}
            onSave={saveQuestionsPractice}
          />
        )}

        {screen === "wheel" && (
          <WheelPracticeForm
            scores={wheelScores}
            setScore={(areaId, score) => {
              setWheelScores((prev) => ({ ...prev, [areaId]: score }));
            }}
            focusNote={wheelNote}
            setFocusNote={setWheelNote}
            onSave={saveWheel}
          />
        )}

        {screen === "wheel-result" && activeWheel && (
          <WheelResultView
            entry={activeWheel}
            onJournal={() => setScreen("practice-done")}
            onHome={() => setScreen("home")}
          />
        )}

        {screen === "breath" && (
          <BreathPracticeForm
            durationSec={breathDuration}
            setDurationSec={setBreathDuration}
            notice={breathNotice}
            setNotice={setBreathNotice}
            onSave={saveBreath}
          />
        )}

        {screen === "ideal-day" && (
          <IdealDayPracticeForm
            horizon={idealHorizon}
            setHorizon={setIdealHorizon}
            setting={idealSetting}
            setSetting={setIdealSetting}
            actions={idealActions}
            setActions={setIdealActions}
            feelings={idealFeelings}
            setFeelings={setIdealFeelings}
            people={idealPeople}
            setPeople={setIdealPeople}
            smallStep={idealStep}
            setSmallStep={setIdealStep}
            onSave={saveIdealDay}
          />
        )}

        {screen === "five-whys" && (
          <FiveWhysPracticeForm
            starting={fiveStarting}
            setStarting={setFiveStarting}
            steps={fiveSteps}
            setStepWhy={(index, value) => {
              setFiveSteps((prev) => {
                const next = [...prev];
                next[index] = value;
                return next;
              });
            }}
            addStep={() => setFiveSteps((prev) => [...prev, ""])}
            needNow={fiveNeedNow}
            setNeedNow={setFiveNeedNow}
            onSave={saveFiveWhys}
          />
        )}

        {screen === "practice-log" && (
          <PracticeLog
            entries={state.practices}
            onOpenWheel={(id) => {
              setActiveWheelId(id);
              setScreen("wheel-result");
            }}
            onExportAbcWord={async (id) => {
              const entry = state.practices.find(
                (p) => p.id === id && p.kind === "abc",
              );
              if (!entry || entry.kind !== "abc") return;
              const { exportAbcWord } = await import("@/lib/export-practice");
              await exportAbcWord(entry);
            }}
            onExportAbcPdf={async (id) => {
              const entry = state.practices.find(
                (p) => p.id === id && p.kind === "abc",
              );
              if (!entry || entry.kind !== "abc") return;
              const { exportAbcPdf } = await import("@/lib/export-practice");
              exportAbcPdf(entry);
            }}
          />
        )}

        {screen === "practice-done" && (
          <section className="space-y-5" data-testid="practice-done">
            <div className="space-y-2">
              <p className="text-[0.78rem] tracking-[0.07em] text-[var(--ink-muted)] uppercase">
                Готово
              </p>
              <h2 className="font-display text-[1.45rem] leading-tight text-[var(--ink)]">
                Записали
              </h2>
              <p className="text-[1.05rem] font-medium text-[var(--accent-ink)]">
                {lastDoneTitle || "Практика"}
              </p>
              <p className="text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
                Можно остановиться на этом: уже достаточно. Или вернуться на
                главную и выбрать следующий маленький шаг.
              </p>
            </div>
            {lastDoneKey === "abc" && latestAbc() && (
              <div
                className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3"
                data-testid="abc-export"
              >
                <p className="text-[0.95rem] font-medium text-[var(--ink)]">
                  Отправить специалисту или сохранить
                </p>
                <p className="text-[0.9rem] text-[var(--ink-muted)]">
                  Word: файл .docx. PDF: через печать («Сохранить как PDF»).
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    data-testid="export-abc-word"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm font-medium text-[var(--ink)]"
                    onClick={async () => {
                      const entry = latestAbc();
                      if (!entry) return;
                      try {
                        const { exportAbcWord } = await import(
                          "@/lib/export-practice"
                        );
                        await exportAbcWord(entry);
                        setExportNotice("Word-файл скачан");
                      } catch {
                        setExportNotice("Не удалось создать Word");
                      }
                    }}
                  >
                    Word
                  </button>
                  <button
                    type="button"
                    data-testid="export-abc-pdf"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm font-medium text-[var(--ink)]"
                    onClick={async () => {
                      const entry = latestAbc();
                      if (!entry) return;
                      const { exportAbcPdf } = await import(
                        "@/lib/export-practice"
                      );
                      exportAbcPdf(entry);
                      setExportNotice(
                        "Откройте печать и выберите «Сохранить как PDF»",
                      );
                    }}
                  >
                    PDF
                  </button>
                </div>
                {exportNotice && (
                  <p className="text-[0.88rem] text-[var(--accent-ink)]">
                    {exportNotice}
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              data-testid="practice-done-home"
              className="clarity-cta-primary inline-flex h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold"
              onClick={() => setScreen("home")}
            >
              На главную
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                data-testid="practice-done-more"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-sm font-medium text-[var(--ink)]"
                onClick={() => setScreen("home")}
              >
                Ещё практика
              </button>
              <button
                type="button"
                data-testid="practice-done-log"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-medium text-[var(--accent-ink)]"
                onClick={() => setScreen("practice-log")}
              >
                Журнал
              </button>
            </div>
          </section>
        )}

        {screen === "new-situation" && (
          <section className="space-y-4">
            <DecisionFlowProgress screen={screen} />
            <h2 className="font-display text-xl text-[var(--ink)]">
              Что происходит?
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              Коротко опишите просьбу, приглашение или выбор, в котором нужна
              ясность.
            </p>
            <Textarea
              data-testid="situation-text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={5}
              placeholder="Например: коллега просит взять срочную задачу в пятницу вечером…"
            />
            <button
              type="button"
              data-testid="situation-next"
              className="clarity-cta-primary inline-flex h-12 w-full items-center justify-center rounded-xl px-4 text-sm font-medium disabled:opacity-40"
              disabled={draftText.trim().length < 8}
              onClick={() => setScreen("filter")}
            >
              Дальше
            </button>
          </section>
        )}

        {screen === "filter" && (
          <section className="space-y-4">
            <DecisionFlowProgress screen={screen} />
            <h2 className="font-display text-xl text-[var(--ink)]">
              Какой это круг?
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              От фильтра зависят вопросы: работа, близкие или друзья.
            </p>
            <div className="grid gap-2">
              {FILTERS.map((f) => (
                <button
                  type="button"
                  key={f}
                  data-testid={`filter-${f}`}
                  className="h-auto w-full rounded-xl bg-[var(--secondary)] px-4 py-3 text-left text-sm font-medium text-[var(--secondary-foreground)]"
                  onClick={() => chooseFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </section>
        )}

        {screen === "decision-questions" && draftFilter && (
          <section className="space-y-4">
            <DecisionFlowProgress screen={screen} />
            <p className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
              Вопрос {qIndex + 1} из {questions.length}
            </p>
            <div className="clarity-step-rail" aria-hidden>
              <span
                style={{
                  width: `${((qIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <h2 className="font-display text-xl leading-snug text-[var(--ink)]">
              {questions[qIndex]?.prompt}
            </h2>
            <div className="grid gap-2" data-testid="question-options">
              {questions[qIndex]?.options.map((opt, idx) => (
                <button
                  type="button"
                  key={opt.label}
                  data-testid={`question-option-${idx}`}
                  className="h-auto w-full rounded-xl bg-[var(--secondary)] px-4 py-3 text-left text-sm font-medium whitespace-normal text-[var(--secondary-foreground)]"
                  onClick={() => answerCurrent(opt.value, opt.label)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {screen === "summary" && (
          <section className="space-y-4">
            <DecisionFlowProgress screen={screen} />
            <h2 className="font-display text-xl text-[var(--ink)]">
              Мягкое резюме
            </h2>
            <p className="rounded-2xl bg-[var(--surface)] px-4 py-4 text-[var(--ink-soft)] leading-relaxed">
              {draftSummary}
            </p>
            <p className="text-sm text-[var(--ink-muted)]">
              Это ориентир, не приказ. Решение остаётся за вами.
            </p>
            <Button className="w-full" onClick={() => setScreen("decision")}>
              Выбрать решение
            </Button>
          </section>
        )}

        {screen === "decision" && (
          <section className="space-y-4">
            <DecisionFlowProgress screen={screen} />
            <h2 className="font-display text-xl text-[var(--ink)]">
              Зафиксировать решение
            </h2>
            <div className="grid gap-2">
              {suggestDecisions(draftLean).map((d) => (
                <Button
                  key={d}
                  variant={d === suggestDecisions(draftLean)[0] ? "default" : "secondary"}
                  className="h-auto py-3"
                  onClick={() => saveDecision(d)}
                >
                  {DECISION_LABELS[d]}
                </Button>
              ))}
            </div>
          </section>
        )}

        {screen === "feedback" && (
          <section className="space-y-4">
            <h2 className="font-display text-xl text-[var(--ink)]">
              Как отозвалось?
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="fb-gained">Что получили?</Label>
                <Input
                  id="fb-gained"
                  data-testid="fb-gained"
                  value={fbGained}
                  onChange={(e) => setFbGained(e.target.value)}
                  placeholder="Опыт, покой, связь…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-spent">Что потратили?</Label>
                <Input
                  id="fb-spent"
                  data-testid="fb-spent"
                  value={fbSpent}
                  onChange={(e) => setFbSpent(e.target.value)}
                  placeholder="Время, силы, деньги…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Как себя чувствуете?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["lighter", "Легче"],
                      ["same", "Так же"],
                      ["heavier", "Тяжелее"],
                    ] as const
                  ).map(([v, label]) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={fbFeeling === v ? "default" : "secondary"}
                      onClick={() => setFbFeeling(v)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Стоило того?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={fbWorth === true ? "default" : "secondary"}
                    onClick={() => setFbWorth(true)}
                  >
                    Да
                  </Button>
                  <Button
                    variant={fbWorth === false ? "default" : "secondary"}
                    onClick={() => setFbWorth(false)}
                  >
                    Нет
                  </Button>
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={fbWorth === null}
              onClick={saveFeedback}
            >
              Сохранить отзыв
            </Button>
          </section>
        )}

        {screen === "stats" && (
          <StatsView
            stats={stats}
            situations={state.situations}
            practices={state.practices}
            onOpenPractices={() => setScreen("practices")}
            onStartDecision={startNew}
          />
        )}

        {screen === "specialist" && (
          <section className="space-y-4">
            <h2 className="font-display text-xl text-[var(--ink)]">
              Мой специалист
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              Сейчас это ваш личный контакт, вне рефлексии. В дальнейшем
              здесь появятся контакты доверенных психологов.
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="spec-name">Имя</Label>
                <Input
                  id="spec-name"
                  data-testid="spec-name"
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  placeholder="Как обращаться"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spec-contact">Контакт</Label>
                <Input
                  id="spec-contact"
                  data-testid="spec-contact"
                  value={specContact}
                  onChange={(e) => setSpecContact(e.target.value)}
                  placeholder="Телефон, Telegram, email"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Заметка</Label>
                <Textarea
                  value={specNote}
                  onChange={(e) => setSpecNote(e.target.value)}
                  rows={3}
                  placeholder="Когда писать, о чём не забывать…"
                />
              </div>
            </div>
            <Button className="w-full" onClick={saveSpecialist}>
              Сохранить
            </Button>
          </section>
        )}

      </main>
    </div>
  );
}
