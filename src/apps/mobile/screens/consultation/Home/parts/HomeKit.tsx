/**
 * Home state cards (Figma 191:3398 — States 1–3): tonal link cards with a serif title, plain meta
 * and one white round action; a thin progress bar; the My Health · Family pair; a section label;
 * and the personalised recommendation card. Flat colour fields: no shadows, rims or pills.
 */
import type { CSSProperties, ReactNode } from 'react';
import type { Product } from '@shared/types/content';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '@mobile/ui';
import styles from './HomeKit.module.css';

export type Tone = 'lilac' | 'linen' | 'rose';

/** Leading icon in a soft tinted circle: names the card at a glance (visual hierarchy). */
export function Badge({ icon }: { icon: IconName }) {
  return (
    <span className={styles.badge} aria-hidden>
      <Icon name={icon} size={20} />
    </span>
  );
}

/** Thin progress line (0–1). */
export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx(styles.bar, className)} aria-hidden>
      <span className={styles.fill} style={{ '--p': Math.max(0.02, Math.min(1, value)) } as CSSProperties} />
    </span>
  );
}

export function Action({ icon = 'chevron' }: { icon?: IconName }) {
  return (
    <span className={styles.action} aria-hidden>
      <Icon name={icon} size={18} />
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className={styles.label}>{children}</h2>;
}

export interface LinkCardProps {
  tone: Tone;
  title: string;
  meta: string;
  /** Extra line under the meta (e.g. a progress bar). */
  extra?: ReactNode;
  icon?: IconName;
  /** Leading icon badge. */
  lead?: IconName;
  /** Omit for a non-interactive card (locked preview). */
  onPress?: () => void;
  label?: string;
}

export function LinkCard({ tone, title, meta, extra, icon, lead, onPress, label }: LinkCardProps) {
  const body = (
    <>
      {lead && <Badge icon={lead} />}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
        {extra}
      </span>
      <Action icon={icon} />
    </>
  );
  const cls = cx(styles.card, styles[tone]);
  return onPress ? (
    <button type="button" className={cls} onClick={onPress} aria-label={label}>{body}</button>
  ) : (
    <section className={cls} aria-label={label ?? title}>{body}</section>
  );
}

export interface TileProps {
  tone: Tone;
  title: string;
  meta: string;
  /** 0–1: thin bar above the meta (My Health completion). */
  progress?: number;
  lead?: IconName;
  onPress: () => void;
}

/** My Health · Family: two square tiles, title top, meta + action bottom. */
export function TilePair({ tiles, compact }: { tiles: [TileProps, TileProps]; compact?: boolean }) {
  return (
    <div className={styles.pair}>
      {tiles.map((t) => (
        <button key={t.title} type="button" className={cx(styles.tile, styles[t.tone], compact && styles.compact)} onClick={t.onPress}>
          <span className={styles.tileHead}>
            {t.lead && <Badge icon={t.lead} />}
            <span className={styles.title}>{t.title}</span>
          </span>
          <span className={styles.foot}>
            <span className={styles.tileMeta}>
              {t.progress !== undefined && <Bar value={t.progress} className={styles.tileBar} />}
              <span className={styles.meta}>{t.meta}</span>
            </span>
            <Action />
          </span>
        </button>
      ))}
    </div>
  );
}

export interface Recommendation {
  product: Product;
  reason: string;
}

/** Personalised only: each card says why it is recommended. One card spans; more scroll sideways. */
export function Recommendations({ items, onShop }: { items: Recommendation[]; onShop: (productId: string) => void }) {
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-labelledby="home-recs">
      <h2 id="home-recs" className={styles.label}>Recommended for you</h2>
      <ul className={cx(styles.rail, items.length === 1 && styles.single)}>
        {items.map(({ product, reason }) => (
          <li key={product.id}>
            <button type="button" className={cx(styles.rec, styles.linen)} onClick={() => onShop(product.id)} data-placeholder={product.status === 'placeholder' || undefined}>
              <span className={styles.title}>{product.name}</span>
              <span className={styles.meta}>{product.tagline}</span>
              <span className={styles.because}>{reason}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
