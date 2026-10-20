/**
 * Line doodles for the "who is this for" cards (design direction 2026-10-20, Notion-onboarding style):
 * ink outlines, solid hair, a hint of shading. Colours come from ProfileDoodles.module.css tokens.
 * Decorative: the card's title carries the meaning.
 */
import styles from './ProfileDoodles.module.css';

export interface DoodleProps {
  size?: number;
}

/** One woman, head and shoulders, hand on heart, a small sparkle. */
export function SelfDoodle({ size = 72 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden className={styles.root}>
      {/* Hair: solid bob */}
      <path className={styles.hair} d="M22 34c-2-12 5-21 15-21s16 8 14 20c-1 6-3 10-4 12l-3-12c-6-1-12-4-15-9-2 4-4 7-5 10l-2 12c-1-3-0-8 0-12Z" />
      {/* Face */}
      <path className={styles.line} d="M27 30c0 9 4 15 10 15s10-6 10-14" />
      <path className={styles.line} d="M33 33.5h.1M41 33.5h.1" />
      <path className={styles.line} d="M34.5 39c1.5 1.2 3.5 1.2 5 0" />
      {/* Neck and shoulders */}
      <path className={styles.line} d="M33 45v4M41 45v4" />
      <path className={styles.line} d="M16 68c1-11 9-17 21-17s20 6 21 17" />
      {/* Hand on heart */}
      <path className={styles.fill} d="M36 59c-2-3-7-2-6 2 1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2Z" />
      {/* Sparkles */}
      <path className={styles.line} d="M58 14v6M55 17h6" />
      <path className={styles.line} d="M13 22v4M11 24h4" />
    </svg>
  );
}

/** An adult with a child beside her, a small heart between them. */
export function FamilyDoodle({ size = 72 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden className={styles.root}>
      {/* Adult: hair bun */}
      <circle className={styles.hair} cx="28" cy="10" r="4" />
      <path className={styles.hair} d="M17 27c-1-9 4-15 11-15s12 6 11 15c-3-4-7-6-11-6s-8 2-11 6Z" />
      <path className={styles.line} d="M18 26c0 7 4 12 10 12s10-5 10-12" />
      <path className={styles.line} d="M24 28.5h.1M32 28.5h.1M26 33c1.2 1 2.8 1 4 0" />
      <path className={styles.line} d="M8 68c1-12 8-20 20-20 6 0 10 2 13 5" />
      {/* Child: short hair, smaller, in front right */}
      <path className={styles.hair} d="M41 42c0-6 4-10 9-10s9 4 9 10c-2-3-5-4-9-4s-7 1-9 4Z" />
      <path className={styles.line} d="M42 41c0 5 3.5 9 8 9s8-4 8-9" />
      <path className={styles.line} d="M47 43h.1M53 43h.1M48.5 46.5c1 .7 2 .7 3 0" />
      <path className={styles.line} d="M38 68c0-8 5-13 12-13s12 5 12 13" />
      {/* Heart between them */}
      <path className={styles.fill} d="M60 20c-1.5-2.5-5.5-1.5-4.5 1.5.8 2.2 4.5 4 4.5 4s3.7-1.8 4.5-4c1-3-3-4-4.5-1.5Z" />
    </svg>
  );
}
