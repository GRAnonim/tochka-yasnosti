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
      <path
        d="M20.47 12.00 L20.64 12.45 L20.73 12.92 L20.70 13.38 L20.56 13.82 L20.31 14.23 L20.00 14.60 L19.66 14.94 L19.34 15.27 L19.06 15.60 L18.85 15.95 L18.69 16.34 L18.56 16.77 L18.44 17.22 L18.29 17.66 L18.08 18.08 L17.79 18.43 L17.42 18.70 L17.00 18.88 L16.53 18.98 L16.06 19.04 L15.61 19.08 L15.18 19.15 L14.79 19.27 L14.43 19.47 L14.07 19.72 L13.70 20.01 L13.31 20.29 L12.90 20.52 L12.45 20.66 L12.00 20.70 L11.55 20.62 L11.11 20.44 L10.70 20.21 L10.31 19.96 L9.93 19.73 L9.54 19.56 L9.14 19.45 L8.71 19.40 L8.24 19.37 L7.76 19.34 L7.29 19.26 L6.84 19.10 L6.46 18.85 L6.15 18.50 L5.91 18.09 L5.75 17.63 L5.62 17.17 L5.50 16.72 L5.35 16.32 L5.15 15.95 L4.90 15.62 L4.59 15.30 L4.26 14.97 L3.95 14.62 L3.70 14.23 L3.54 13.80 L3.49 13.35 L3.54 12.89 L3.69 12.44 L3.87 12.00 L4.06 11.58 L4.22 11.18 L4.30 10.78 L4.32 10.37 L4.28 9.93 L4.21 9.47 L4.17 8.99 L4.17 8.52 L4.27 8.06 L4.47 7.65 L4.76 7.30 L5.13 7.01 L5.54 6.77 L5.96 6.56 L6.34 6.34 L6.68 6.09 L6.98 5.80 L7.24 5.45 L7.49 5.06 L7.76 4.66 L8.07 4.29 L8.43 3.98 L8.84 3.78 L9.30 3.68 L9.77 3.69 L10.25 3.77 L10.72 3.89 L11.16 4.01 L11.59 4.09 L12.00 4.10 L12.42 4.04 L12.85 3.93 L13.30 3.81 L13.76 3.72 L14.23 3.70 L14.67 3.77 L15.09 3.95 L15.46 4.23 L15.78 4.58 L16.06 4.96 L16.33 5.34 L16.60 5.67 L16.90 5.94 L17.25 6.17 L17.65 6.35 L18.08 6.52 L18.52 6.72 L18.93 6.96 L19.28 7.28 L19.53 7.65 L19.69 8.08 L19.75 8.55 L19.76 9.02 L19.74 9.49 L19.73 9.93 L19.77 10.35 L19.88 10.75 L20.05 11.15 L20.26 11.57 Z"
        opacity={0.38}
      />
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
