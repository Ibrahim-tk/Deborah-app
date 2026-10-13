/**
 * Custom icons for the "who is this for" step (Hugeicons has no filled pair for these): outline at rest, filled when selected.
 * 32 × 32 grid, 1.6 stroke, round caps — matches the Hugeicons stroke-rounded weight at this size.
 */
export interface ProfileIconProps {
  filled?: boolean;
  size?: number;
}

const common = (size: number) => ({ width: size, height: size, viewBox: '0 0 32 32', 'aria-hidden': true as const });

/** One person: head and shoulders. */
export function SelfIcon({ filled, size = 32 }: ProfileIconProps) {
  const paint = filled ? { fill: 'currentColor', stroke: 'currentColor' } : { fill: 'none', stroke: 'currentColor' };
  return (
    <svg {...common(size)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="11" r="5.5" {...paint} />
      <path d="M6.5 27c0-5.2 4.3-9 9.5-9s9.5 3.8 9.5 9" {...paint} />
    </svg>
  );
}

/** Adult with a child in front: caring for someone else. */
export function FamilyIcon({ filled, size = 32 }: ProfileIconProps) {
  const paint = filled ? { fill: 'currentColor', stroke: 'currentColor' } : { fill: 'none', stroke: 'currentColor' };
  // The child is drawn over the adult; a background-coloured stroke separates them when filled.
  const cut = filled ? { stroke: 'var(--icon-cut, #fff)', strokeWidth: 2.4 } : {};
  return (
    <svg {...common(size)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9.5" r="4.5" {...paint} />
      <path d="M3.5 25c0-4.6 3.8-8 8.5-8 2.3 0 4.3.8 5.8 2.1" {...paint} />
      <circle cx="22" cy="15.5" r="3.5" {...paint} {...cut} />
      <path d="M15.5 27.5c0-3.6 2.9-6.3 6.5-6.3s6.5 2.7 6.5 6.3" {...paint} {...cut} />
    </svg>
  );
}
