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
  decision: {
    title: "Разобрать решение",
    blurb: "Ситуация → вопросы → мягкое резюме → фиксация выбора.",
  },
} as const;

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
