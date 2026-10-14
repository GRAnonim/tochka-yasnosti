"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PracticeCard,
  PracticeChoice,
  PracticeHeader,
  PracticeSave,
} from "@/components/practice-ui";
import { QUESTION_TOPICS, type QuestionTopicId } from "@/lib/practices";

export function AbcPracticeForm({
  activating,
  setActivating,
  beliefs,
  setBeliefs,
  consequences,
  setConsequences,
  reframe,
  setReframe,
  onSave,
}: {
  activating: string;
  setActivating: (v: string) => void;
  beliefs: string;
  setBeliefs: (v: string) => void;
  consequences: string;
  setConsequences: (v: string) => void;
  reframe: string;
  setReframe: (v: string) => void;
  onSave: () => void;
}) {
  const ready =
    activating.trim().length >= 3 &&
    beliefs.trim().length >= 3 &&
    consequences.trim().length >= 3;

  return (
    <section className="practice-sheet" data-testid="abc-form">
      <PracticeHeader
        practiceKey="abc"
        intro="Событие, мысль, что за этим. Это самопомощь, не замена терапии."
      />
      <PracticeCard
        step="A"
        title="Что произошло"
        hint="Факты, по возможности без оценок"
      >
        <Label htmlFor="abc-a" className="sr-only">
          Событие
        </Label>
        <Textarea
          id="abc-a"
          data-testid="abc-a"
          rows={3}
          className="min-h-[5.5rem]"
          value={activating}
          onChange={(e) => setActivating(e.target.value)}
          placeholder="Что случилось"
        />
      </PracticeCard>
      <PracticeCard
        step="B"
        title="Какая мысль промелькнула"
        hint="Что вы сказали себе об этом"
      >
        <Label htmlFor="abc-b" className="sr-only">
          Мысли
        </Label>
        <Textarea
          id="abc-b"
          data-testid="abc-b"
          rows={3}
          className="min-h-[5.5rem]"
          value={beliefs}
          onChange={(e) => setBeliefs(e.target.value)}
          placeholder="Я подумал(а), что…"
        />
      </PracticeCard>
      <PracticeCard
        step="C"
        title="Что за этим"
        hint="Чувства и что хотелось сделать"
      >
        <Label htmlFor="abc-c" className="sr-only">
          Последствия
        </Label>
        <Textarea
          id="abc-c"
          data-testid="abc-c"
          rows={3}
          className="min-h-[5.5rem]"
          value={consequences}
          onChange={(e) => setConsequences(e.target.value)}
          placeholder="Тревога, злость, желание сразу согласиться…"
        />
      </PracticeCard>
      <PracticeCard
        title="Более гибкая мысль"
        hint="По желанию: как ещё можно посмотреть"
      >
        <Label htmlFor="abc-reframe" className="sr-only">
          Более гибкая мысль
        </Label>
        <Textarea
          id="abc-reframe"
          data-testid="abc-reframe"
          rows={3}
          className="min-h-[5.5rem]"
          value={reframe}
          onChange={(e) => setReframe(e.target.value)}
          placeholder="Мягко и реалистично"
        />
      </PracticeCard>
      <PracticeSave testId="abc-save" disabled={!ready} onClick={onSave}>
        Сохранить
      </PracticeSave>
    </section>
  );
}

export function QuestionsPracticeForm({
  topicId,
  setTopicId,
  answers,
  setAnswer,
  onSave,
}: {
  topicId: QuestionTopicId | null;
  setTopicId: (id: QuestionTopicId | null) => void;
  answers: Record<string, string>;
  setAnswer: (questionId: string, value: string) => void;
  onSave: () => void;
}) {
  const topic = QUESTION_TOPICS.find((t) => t.id === topicId) ?? null;
  const ready =
    topic !== null &&
    topic.questions.every((q) => (answers[q.id] ?? "").trim().length >= 2);

  return (
    <section className="practice-sheet" data-testid="questions-form">
      <PracticeHeader
        practiceKey="questions"
        intro="Выберите тему. Появятся три открытых вопроса. Отвечайте коротко, своими словами."
      />

      {!topic && (
        <PracticeCard title="Тема" hint="С чего начать этот разговор с собой">
          <div className="grid gap-2">
            {QUESTION_TOPICS.map((t) => (
              <PracticeChoice
                key={t.id}
                testId={`questions-topic-${t.id}`}
                active={false}
                onClick={() => setTopicId(t.id)}
                title={t.label}
                hint={t.hint}
              />
            ))}
          </div>
        </PracticeCard>
      )}

      {topic && (
        <>
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-3">
            <div>
              <p className="text-[0.78rem] uppercase tracking-[0.04em] text-[var(--ink-muted)]">
                Тема
              </p>
              <p className="mt-0.5 font-semibold text-[var(--ink)]">
                {topic.label}
              </p>
            </div>
            <button
              type="button"
              data-testid="questions-change-topic"
              className="shrink-0 pt-0.5 text-[0.92rem] text-[var(--accent-ink)] underline-offset-4 hover:underline"
              onClick={() => setTopicId(null)}
            >
              Сменить
            </button>
          </div>
          {topic.questions.map((q, index) => (
            <PracticeCard key={q.id} step={index + 1} title={q.text}>
              <Label htmlFor={`q-${q.id}`} className="sr-only">
                {q.text}
              </Label>
              <Textarea
                id={`q-${q.id}`}
                data-testid={`questions-answer-${q.id}`}
                rows={3}
                className="min-h-[5.5rem]"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Коротко, своими словами"
              />
            </PracticeCard>
          ))}
          <PracticeSave
            testId="questions-save"
            disabled={!ready}
            onClick={onSave}
          >
            Сохранить ответы
          </PracticeSave>
        </>
      )}
    </section>
  );
}
