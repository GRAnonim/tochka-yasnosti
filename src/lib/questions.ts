import type { LifeFilter } from "./types";

type QuestionOption = {
  label: string;
  /** Positive leans toward accept/agree; negative toward decline/protect energy */
  value: number;
};

export type GuidedQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

const sharedTail: GuidedQuestion[] = [
  {
    id: "energy",
    prompt: "Сколько сил и внимания это реально потребует сейчас?",
    options: [
      { label: "Почти ничего: справлюсь спокойно", value: 2 },
      { label: "Умеренно: впишится в день", value: 1 },
      { label: "Заметно: придётся чем-то пожертвовать", value: -1 },
      { label: "Много: на грани или за ней", value: -2 },
    ],
  },
  {
    id: "aftertaste",
    prompt: "Если согласитесь, каким, скорее всего, будет послевкусие?",
    options: [
      { label: "Лёгкость или удовлетворение", value: 2 },
      { label: "Нейтрально, без сильных эмоций", value: 0 },
      { label: "Усталость или раздражение", value: -1 },
      { label: "Сожаление или опустошение", value: -2 },
    ],
  },
];

export const FILTER_LABELS: Record<LifeFilter, string> = {
  work: "Работа",
  close: "Близкие",
  friends: "Друзья / окружение",
};

export const QUESTIONS_BY_FILTER: Record<LifeFilter, GuidedQuestion[]> = {
  work: [
    {
      id: "work-goals",
      prompt: "Насколько это двигает ваши рабочие цели прямо сейчас?",
      options: [
        { label: "Прямо связано с главными задачами", value: 2 },
        { label: "Полезно, но не срочно", value: 1 },
        { label: "Скорее чужой приоритет", value: -1 },
        { label: "Отвлекает от важного", value: -2 },
      ],
    },
    {
      id: "work-boundary",
      prompt: "Есть ли здесь риск размыть границу (время, роль, ответственность)?",
      options: [
        { label: "Границы ясны, риск низкий", value: 2 },
        { label: "Нужно явно оговорить условия", value: 0 },
        { label: "Граница уже под давлением", value: -1 },
        { label: "Скорее всего, границы нарушат", value: -2 },
      ],
    },
    {
      id: "work-want",
      prompt: "Если убрать долг и ожидания других, вы сами этого хотите?",
      options: [
        { label: "Да, это мой интерес", value: 2 },
        { label: "Скорее да, с оговорками", value: 1 },
        { label: "Скорее нет", value: -1 },
        { label: "Нет, только из чувства долженствования", value: -2 },
      ],
    },
    ...sharedTail,
  ],
  close: [
    {
      id: "close-care",
      prompt: "Это больше про заботу о близком или про привычку «спасать»?",
      options: [
        { label: "Осознанная забота, мне ок", value: 2 },
        { label: "Смесь заботы и привычки", value: 0 },
        { label: "Больше привычка спасать", value: -1 },
        { label: "Я соглашаюсь из вины или страха", value: -2 },
      ],
    },
    {
      id: "close-self",
      prompt: "Останется ли место для ваших потребностей, если сказать «да»?",
      options: [
        { label: "Да, баланс сохранится", value: 2 },
        { label: "Придётся чуть подвинуть планы: приемлемо", value: 1 },
        { label: "Мои нужды отойдут на второй план", value: -1 },
        { label: "Я снова полностью растворюсь в другом", value: -2 },
      ],
    },
    {
      id: "close-honest",
      prompt: "Какой ответ был бы честным, если бы не боялись обидеть?",
      options: [
        { label: "Согласиться: это и правда моё «да»", value: 2 },
        { label: "Согласиться частично / на условиях", value: 1 },
        { label: "Перенести или предложить другое", value: -1 },
        { label: "Отказаться", value: -2 },
      ],
    },
    ...sharedTail,
  ],
  friends: [
    {
      id: "friends-want",
      prompt: "Вам самим хочется участвовать, или страшно выпасть из круга?",
      options: [
        { label: "Хочу, это живой интерес", value: 2 },
        { label: "Интересно наполовину", value: 1 },
        { label: "Скорее FOMO / привычка", value: -1 },
        { label: "Иду только чтобы «не обидеть»", value: -2 },
      ],
    },
    {
      id: "friends-fit",
      prompt: "Совпадает ли это с тем, как вы хотите проводить время сейчас?",
      options: [
        { label: "Да, в точку", value: 2 },
        { label: "В целом да", value: 1 },
        { label: "Скорее нет", value: -1 },
        { label: "Совсем не мой формат сейчас", value: -2 },
      ],
    },
    {
      id: "friends-cost",
      prompt: "Что вы отдадите взамен (время, деньги, восстановление)?",
      options: [
        { label: "Отдам мало: обмен честный", value: 2 },
        { label: "Отдам умеренно: ок", value: 1 },
        { label: "Отдам заметно больше, чем получу", value: -1 },
        { label: "Отдам то, чего сейчас критически не хватает", value: -2 },
      ],
    },
    ...sharedTail,
  ],
};

export const DECISION_LABELS: Record<string, string> = {
  accept: "Согласиться",
  decline: "Отказаться",
  postpone: "Перенести",
  limit: "Ограничить (время / объём)",
};
