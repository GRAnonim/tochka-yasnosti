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
    blurb: "Отметьте фон дня и чем были заняты. Около 1–2 минут.",
    pace: "Около двух минут",
  },
  gratitude: {
    title: "Благодарность",
    blurb: "1–3 вещи, за которые сегодня можно сказать «спасибо».",
    pace: "Минута или две",
  },
  emotions: {
    title: "Эмоции",
    blurb: "Назовите чувства и силу переживания, без оценки «правильно/нет».",
    pace: "Около двух минут",
  },
  questions: {
    title: "Генератор вопросов",
    blurb: "Три направляющих вопроса по теме, чтобы яснее увидеть мысль.",
    pace: "Три коротких ответа",
  },
  abc: {
    title: "ABC-дневник",
    blurb: "A: событие. B: мысль. C: чувства и поведение (КПТ).",
    pace: "Три шага",
  },
  wheel: {
    title: "Колесо баланса",
    blurb: "Оцените сферы жизни от 1 до 10 и заметьте, куда тянет внимание.",
    pace: "Снимок восьми сфер",
  },
  breath: {
    title: "Практика дыхания",
    blurb: "1–3 минуты спокойного дыхания и короткая заметка после.",
    pace: "1-3 минуты",
  },
  "ideal-day": {
    title: "Идеальный день",
    blurb: "Опишите желаемый день по шагам и один маленький шаг к нему.",
    pace: "Несколько коротких картин",
  },
  "five-whys": {
    title: "5 почему",
    blurb:
      "Аккуратно дойдите до корня чувства и мягко закройте вопрос «что нужно сейчас».",
    pace: "2-5 мягких шагов",
  },
  decision: {
    title: "Определиться с выбором",
    blurb: "Когда есть конкретный выбор: мягкий разбор по шагам.",
    pace: "Короткий разбор",
  },
} as const;

/** Groups help the eye scan a long list without rainbow categories.
 *  «Определиться с выбором» живёт только на главном: отдельный цикл, не практика. */
export const PRACTICE_MENU_GROUPS = [
  {
    id: "day",
    title: "День и чувства",
    items: ["mood", "gratitude", "emotions"],
  },
  {
    id: "thoughts",
    title: "Мысли и ясность",
    items: ["questions", "abc", "five-whys"],
  },
  {
    id: "body",
    title: "Тело и картина жизни",
    items: ["breath", "wheel", "ideal-day"],
  },
] as const;

export type MenuPracticeKey =
  (typeof PRACTICE_MENU_GROUPS)[number]["items"][number];

const MENU_PRACTICE_KEYS: MenuPracticeKey[] =
  PRACTICE_MENU_GROUPS.flatMap((g) => [...g.items]);

const PRACTICE_FAVORITES_KEY = "tochka-practice-favorites-v1";

export function loadPracticeFavorites(): MenuPracticeKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRACTICE_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k): k is MenuPracticeKey =>
      MENU_PRACTICE_KEYS.includes(k as MenuPracticeKey),
    );
  } catch {
    return [];
  }
}

export function savePracticeFavorites(keys: MenuPracticeKey[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRACTICE_FAVORITES_KEY, JSON.stringify(keys));
  } catch {
    /* ignore */
  }
}

export const IDEAL_DAY_HORIZONS = [
  "Обычный хороший день",
  "Через месяц",
  "Через год",
] as const;

export const FIVE_WHYS_MAX = 5;
export const FIVE_WHYS_MIN = 2;

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

/** Inhale / exhale length presets (seconds) */
export const BREATH_RHYTHMS = [
  { id: "4-4", inhale: 4, exhale: 4, label: "4 / 4", hint: "ровный" },
  { id: "4-6", inhale: 4, exhale: 6, label: "4 / 6", hint: "длиннее выдох" },
  { id: "3-5", inhale: 3, exhale: 5, label: "3 / 5", hint: "мягче" },
  { id: "5-5", inhale: 5, exhale: 5, label: "5 / 5", hint: "медленнее" },
] as const;

export type BreathRhythmId = (typeof BREATH_RHYTHMS)[number]["id"];

const BREATH_SETTINGS_KEY = "tochka-breath-settings-v1";

export type BreathUiSettings = {
  rhythmId: BreathRhythmId;
  soundOn: boolean;
};

export function loadBreathSettings(): BreathUiSettings {
  const fallback: BreathUiSettings = { rhythmId: "4-6", soundOn: true };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(BREATH_SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<BreathUiSettings>;
    const ok = BREATH_RHYTHMS.some((r) => r.id === parsed.rhythmId);
    return {
      rhythmId: ok ? (parsed.rhythmId as BreathRhythmId) : fallback.rhythmId,
      soundOn: typeof parsed.soundOn === "boolean" ? parsed.soundOn : true,
    };
  } catch {
    return fallback;
  }
}

export function saveBreathSettings(settings: BreathUiSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BREATH_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export type QuestionTopicId =
  | "values"
  | "conflict"
  | "self"
  | "evening"
  | "anxiety";

export const QUESTION_TOPICS: {
  id: QuestionTopicId;
  label: string;
  hint: string;
  questions: { id: string; text: string }[];
}[] = [
  {
    id: "values",
    label: "Ценности и важное",
    hint: "Что беречь в этом выборе",
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
    hint: "Что задело и чего хочется",
    questions: [
      {
        id: "c1",
        text: "Что именно меня задело: факт или моя интерпретация?",
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
    hint: "Какую историю вы себе рассказываете",
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
    hint: "Закрыть день без суда",
    questions: [
      {
        id: "e1",
        text: "Что сегодня получилось, хотя бы чуть-чуть?",
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
    hint: "Отделить страх от факта",
    questions: [
      {
        id: "a1",
        text: "Чего именно я боюсь, что случится?",
      },
      {
        id: "a2",
        text: "Насколько это вероятно, и что ещё может произойти?",
      },
      {
        id: "a3",
        text: "Что я могу контролировать прямо сейчас, а что нет?",
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
