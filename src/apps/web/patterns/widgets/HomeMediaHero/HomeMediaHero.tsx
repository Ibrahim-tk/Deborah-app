/**
 * HomeMediaHero — main continue card (compact hero) or tonal artifact hero.
 * Compact: a deep plum pill (same as mobile) — tree avatar, eyebrow + title, chevron disc; the whole pill clicks.
 */
import type { ReactNode } from 'react';
import { DeborahBlob } from '@web/ui/DeborahBlob';
import { Icon, type IconName } from '@web/ui';
import { type HomeArtifactId, type HomeTone } from '../homeArtifacts';
import styles from './HomeMediaHero.module.css';

export interface HomeMediaHeroProps {
  titleId: string;
  title: string;
  tone?: HomeTone;
  artifact?: HomeArtifactId;
  /** Shown top-right on compact hero (e.g. "4 days ago"). */
  when?: string;
  meta?: string;
  pending?: string;
  ctaLabel?: string;
  onCta?: () => void;
  children?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  kicker?: string;
  kickerIcon?: string;
  /** Small uppercase line above the title (compact hero). */
  eyebrow?: string;
  /** Supporting facts under the title, icon + short label (compact hero). */
  stats?: { icon: IconName; label: string }[];
}

export function HomeMediaHero({
  titleId,
  title,
  tone = 'hero',
  artifact: _artifact,
  when,
  meta,
  pending,
  ctaLabel,
  onCta,
  children,
  eyebrow,
  stats,
}: HomeMediaHeroProps) {
  const compactHero = tone === 'hero';

  if (compactHero) {
    // Player pill, ported from mobile (designer, 2026-10-29): tree avatar · eyebrow + title · chevron disc.
    // The whole pill is the click target. `when` / `stats` stay in the API but no longer render here.
    void when; void stats;
    const inner = (
      <>
        <span className={styles.avatar} aria-hidden>
          <DeborahBlob size={56} />
        </span>
        <span className={styles.copy}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <span id={titleId} className={styles.titleCompact}>{title}</span>
        </span>
        {onCta && (
          <span className={styles.chevron} aria-hidden>
            <Icon name="chevron" size={18} />
          </span>
        )}
      </>
    );
    return onCta ? (
      <button type="button" className={styles.root} data-tone={tone} data-compact onClick={onCta} aria-label={`${ctaLabel ?? 'Continue'}: ${title}`}>
        {inner}
      </button>
    ) : (
      <section className={styles.root} data-tone={tone} data-compact aria-labelledby={titleId}>{inner}{children}</section>
    );
  }

  return (
    <section className={styles.root} data-tone={tone} aria-labelledby={titleId}>
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>{title}</h2>
        {meta && <p className={styles.meta}>{meta}</p>}
        {pending && (
          <p className={styles.pending}>
            Next: “{pending}”
          </p>
        )}
        {(onCta && ctaLabel) || children ? (
          <div className={styles.actions}>
            {onCta && ctaLabel && (
              <button type="button" className={styles.cta} onClick={onCta}>{ctaLabel}</button>
            )}
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
