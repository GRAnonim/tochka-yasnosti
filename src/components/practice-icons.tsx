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
      <path d="M20.52 12.00 L20.77 12.39 L20.87 12.80 L20.78 13.19 L20.51 13.54 L20.12 13.85 L19.70 14.13 L19.36 14.39 L19.14 14.68 L19.06 15.02 L19.08 15.41 L19.14 15.84 L19.14 16.27 L19.05 16.65 L18.82 16.95 L18.49 17.17 L18.11 17.34 L17.74 17.49 L17.44 17.69 L17.22 17.97 L17.07 18.35 L16.93 18.79 L16.77 19.23 L16.53 19.58 L16.19 19.79 L15.77 19.83 L15.30 19.72 L14.83 19.53 L14.39 19.36 L14.01 19.29 L13.68 19.36 L13.38 19.58 L13.07 19.89 L12.74 20.21 L12.38 20.45 L12.00 20.54 L11.62 20.48 L11.25 20.30 L10.91 20.07 L10.57 19.87 L10.23 19.76 L9.86 19.76 L9.45 19.85 L9.01 19.95 L8.58 19.99 L8.20 19.90 L7.89 19.64 L7.67 19.25 L7.53 18.77 L7.42 18.30 L7.29 17.91 L7.07 17.64 L6.75 17.49 L6.33 17.42 L5.86 17.37 L5.40 17.26 L5.02 17.07 L4.78 16.77 L4.66 16.38 L4.65 15.96 L4.66 15.53 L4.64 15.15 L4.51 14.81 L4.29 14.51 L4.00 14.21 L3.71 13.89 L3.50 13.54 L3.45 13.16 L3.56 12.76 L3.81 12.37 L4.12 12.00 L4.39 11.66 L4.54 11.33 L4.53 10.99 L4.37 10.62 L4.13 10.20 L3.89 9.76 L3.76 9.32 L3.78 8.92 L3.98 8.57 L4.31 8.29 L4.70 8.07 L5.07 7.86 L5.36 7.62 L5.55 7.31 L5.67 6.95 L5.76 6.55 L5.89 6.15 L6.10 5.83 L6.43 5.62 L6.84 5.53 L7.30 5.52 L7.74 5.54 L8.12 5.50 L8.42 5.35 L8.65 5.05 L8.85 4.64 L9.06 4.18 L9.32 3.76 L9.65 3.48 L10.03 3.37 L10.45 3.44 L10.87 3.64 L11.27 3.87 L11.64 4.06 L12.00 4.14 L12.35 4.10 L12.72 3.97 L13.11 3.82 L13.50 3.73 L13.88 3.77 L14.22 3.95 L14.52 4.25 L14.78 4.60 L15.03 4.91 L15.31 5.12 L15.66 5.20 L16.08 5.17 L16.56 5.09 L17.06 5.04 L17.51 5.09 L17.86 5.29 L18.09 5.63 L18.19 6.08 L18.21 6.58 L18.22 7.04 L18.29 7.43 L18.46 7.73 L18.74 7.97 L19.09 8.18 L19.44 8.42 L19.72 8.70 L19.87 9.05 L19.89 9.44 L19.80 9.85 L19.70 10.24 L19.64 10.61 L19.70 10.96 L19.90 11.29 L20.19 11.63 Z" opacity={0.42} />
      <path d="M20.20 12.00 L21.16 12.00 M18.90 16.43 L20.06 17.17 M16.54 18.83 L16.92 19.41 M11.70 20.19 L11.68 20.91 M7.80 19.04 L7.09 20.23 M5.13 16.48 L4.36 16.99 M3.81 11.51 L3.26 11.48 M4.80 8.07 L3.70 7.47 M7.71 5.01 L7.09 4.01 M12.49 3.81 L12.53 3.29 M15.72 4.69 L16.18 3.78 M19.14 7.97 L20.32 7.31" opacity={0.38} />
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
