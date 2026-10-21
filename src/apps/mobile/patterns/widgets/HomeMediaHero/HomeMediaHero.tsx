/**
 * HomeMediaHero — main continue card (compact hero) or tonal artifact hero.
 * Compact: left stack (orb + title) · right column (when + chevron).
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
}: HomeMediaHeroProps) {
  const compactHero = tone === 'hero';

  if (compactHero) {
    return (
      <section className={styles.root} data-tone={tone} data-compact aria-labelledby={titleId}>
        <div className={styles.bodyCompact}>
          <div className={styles.main}>
            <DeborahBlob size={52} label="Deborah" className={styles.orb} />
            <h2 id={titleId} className={styles.titleCompact}>{title}</h2>
          </div>
          <div className={styles.aside}>
            {when && <p className={styles.when}>{when}</p>}
            {onCta && (
              <button type="button" className={styles.arrow} onClick={onCta} aria-label={ctaLabel ?? 'Continue'}>
                <Icon name="chevron" size={18} />
              </button>
            )}
          </div>
          {children}
        </div>
      </section>
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
