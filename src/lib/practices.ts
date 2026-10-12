export const MOOD_OPTIONS = [
  { value: 1 as const, label: "Очень тяжело", hint: "1" },
  { value: 2 as const, label: "Плохо", hint: "2" },
  { value: 3 as const, label: "Нормально", hint: "3" },
  { value: 4 as const, label: "Хорошо", hint: "4" },
  { value: 5 as const, label: "Отлично", hint: "5" },
];

export const ACTIVITY_TAGS = [
  "работа",
  "учёба",
  "спорт",
  "отдых",
  "семья",
  "друзья",
  "сон",
  "еда",
  "прогулка",
  "хобби",
];

export const EMOTION_TAGS = [
  "спокойствие",
  "радость",
  "интерес",
  "благодарность",
  "тревога",
  "грусть",
  "злость",
  "усталость",
  "стыд",
  "вина",
  "надежда",
  "одиночество",
];

export const PRACTICE_META = {
  mood: {
    title: "Дневник настроения",
    blurb: "Отметьте фон дня и чем были заняты — 1–2 минуты.",
  },
  gratitude: {
    title: "Благодарность",
    blurb: "1–3 вещи, за которые сегодня можно сказать «спасибо».",
  },
  emotions: {
    title: "Эмоции",
    blurb: "Назовите чувства и силу переживания — без оценки «правильно/нет».",
  },
  questions: {
    title: "Генератор вопросов",
    blurb: "3 направляющих вопроса по теме — чтобы яснее увидеть мысль.",
  },
  abc: {
    title: "ABC-дневник",
    blurb: "A — событие, B — мысль, C — чувства и поведение (КПТ).",
  },
  wheel: {
    title: "Колесо баланса",
    blurb: "Оцените сферы жизни от 1 до 10 и заметьте, куда тянет внимание.",
  },
  breath: {
    title: "Практика дыхания",
    blurb: "1–3 минуты спокойного дыхания и короткая заметка после.",
  },
  decision: {
    title: "Разобрать решение",
    blurb: "Ситуация → вопросы → мягкое резюме → фиксация выбора.",
  },
} as const;

export const WHEEL_AREAS = [
  { id: "health", label: "Здоровье" },
  { id: "work", label: "Работа / учёба" },
  { id: "money", label: "Финансы" },
  { id: "relations", label: "Отношения" },
  { id: "friends", label: "Друзья / окружение" },
  { id: "growth", label: "Рост / развитие" },
  { id: "rest", label: "Отдых / восстановление" },
  { id: "meaning", label: "Смысл / ценности" },
] as const;

export const BREATH_DURATIONS = [
  { sec: 60 as const, label: "1 минута" },
  { sec: 120 as const, label: "2 минуты" },
  { sec: 180 as const, label: "3 минуты" },
];

export type QuestionTopicId =
  | "values"
  | "conflict"
  | "self"
  | "evening"
  | "anxiety";

export const QUESTION_TOPICS: {
  id: QuestionTopicId;
  label: string;
  questions: { id: string; text: string }[];
}[] = [
  {
    id: "values",
    label: "Ценности и важное",
    questions: [
      {
        id: "v1",
        text: "Что в этой ситуации для меня действительно важно?",
      },
      {
        id: "v2",
        text: "Какой мой ориентир сейчас помогает выбрать дальше?",
      },
      {
        id: "v3",
        text: "О чём я не хочу жалеть через неделю?",
      },
    ],
  },
  {
    id: "conflict",
    label: "Конфликт / напряжение",
    questions: [
      {
        id: "c1",
        text: "Что именно меня задело — факт или моя интерпретация?",
      },
      {
        id: "c2",
        text: "Чего я хочу в итоге: быть правым, быть услышанным или сохранить связь?",
      },
      {
        id: "c3",
        text: "Какой следующий шаг будет мягче и честнее?",
      },
    ],
  },
  {
    id: "self",
    label: "О себе",
    questions: [
      {
        id: "s1",
        text: "Какую историю о себе я сейчас рассказываю?",
      },
      {
        id: "s2",
        text: "Есть ли более доброжелательная, но всё ещё правдивая версия?",
      },
      {
        id: "s3",
        text: "Что бы я сказал близкому другу в такой же ситуации?",
      },
    ],
  },
  {
    id: "evening",
    label: "Вечерняя рефлексия",
    questions: [
      {
        id: "e1",
        text: "Что сегодня получилось — хотя бы чуть-чуть?",
      },
      {
        id: "e2",
        text: "Где я потратил силы не туда, куда хотел?",
      },
      {
        id: "e3",
        text: "Чего хватит на завтра как одного маленького шага?",
      },
    ],
  },
  {
    id: "anxiety",
    label: "Тревожная мысль",
    questions: [
      {
        id: "a1",
        text: "Чего именно я боюсь, что случится?",
      },
      {
        id: "a2",
        text: "Насколько это вероятно — и что ещё может произойти?",
      },
      {
        id: "a3",
        text: "Что я могу контролировать прямо сейчас, а что — нет?",
      },
    ],
  },
];

export function moodLabel(value: number): string {
  return MOOD_OPTIONS.find((m) => m.value === value)?.label ?? String(value);
}

export function formatPracticeDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
