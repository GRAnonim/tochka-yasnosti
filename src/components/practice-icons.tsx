import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Soft horizon — mood / day tone */
function IconMood(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 14c2.5-3 5-4.5 8-4.5S17.5 11 20 14" />
      <path d="M5 18h14" opacity={0.45} />
    </BaseIcon>
  );
}

/** Open bowl / receiving — gratitude */
function IconGratitude(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 11c0 4 2.5 6.5 5.5 6.5s5.5-2.5 5.5-6.5" />
      <path d="M8 9.5c1.2-1.8 2.6-2.7 4-2.7s2.8.9 4 2.7" opacity={0.55} />
    </BaseIcon>
  );
}

/** Nested soft rings — emotions */
function IconEmotions(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="4.2" opacity={0.55} />
      <circle cx="12" cy="12" r="1.4" opacity={0.35} />
    </BaseIcon>
  );
}

/** Three quiet marks — questions */
function IconQuestions(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 8h7" />
      <path d="M7 12h10" opacity={0.7} />
      <path d="M7 16h5" opacity={0.45} />
    </BaseIcon>
  );
}

/** Three descending steps — ABC */
function IconAbc(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 8h5v3H5z" />
      <path d="M10 11h5v3h-5z" opacity={0.7} />
      <path d="M15 14h5v3h-5z" opacity={0.45} />
    </BaseIcon>
  );
}

/** Soft radar octagon — wheel of life */
function IconWheel(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5 17.2 7.2 19.5 12 17.2 16.8 12 19.5 6.8 16.8 4.5 12 6.8 7.2Z" />
      <path d="M12 12 17.2 7.2" opacity={0.4} />
      <path d="M12 12 6.8 16.8" opacity={0.4} />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" opacity={0.55} />
    </BaseIcon>
  );
}

/** Expanding breath rings */
function IconBreath(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="6.2" opacity={0.5} />
      <path d="M12 3.8v1.6M12 18.6v1.6M3.8 12h1.6M18.6 12h1.6" opacity={0.35} />
    </BaseIcon>
  );
}

/** Soft path toward light — ideal day */
function IconIdealDay(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 17c2.5-1 4.2-3.2 5.5-5.5C12 8.8 13.5 7 16 6.5" />
      <circle cx="17.5" cy="6.2" r="1.6" opacity={0.55} />
      <path d="M5 19h14" opacity={0.35} />
    </BaseIcon>
  );
}

/** Nested depth — five whys */
function IconFiveWhys(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 7h12" />
      <path d="M7.5 11h9" opacity={0.75} />
      <path d="M9 15h6" opacity={0.5} />
      <path d="M10.5 19h3" opacity={0.35} />
    </BaseIcon>
  );
}

/** Soft fork — decision */
function IconDecision(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 19V11" />
      <path d="M12 11 7.5 6.5" />
      <path d="M12 11 16.5 6.5" opacity={0.7} />
    </BaseIcon>
  );
}

/** Quiet notebook — practice log */
function IconLog(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 5.5h10a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 17V7A1.5 1.5 0 0 1 7 5.5Z" />
      <path d="M9 9.5h6" opacity={0.7} />
      <path d="M9 12.5h6" opacity={0.5} />
      <path d="M9 15.5h4" opacity={0.35} />
    </BaseIcon>
  );
}

/** Group: day & feelings */
export function IconGroupDay(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 14.5c2.2-2.8 4.6-4.2 7.5-4.2s5.3 1.4 7.5 4.2" />
      <circle cx="12" cy="8.2" r="2.2" opacity={0.55} />
    </BaseIcon>
  );
}

/** Group: thoughts & clarity */
export function IconGroupThoughts(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 8.5h8" />
      <path d="M7 12h10" opacity={0.7} />
      <path d="M7 15.5h6" opacity={0.45} />
      <circle cx="17.2" cy="8.5" r="1.1" opacity={0.5} />
    </BaseIcon>
  );
}

/** Group: body & life picture */
export function IconGroupBody(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7" opacity={0.45} />
      <path d="M12 5.5v13M5.5 12h13" opacity={0.4} />
      <circle cx="12" cy="12" r="2.2" opacity={0.7} />
    </BaseIcon>
  );
}

/** Soft bars — stats */
function IconStats(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 17V11" />
      <path d="M12 17V7" opacity={0.7} />
      <path d="M18 17v-4" opacity={0.45} />
    </BaseIcon>
  );
}

/** Stacked soft leaves / layers — practices hub */
function IconPractices(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 15.5c2.8-3.8 5.2-5.2 8.5-5.8" />
      <path d="M6.5 11c3-3.2 5.8-4.4 9.5-4.8" opacity={0.55} />
      <path d="M8 19c2.2-2.2 4.2-3 7-3.4" opacity={0.35} />
    </BaseIcon>
  );
}

/** Quiet star — favorites (outline / filled) */
export function IconStar({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 4.8 13.7 9.2l4.7.4-3.6 3.1 1.1 4.5L12 14.9 7.1 17.2l1.1-4.5-3.6-3.1 4.7-.4Z"
        fill={filled ? "currentColor" : "none"}
        opacity={filled ? 0.9 : 1}
      />
    </BaseIcon>
  );
}

