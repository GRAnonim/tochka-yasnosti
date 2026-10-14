"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PracticeCard,
  PracticeChoice,
  PracticeHeader,
  PracticeSave,
} from "@/components/practice-ui";
import {
  FIVE_WHYS_MAX,
  FIVE_WHYS_MIN,
  IDEAL_DAY_HORIZONS,
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
    <section className="practice-sheet" data-testid="ideal-day-form">
      <PracticeHeader
        practiceKey="ideal-day"
        intro="Не идеал на витрину, а день, в котором вам по-настоящему хорошо. Потом один маленький шаг ближе к нему."
      />

      <PracticeCard step={1} title="Горизонт" hint="Какой день представляете">
        <div className="grid gap-2">
          {IDEAL_DAY_HORIZONS.map((h) => (
            <PracticeChoice
              key={h}
              testId={`ideal-horizon-${h}`}
              active={horizon === h}
              onClick={() => setHorizon(h)}
              title={h}
            />
          ))}
        </div>
      </PracticeCard>

      <PracticeCard step={2} title="Где вы" hint="Обстановка, свет, место">
        <Label htmlFor="ideal-setting" className="sr-only">
          Где вы и какая обстановка
        </Label>
        <Textarea
          id="ideal-setting"
          data-testid="ideal-setting"
          rows={2}
          className="min-h-[4.5rem]"
          value={setting}
          onChange={(e) => setSetting(e.target.value)}
          placeholder="Например: утро дома, свет, тихо"
        />
      </PracticeCard>
      <PracticeCard step={3} title="Что вы делаете" hint="Работа, отдых, движение">
        <Label htmlFor="ideal-actions" className="sr-only">
          Что вы делаете в течение дня
        </Label>
        <Textarea
          id="ideal-actions"
          data-testid="ideal-actions"
          rows={3}
          className="min-h-[5.5rem]"
          value={actions}
          onChange={(e) => setActions(e.target.value)}
          placeholder="Без спешки, с паузами"
        />
      </PracticeCard>
      <PracticeCard step={4} title="Как вы себя чувствуете" hint="Телом и эмоциями">
        <Label htmlFor="ideal-feelings" className="sr-only">
          Как вы себя чувствуете
        </Label>
        <Textarea
          id="ideal-feelings"
          data-testid="ideal-feelings"
          rows={2}
          className="min-h-[4.5rem]"
          value={feelings}
          onChange={(e) => setFeelings(e.target.value)}
          placeholder="Спокойно, собрано, тепло"
        />
      </PracticeCard>
      <PracticeCard step={5} title="С кем вы" hint="Или наедине с собой, по желанию">
        <Label htmlFor="ideal-people" className="sr-only">
          С кем вы
        </Label>
        <Input
          id="ideal-people"
          data-testid="ideal-people"
          className="h-12"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          placeholder="По желанию"
        />
      </PracticeCard>
      <PracticeCard
        step={6}
        title="Один маленький шаг"
        hint="Что реально сделать уже завтра"
      >
        <Label htmlFor="ideal-step" className="sr-only">
          Один маленький шаг на ближайшие дни
        </Label>
        <Textarea
          id="ideal-step"
          data-testid="ideal-step"
          rows={2}
          className="min-h-[4.5rem]"
          value={smallStep}
          onChange={(e) => setSmallStep(e.target.value)}
          placeholder="Конкретное и маленькое"
        />
      </PracticeCard>

      <PracticeSave
        testId="ideal-day-save"
        disabled={!ready}
        onClick={onSave}
      >
        Сохранить
      </PracticeSave>
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

  const whyTitles = [
    "Почему это так",
    "А это откуда",
    "Что стоит глубже",
    "Ещё на слой ниже",
    "Самое тихое «потому что»",
  ];

  return (
    <section className="practice-sheet" data-testid="five-whys-form">
      <PracticeHeader
        practiceKey="five-whys"
        intro="Идём вглубь мягко. Достаточно двух-пяти ответов. Если становится тяжело, остановитесь и ответьте, что нужно сейчас."
      />

      <PracticeCard
        step={1}
        title="С чего начинаем"
        hint="Ситуация, чувство или мысль"
      >
        <Label htmlFor="five-start" className="sr-only">
          С чего начинаем
        </Label>
        <Textarea
          id="five-start"
          data-testid="five-start"
          rows={3}
          className="min-h-[5.5rem]"
          value={starting}
          onChange={(e) => setStarting(e.target.value)}
          placeholder="Что хочется понять"
        />
      </PracticeCard>

      <div className="practice-chain">
        {steps.map((step, index) => (
          <PracticeCard
            key={index}
            step={index + 2}
            title={whyTitles[index] ?? `Ещё один слой`}
            hint={index === 0 ? "Первый ответ, своими словами" : "Без давления докопаться"}
          >
            <Label htmlFor={`five-why-${index}`} className="sr-only">
              {whyTitles[index]}
            </Label>
            <Textarea
              id={`five-why-${index}`}
              data-testid={`five-why-${index}`}
              rows={2}
              className="min-h-[4.5rem]"
              value={step}
              onChange={(e) => setStepWhy(index, e.target.value)}
              placeholder={
                index === 0
                  ? "Потому что"
                  : "А это почему так важно"
              }
            />
          </PracticeCard>
        ))}
      </div>

      {canAdd && (
        <button
          type="button"
          data-testid="five-whys-add"
          className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-[0.98rem] font-medium text-[var(--ink)]"
          onClick={addStep}
        >
          Ещё один слой ({steps.length}/{FIVE_WHYS_MAX})
        </button>
      )}

      <PracticeCard
        title="Что мне нужно сейчас"
        hint="Опора, пауза, граница, вода, сон"
      >
        <Label htmlFor="five-need" className="sr-only">
          Что мне нужно сейчас
        </Label>
        <Textarea
          id="five-need"
          data-testid="five-need"
          rows={2}
          className="min-h-[4.5rem]"
          value={needNow}
          onChange={(e) => setNeedNow(e.target.value)}
          placeholder="Что поддержит прямо сейчас"
        />
      </PracticeCard>

      <PracticeSave
        testId="five-whys-save"
        disabled={!ready}
        onClick={onSave}
      >
        Сохранить
      </PracticeSave>
    </section>
  );
}
