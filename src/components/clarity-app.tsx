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
import { computeStats, statsLines } from "@/lib/stats";
import { emptyState, loadState, saveState, uid } from "@/lib/storage";
import { initTelegram } from "@/lib/telegram";
import type {
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
  HomeFavorites,
  MoodPracticeForm,
  PracticeLog,
  PracticesMenu,
} from "@/components/package1-practices";
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
import { PracticeGlyph } from "@/components/practice-icons";
import {
  loadPracticeFavorites,
  QUESTION_TOPICS,
  savePracticeFavorites,
  WHEEL_AREAS,
  type MenuPracticeKey,
  type QuestionTopicId,
} from "@/lib/practices";

const FILTERS: LifeFilter[] = ["work", "close", "friends"];

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
    const syncTg = () => {
      const wa = initTelegram();
      if (!wa) return;
      const name = wa.initDataUnsafe?.user?.first_name;
      setTgHint(name ? `Telegram · ${name}` : "Telegram Mini App");
    };
    syncTg();
    const t = window.setTimeout(syncTg, 800);
    return () => window.clearTimeout(t);
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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
    setScreen("practice-log");
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

  const startNew = () => {
    setDraftText("");
    setDraftFilter(null);
    setDraftAnswers([]);
    setQIndex(0);
    setDraftSummary("");
    setDraftLean("mixed");
    setScreen("new-situation");
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
    if (goals.length < 2) {
      setGoalError("Нужно минимум два ориентира — затем нажмите ещё раз.");
      return;
    }
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

  return (
    <div className="clarity-shell relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-10 pt-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="clarity-orb clarity-orb-a" />
        <div className="clarity-orb clarity-orb-b" />
        <div className="clarity-grain" />
      </div>

      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.22em] text-[var(--ink-muted)] uppercase">
            {tgHint}
          </p>
          <h1 className="font-display mt-1 text-2xl leading-tight text-[var(--ink)] sm:text-[1.7rem]">
            Точка ясности
          </h1>
        </div>
        {screen !== "home" &&
          screen !== "onboarding" &&
          screen !== "edit-goals" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ink-muted)]"
            onClick={() => setScreen("home")}
          >
            На главную
          </Button>
        )}
      </header>

      <main className="clarity-panel flex-1 animate-in fade-in duration-500">
        {(screen === "onboarding" || screen === "edit-goals") && (
          <section className="space-y-5" data-testid="goals-form">
            <p className="text-[var(--ink-soft)]">
              {screen === "edit-goals"
                ? "Обновите ориентиры — можно стереть старые и написать новые."
                : "Короткий помощник для решений и саморефлексии. Это не терапия и не диагноз — рядом с психологом или для спокойной ясности наедине с собой."}
            </p>
            <div className="space-y-3">
              <Label>2–3 ориентира на ближайшее время</Label>
              <p className="text-xs text-[var(--ink-muted)]">
                Серый текст в поле — только подсказка. Нужно вписать свои слова.
              </p>
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
                      ? "Свой ориентир №1"
                      : i === 1
                        ? "Свой ориентир №2"
                        : "Ещё один — по желанию"
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
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-base font-medium text-[var(--primary-foreground)] transition hover:opacity-95"
              onClick={saveGoals}
            >
              {screen === "edit-goals" ? "Сохранить ориентиры" : "Начать"}
            </button>
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
            <p className="pt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
              Не терапия и не диагноз. При кризисе — к специалисту
              (8-800-2000-122). Данные теста остаются в этом браузере.
            </p>
          </section>
        )}

        {screen === "home" && (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg leading-snug text-[var(--ink)]">
                Здесь можно мягко разобрать день и решения — без давления и без
                оценок.
              </p>
              <p className="text-sm text-[var(--ink-muted)]">
                Ваши ориентиры:{" "}
                {state.goals.map((g) => g.text).join(" · ") || "не заданы"}
              </p>
              <button
                type="button"
                data-testid="edit-goals"
                className="text-left text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline"
                onClick={openEditGoals}
              >
                Изменить ориентиры
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                data-testid="new-situation"
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--primary)] px-4 text-base font-medium text-[var(--primary-foreground)] transition hover:opacity-95"
                onClick={startNew}
              >
                <PracticeGlyph name="decision" className="h-5 w-5 opacity-95" />
                Разобрать решение
              </button>
              <button
                type="button"
                data-testid="open-practices"
                className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium text-[var(--secondary-foreground)] transition hover:opacity-95"
                onClick={() => setScreen("practices")}
              >
                <PracticeGlyph
                  name="practices"
                  className="h-5 w-5 text-[var(--accent-ink)]"
                />
                Все практики
              </button>
              <button
                type="button"
                data-testid="open-stats"
                className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium text-[var(--secondary-foreground)] transition hover:opacity-95"
                onClick={() => setScreen("stats")}
              >
                <PracticeGlyph
                  name="stats"
                  className="h-5 w-5 text-[var(--accent-ink)]"
                />
                Статистика
              </button>
            </div>

            <HomeFavorites
              favorites={favorites}
              onOpen={(key) => openPractice(key)}
            />

            {favorites.length === 0 && (
              <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
                В «Все практики» можно отметить звёздочкой то, чем пользуетесь
                часто — оно появится здесь.
              </p>
            )}

            {pendingFeedback.length > 0 && (
              <div className="space-y-3 border-t border-[var(--line)] pt-4">
                <h2 className="font-display text-base text-[var(--ink)]">
                  Обратная связь
                </h2>
                <p className="text-sm text-[var(--ink-muted)]">
                  В тесте можно ответить сразу. В жизни — через 1–3 дня после
                  решения.
                </p>
                <ul className="space-y-2">
                  {pendingFeedback.slice(0, 5).map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-left transition hover:border-[var(--accent)]"
                        onClick={() => openFeedback(s.id)}
                      >
                        <span className="line-clamp-2 text-sm text-[var(--ink)]">
                          {s.text}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                          Решение: {DECISION_LABELS[s.decision]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2 border-t border-[var(--line)] pt-4">
              <h2 className="font-display text-base text-[var(--ink)]">
                Мой специалист
              </h2>
              <p className="text-sm text-[var(--ink-muted)]">
                Тихий блок — не мешает рефлексии. Контакты только те, кому вы
                доверяете.
              </p>
              {state.specialist ? (
                <div className="rounded-xl bg-[var(--surface)] px-3 py-3 text-sm">
                  <p className="font-medium text-[var(--ink)]">
                    {state.specialist.name}
                  </p>
                  {state.specialist.contact && (
                    <p className="text-[var(--ink-soft)]">
                      {state.specialist.contact}
                    </p>
                  )}
                  {state.specialist.note && (
                    <p className="mt-1 text-[var(--ink-muted)]">
                      {state.specialist.note}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--ink-muted)]">Пока не указан.</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScreen("specialist")}
              >
                {state.specialist ? "Изменить" : "Указать контакты"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 text-sm">
              <button
                type="button"
                className="text-[var(--ink-muted)] underline-offset-4 hover:underline"
                onClick={() => {
                  const next = emptyState();
                  persist(next);
                  fillGoalInputs([]);
                  setScreen("onboarding");
                }}
              >
                Сбросить данные
              </button>
            </div>
            <details className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink-muted)]">
              <summary className="cursor-pointer text-[var(--accent-ink)]">
                Disclaimer
              </summary>
              <div className="mt-2 space-y-2 leading-relaxed">
                <p>
                  «Точка ясности» не ставит диагнозов и не заменяет врача или
                  психолога. При кризисе: 8-800-2000-122.
                </p>
              </div>
            </details>
          </section>
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
            onJournal={() => setScreen("practice-log")}
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
          />
        )}

        {screen === "new-situation" && (
          <section className="space-y-4">
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
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
              disabled={draftText.trim().length < 8}
              onClick={() => setScreen("filter")}
            >
              Дальше
            </button>
          </section>
        )}

        {screen === "filter" && (
          <section className="space-y-4">
            <h2 className="font-display text-xl text-[var(--ink)]">
              Какой это круг?
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              От фильтра зависят вопросы — работа, близкие или друзья.
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
            <p className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
              Вопрос {qIndex + 1} из {questions.length}
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
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
          <section className="space-y-4">
            <h2 className="font-display text-xl text-[var(--ink)]">
              Статистика
            </h2>
            <ul className="space-y-3">
              {statsLines(stats).map((line) => (
                <li
                  key={line}
                  className="rounded-xl bg-[var(--surface)] px-3 py-3 text-sm leading-relaxed text-[var(--ink-soft)]"
                >
                  {line}
                </li>
              ))}
            </ul>
            {state.situations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[var(--ink)]">
                  Недавние
                </h3>
                <ul className="space-y-2">
                  {state.situations.slice(0, 6).map((s) => (
                    <li
                      key={s.id}
                      className="border-b border-[var(--line)] pb-2 text-sm last:border-0"
                    >
                      <p className="line-clamp-2 text-[var(--ink)]">{s.text}</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {FILTER_LABELS[s.filter]} · {DECISION_LABELS[s.decision]}
                        {s.feedback
                          ? ` · отзыв: ${s.feedback.worthIt ? "стоило" : "не стоило"}`
                          : " · ждёт отзыва"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {screen === "specialist" && (
          <section className="space-y-4">
            <h2 className="font-display text-xl text-[var(--ink)]">
              Мой специалист
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              Доска психологов появится позже. Сейчас — только ваши доверенные
              контакты, отдельно от потока рефлексии.
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
