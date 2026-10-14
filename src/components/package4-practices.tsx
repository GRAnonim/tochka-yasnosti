"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FIVE_WHYS_MAX,
  FIVE_WHYS_MIN,
  IDEAL_DAY_HORIZONS,
  PRACTICE_META,
} from "@/lib/practices";

export function IdealDayPracticeForm({
  horizon,
  setHorizon,
  setting,
  setSetting,
  actions,
  setActions,
  feelings,
  setFeelings,
  people,
  setPeople,
  smallStep,
  setSmallStep,
  onSave,
}: {
  horizon: string;
  setHorizon: (v: string) => void;
  setting: string;
  setSetting: (v: string) => void;
  actions: string;
  setActions: (v: string) => void;
  feelings: string;
  setFeelings: (v: string) => void;
  people: string;
  setPeople: (v: string) => void;
  smallStep: string;
  setSmallStep: (v: string) => void;
  onSave: () => void;
}) {
  const ready =
    horizon.trim().length > 0 &&
    setting.trim().length >= 3 &&
    actions.trim().length >= 3 &&
    feelings.trim().length >= 3 &&
    smallStep.trim().length >= 3;

  return (
    <section className="space-y-4" data-testid="ideal-day-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META["ideal-day"].title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Не идеал «на витрину», а день, в котором вам по-настоящему хорошо.
          Потом один маленький шаг ближе к нему.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Горизонт</Label>
        <div className="grid gap-2">
          {IDEAL_DAY_HORIZONS.map((h) => (
            <button
              type="button"
              key={h}
              data-testid={`ideal-horizon-${h}`}
              className={
                horizon === h
                  ? "rounded-xl bg-[var(--primary)] px-4 py-3 text-left text-sm font-medium text-[var(--primary-foreground)]"
                  : "rounded-xl bg-[var(--secondary)] px-4 py-3 text-left text-sm font-medium"
              }
              onClick={() => setHorizon(h)}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ideal-setting">Где вы и какая обстановка?</Label>
        <Textarea
          id="ideal-setting"
          data-testid="ideal-setting"
          rows={2}
          value={setting}
          onChange={(e) => setSetting(e.target.value)}
          placeholder="Например: утро дома, свет, тихо…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ideal-actions">Что вы делаете в течение дня?</Label>
        <Textarea
          id="ideal-actions"
          data-testid="ideal-actions"
          rows={3}
          value={actions}
          onChange={(e) => setActions(e.target.value)}
          placeholder="Работа, отдых, движение, творчество…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ideal-feelings">Как вы себя чувствуете?</Label>
        <Textarea
          id="ideal-feelings"
          data-testid="ideal-feelings"
          rows={2}
          value={feelings}
          onChange={(e) => setFeelings(e.target.value)}
          placeholder="Телом и эмоциями…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ideal-people">С кем вы (или наедине с собой)?</Label>
        <Input
          id="ideal-people"
          data-testid="ideal-people"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          placeholder="По желанию"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ideal-step">Один маленький шаг на ближайшие дни</Label>
        <Textarea
          id="ideal-step"
          data-testid="ideal-step"
          rows={2}
          value={smallStep}
          onChange={(e) => setSmallStep(e.target.value)}
          placeholder="Что реально сделать уже завтра?"
        />
      </div>

      <button
        type="button"
        data-testid="ideal-day-save"
        disabled={!ready}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить
      </button>
    </section>
  );
}

export function FiveWhysPracticeForm({
  starting,
  setStarting,
  steps,
  setStepWhy,
  addStep,
  needNow,
  setNeedNow,
  onSave,
}: {
  starting: string;
  setStarting: (v: string) => void;
  steps: string[];
  setStepWhy: (index: number, value: string) => void;
  addStep: () => void;
  needNow: string;
  setNeedNow: (v: string) => void;
  onSave: () => void;
}) {
  const filledSteps = steps.filter((s) => s.trim().length >= 2).length;
  const canAdd =
    steps.length < FIVE_WHYS_MAX &&
    steps.length > 0 &&
    (steps[steps.length - 1] ?? "").trim().length >= 2;
  const ready =
    starting.trim().length >= 3 &&
    filledSteps >= FIVE_WHYS_MIN &&
    needNow.trim().length >= 2;

  return (
    <section className="space-y-4" data-testid="five-whys-form">
      <div>
        <h2 className="font-display text-xl text-[var(--ink)]">
          {PRACTICE_META["five-whys"].title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Идём вглубь мягко. Достаточно 2–5 ответов. Если становится тяжело,
          остановитесь и ответьте, что нужно сейчас. Это не копание «до дна».
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="five-start">С чего начинаем?</Label>
        <Textarea
          id="five-start"
          data-testid="five-start"
          rows={3}
          value={starting}
          onChange={(e) => setStarting(e.target.value)}
          placeholder="Ситуация, чувство или мысль, которую хочется понять…"
        />
      </div>

      {steps.map((step, index) => (
        <div key={index} className="space-y-1.5">
          <Label htmlFor={`five-why-${index}`}>
            Почему {index + 1}?
          </Label>
          <Textarea
            id={`five-why-${index}`}
            data-testid={`five-why-${index}`}
            rows={2}
            value={step}
            onChange={(e) => setStepWhy(index, e.target.value)}
            placeholder={
              index === 0
                ? "Потому что…"
                : "А это почему так важно / откуда берётся?"
            }
          />
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          data-testid="five-whys-add"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--secondary)] px-4 text-sm font-medium"
          onClick={addStep}
        >
          Ещё одно «почему» ({steps.length}/{FIVE_WHYS_MAX})
        </button>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="five-need">Что мне нужно сейчас?</Label>
        <Textarea
          id="five-need"
          data-testid="five-need"
          rows={2}
          value={needNow}
          onChange={(e) => setNeedNow(e.target.value)}
          placeholder="Опора, пауза, разговор, граница, вода, сон…"
        />
      </div>

      <button
        type="button"
        data-testid="five-whys-save"
        disabled={!ready}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-40"
        onClick={onSave}
      >
        Сохранить
      </button>
    </section>
  );
}