/** Soft brand mark — point of clarity */
export function IconBrand(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20.30 12.00 L20.36 12.38 L20.28 12.75 L20.16 13.11 L20.07 13.46 L19.94 13.81 L19.77 14.14 L19.64 14.48 L19.63 14.86 L19.67 15.28 L19.60 15.66 L19.33 15.95 L18.99 16.18 L18.72 16.44 L18.54 16.75 L18.36 17.07 L18.15 17.37 L17.95 17.68 L17.76 18.02 L17.52 18.32 L17.17 18.49 L16.76 18.55 L16.39 18.65 L16.12 18.90 L15.89 19.23 L15.61 19.49 L15.27 19.65 L14.91 19.76 L14.56 19.87 L14.19 19.92 L13.80 19.88 L13.43 19.86 L13.08 19.99 L12.74 20.23 L12.38 20.40 L12.00 20.38 L11.63 20.23 L11.27 20.09 L10.91 20.03 L10.55 19.97 L10.20 19.89 L9.83 19.85 L9.44 19.88 L9.04 19.87 L8.71 19.71 L8.45 19.38 L8.20 19.06 L7.89 18.88 L7.52 18.78 L7.16 18.66 L6.84 18.47 L6.54 18.25 L6.25 18.02 L6.00 17.73 L5.86 17.37 L5.75 16.99 L5.54 16.70 L5.19 16.49 L4.84 16.28 L4.62 15.97 L4.52 15.60 L4.46 15.22 L4.36 14.87 L4.28 14.51 L4.23 14.14 L4.14 13.79 L3.93 13.46 L3.70 13.12 L3.61 12.76 L3.72 12.37 L3.90 12.00 L3.98 11.64 L3.95 11.28 L3.91 10.90 L3.93 10.54 L3.95 10.16 L3.96 9.78 L4.04 9.41 L4.28 9.10 L4.59 8.83 L4.82 8.54 L4.89 8.18 L4.91 7.77 L5.03 7.40 L5.27 7.11 L5.54 6.85 L5.80 6.58 L6.09 6.35 L6.43 6.17 L6.73 5.97 L6.95 5.66 L7.12 5.28 L7.36 4.97 L7.71 4.82 L8.12 4.79 L8.49 4.71 L8.82 4.57 L9.15 4.40 L9.49 4.27 L9.82 4.11 L10.15 3.89 L10.50 3.73 L10.88 3.73 L11.27 3.89 L11.64 4.02 L12.00 3.98 L12.37 3.84 L12.74 3.76 L13.11 3.78 L13.48 3.84 L13.85 3.91 L14.20 4.04 L14.51 4.28 L14.81 4.52 L15.15 4.63 L15.56 4.60 L15.97 4.62 L16.30 4.80 L16.56 5.10 L16.80 5.39 L17.07 5.65 L17.33 5.90 L17.58 6.16 L17.86 6.40 L18.21 6.58 L18.57 6.76 L18.80 7.06 L18.88 7.46 L18.92 7.87 L19.06 8.20 L19.30 8.48 L19.54 8.78 L19.71 9.10 L19.88 9.44 L20.04 9.78 L20.13 10.14 L20.07 10.54 L19.95 10.92 L19.94 11.29 L20.10 11.64 Z" opacity={0.38} />
      <path d="M20.30 12.00 L20.62 12.00 M18.32 17.13 L18.63 17.39 M14.99 19.73 L15.08 19.96 M9.43 19.88 L9.37 20.06 M3.68 12.46 L3.29 12.48 M9.88 4.07 L9.83 3.88 M14.11 4.00 L14.20 3.67 M18.81 7.08 L19.12 6.86" opacity={0.26} />
      <circle cx="12" cy="12" r="4.15" />
      <circle cx="12" cy="12" r="1.55" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

const PRACTICE_ICONS = {
  mood: IconMood,
  gratitude: IconGratitude,
  emotions: IconEmotions,
  questions: IconQuestions,
  abc: IconAbc,
  wheel: IconWheel,
  breath: IconBreath,
  "ideal-day": IconIdealDay,
  "five-whys": IconFiveWhys,
  decision: IconDecision,
  log: IconLog,
  stats: IconStats,
  practices: IconPractices,
} as const;

export type PracticeIconKey = keyof typeof PRACTICE_ICONS;

export function PracticeGlyph({
  name,
  className = "h-5 w-5",
}: {
  name: PracticeIconKey;
  className?: string;
}) {
  const Icon = PRACTICE_ICONS[name];
  return <Icon className={className} />;
}

/** Soft mark used in lists — one quiet tone, no rainbow */
export function PracticeIconMark({
  name,
  className = "",
}: {
  name: PracticeIconKey;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--icon-mark)] text-[var(--accent-ink)] ${className}`}
    >
      <PracticeGlyph name={name} className="h-5 w-5" />
    </span>
  );
}
