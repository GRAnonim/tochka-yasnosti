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
export function IconMood(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 14c2.5-3 5-4.5 8-4.5S17.5 11 20 14" />
      <path d="M5 18h14" opacity={0.45} />
    </BaseIcon>
  );
}

/** Open bowl / receiving — gratitude */
export function IconGratitude(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 11c0 4 2.5 6.5 5.5 6.5s5.5-2.5 5.5-6.5" />
      <path d="M8 9.5c1.2-1.8 2.6-2.7 4-2.7s2.8.9 4 2.7" opacity={0.55} />
    </BaseIcon>
  );
}

/** Nested soft rings — emotions */
export function IconEmotions(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="4.2" opacity={0.55} />
      <circle cx="12" cy="12" r="1.4" opacity={0.35} />
    </BaseIcon>
  );
}

/** Three quiet marks — questions */
export function IconQuestions(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 8h7" />
      <path d="M7 12h10" opacity={0.7} />
      <path d="M7 16h5" opacity={0.45} />
    </BaseIcon>
  );
}

/** Three descending steps — ABC */
export function IconAbc(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 8h5v3H5z" />
      <path d="M10 11h5v3h-5z" opacity={0.7} />
      <path d="M15 14h5v3h-5z" opacity={0.45} />
    </BaseIcon>
  );
}

/** Soft radar octagon — wheel of life */
export function IconWheel(props: IconProps) {
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
export function IconBreath(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="6.2" opacity={0.5} />
      <path d="M12 3.8v1.6M12 18.6v1.6M3.8 12h1.6M18.6 12h1.6" opacity={0.35} />
    </BaseIcon>
  );
}

/** Soft path toward light — ideal day */
export function IconIdealDay(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 17c2.5-1 4.2-3.2 5.5-5.5C12 8.8 13.5 7 16 6.5" />
      <circle cx="17.5" cy="6.2" r="1.6" opacity={0.55} />
      <path d="M5 19h14" opacity={0.35} />
    </BaseIcon>
  );
}

/** Nested depth — five whys */
export function IconFiveWhys(props: IconProps) {
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
export function IconDecision(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 19V11" />
      <path d="M12 11 7.5 6.5" />
      <path d="M12 11 16.5 6.5" opacity={0.7} />
    </BaseIcon>
  );
}

/** Quiet ledger lines — practice log */
export function IconLog(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 6.5h10" />
      <path d="M7 12h10" opacity={0.65} />
      <path d="M7 17.5h7" opacity={0.4} />
    </BaseIcon>
  );
}

/** Soft bars — stats */
export function IconStats(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 17V11" />
      <path d="M12 17V7" opacity={0.7} />
      <path d="M18 17v-4" opacity={0.45} />
    </BaseIcon>
  );
}

/** Stacked soft leaves / layers — practices hub */
export function IconPractices(props: IconProps) {
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

export const PRACTICE_ICONS = {
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
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--secondary)_88%,white)] text-[var(--accent-ink)] ${className}`}
    >
      <PracticeGlyph name={name} className="h-[22px] w-[22px]" />
    </span>
  );
}
