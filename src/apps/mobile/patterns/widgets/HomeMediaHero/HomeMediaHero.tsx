/**
 * HomeMediaHero — main continue card (compact hero) or tonal artifact hero.
 * Compact: orb + arrow on top · title + one line at the bottom, on the vibrant aurora field (white copy).
 */
import type { ReactNode } from 'react';
import { DeborahBlob } from '@mobile/ui/DeborahBlob';
import { Icon, type IconName } from '@mobile/ui';
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
    return (
      <section className={styles.root} data-tone={tone} data-compact aria-labelledby={titleId}>
        {/* Same hierarchy as the health-detail cards (2026-10-21): orb + arrow on top, title + one line at the bottom. */}
        <div className={styles.bodyCompact}>
          <div className={styles.top}>
            <DeborahBlob size={40} label="Deborah" className={styles.orb} />
            {onCta && (
              <button type="button" className={styles.arrow} onClick={onCta} aria-label={ctaLabel ?? 'Continue'}>
                <Icon name="chevron" size={18} />
              </button>
            )}
          </div>
          <div className={styles.copy}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 id={titleId} className={styles.titleCompact}>{title}</h2>
            {stats && stats.length > 0 ? (
              <ul className={styles.stats}>
                {stats.map((st) => (
                  <li key={st.label}><Icon name={st.icon} size={14} />{st.label}</li>
                ))}
              </ul>
            ) : (meta || when) && <p className={styles.when}>{meta ?? when}</p>}
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
