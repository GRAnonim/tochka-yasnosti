"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PRACTICE_META,
  QUESTION_TOPICS,
  type QuestionTopicId,
} from "@/lib/practices";

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
    <section className="space-y-4" data-testid="abc-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META.abc.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Классическая схема КПТ (Эллис/Бек): событие → мысль → последствия.
          Это самопомощь, не замена терапии.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="abc-a">A — активирующее событие</Label>
        <Textarea
          id="abc-a"
          data-testid="abc-a"
          rows={3}
          value={activating}
          onChange={(e) => setActivating(e.target.value)}
          placeholder="Что произошло? Только факты, по возможности без оценок…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="abc-b">B — мысли / убеждения</Label>
        <Textarea
          id="abc-b"
          data-testid="abc-b"
          rows={3}
          value={beliefs}
          onChange={(e) => setBeliefs(e.target.value)}
          placeholder="Что я подумал(а) об этом? Какая мысль промелькнула?"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="abc-c">C — последствия</Label>
        <Textarea
          id="abc-c"
          data-testid="abc-c"
          rows={3}
          value={consequences}
          onChange={(e) => setConsequences(e.target.value)}
          placeholder="Какие чувства и что я сделал(а) / хотел(а) сделать?"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="abc-reframe">Более гибкая мысль (по желанию)</Label>
        <Textarea
          id="abc-reframe"
          data-testid="abc-reframe"
          rows={3}
          value={reframe}
          onChange={(e) => setReframe(e.target.value)}
          placeholder="Как ещё можно посмотреть на это — мягко и реалистично?"
        />
      </div>

      <button
        type="button"
        data-testid="abc-save"
        disabled={!ready}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить ABC
      </button>
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
    <section className="space-y-4" data-testid="questions-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META.questions.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Выберите тему — появятся 3 открытых вопроса. Отвечайте коротко, своими
          словами.
        </p>
      </div>

      {!topic && (
        <div className="grid gap-2">
          {QUESTION_TOPICS.map((t) => (
            <button
              type="button"
              key={t.id}
              data-testid={`questions-topic-${t.id}`}
              className="rounded-xl bg-[var(--secondary)] px-4 py-3 text-left text-sm font-medium"
              onClick={() => setTopicId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {topic && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--ink-soft)]">
              Тема: <span className="font-medium">{topic.label}</span>
            </p>
            <button
              type="button"
              data-testid="questions-change-topic"
              className="shrink-0 text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline"
              onClick={() => setTopicId(null)}
            >
              Сменить тему
            </button>
          </div>
          <div className="space-y-4">
            {topic.questions.map((q, index) => (
              <div key={q.id} className="space-y-1.5">
                <Label htmlFor={`q-${q.id}`}>
                  {index + 1}. {q.text}
                </Label>
                <Textarea
                  id={`q-${q.id}`}
                  data-testid={`questions-answer-${q.id}`}
                  rows={3}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Ваш ответ…"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            data-testid="questions-save"
            disabled={!ready}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
            onClick={onSave}
          >
            Сохранить ответы
          </button>
        </>
      )}
    </section>
  );
}
