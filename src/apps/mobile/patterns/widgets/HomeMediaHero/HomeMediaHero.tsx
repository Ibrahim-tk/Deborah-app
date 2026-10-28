/**
 * HomeMediaHero — main continue card (compact hero) or tonal artifact hero.
 * Compact: a deep plum pill — tree avatar, eyebrow + title, big chevron on the right; the whole pill taps.
 */
import type { ReactNode } from 'react';
import { DeborahBlob } from '@mobile/ui/DeborahBlob';
import { Icon } from '@mobile/ui';
import { type HomeArtifactId, type HomeTone } from '../homeArtifacts';
import styles from './HomeMediaHero.module.css';

export interface HomeMediaHeroProps {
  titleId: string;
  title: string;
  tone?: HomeTone;
  artifact?: HomeArtifactId;
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
}

export function HomeMediaHero({
  titleId,
  title,
  tone = 'hero',
  artifact: _artifact,
  meta,
  pending,
  ctaLabel,
  onCta,
  children,
  eyebrow,
}: HomeMediaHeroProps) {
  const compactHero = tone === 'hero';

  if (compactHero) {
    // Player-pill layout (ref 2026-10-28): tree avatar · eyebrow + title · big chevron. The whole pill is the tap target.
    const inner = (
      <>
        <span className={styles.avatar} aria-hidden>
          <DeborahBlob size={44} />
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
