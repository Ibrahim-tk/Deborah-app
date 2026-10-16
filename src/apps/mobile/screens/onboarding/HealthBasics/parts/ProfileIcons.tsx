/**
 * Custom icons for the "who is this for" step (Hugeicons has no filled pair for these): outline at rest, filled when selected.
 * 32 × 32 grid, ~1.7 stroke, round caps — circular badge style matching the people/group reference.
 */
export interface ProfileIconProps {
  filled?: boolean;
  size?: number;
}

const common = (size: number) => ({ width: size, height: size, viewBox: '0 0 32 32', 'aria-hidden': true as const });

/** One person: head and shoulders — clear “self” meaning. */
export function SelfIcon({ filled, size = 32 }: ProfileIconProps) {
  const paint = filled ? { fill: 'currentColor', stroke: 'currentColor' } : { fill: 'none', stroke: 'currentColor' };
  return (
    <svg {...common(size)} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="10.5" r="5" {...paint} />
      <path d="M7 26.5c0-4.8 4-8.2 9-8.2s9 3.4 9 8.2" {...paint} />
    </svg>
  );
}

/** Three overlapping people — group / family style (not adult+tiny child). */
export function FamilyIcon({ filled, size = 32 }: ProfileIconProps) {
  const paint = filled ? { fill: 'currentColor', stroke: 'currentColor' } : { fill: 'none', stroke: 'currentColor' };
  // Front figure drawn over the backs; background-coloured stroke separates them when filled.
  const cut = filled ? { stroke: 'var(--icon-cut, #fff)', strokeWidth: 2.5 } : {};
  return (
    <svg {...common(size)} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {/* Back left */}
      <circle cx="8.5" cy="11.5" r="3.3" {...paint} />
      <path d="M2.8 26c0-3.4 2.6-5.8 5.7-5.8 1.3 0 2.5.5 3.4 1.2" {...paint} />
      {/* Back right */}
      <circle cx="23.5" cy="11.5" r="3.3" {...paint} />
      <path d="M20.1 21.4c.9-.7 2.1-1.2 3.4-1.2 3.1 0 5.7 2.4 5.7 5.8" {...paint} />
      {/* Front center */}
      <circle cx="16" cy="10" r="4" {...paint} {...cut} />
      <path d="M8.8 26.5c0-3.9 3.2-6.8 7.2-6.8s7.2 2.9 7.2 6.8" {...paint} {...cut} />
    </svg>
  );
}
