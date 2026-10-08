/**
 * Home destinations: the chat composer as hero (glowing rim), then tonal cards: a wide lilac My Health card,
 * linen Records + rose Family tiles (big serif title top, plain meta + one dark round action bottom),
 * and a slim Paper "My info" row. Flat colour fields — no shadows, rims or pills.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@mobile/ui';
import { ChatLauncher } from '@mobile/patterns/chat';
import styles from './DestinationCards.module.css';

const BG = '/images/home/my-health-bg.png';

export interface PhotoCard {
  title: string;
  /** Wide card: quiet subtitle. Square cards: text in the white pill. */
  meta: string;
  onSelect: () => void;
  /** Crop of the shared photo (CSS background-position) and hue shift, so cards differ. */
  crop: string;
  hue?: number;
}

export interface DestinationCardsProps {
  askHint: string;
  onAsk: () => void;
  health: PhotoCard;
  records: PhotoCard;
  family: PhotoCard;
  onInfo: () => void;
  /** Slot between the hero and the section cards (Home "For you today"). */
  today?: ReactNode;
}

function bg(c: PhotoCard) {
  return { '--card-bg': `url('${BG}')`, '--crop': c.crop, '--hue': `${c.hue ?? 0}deg` } as CSSProperties;
}

export function DestinationCards({ askHint, onAsk, health, records, family, onInfo, today }: DestinationCardsProps) {
  return (
    <>
      <ChatLauncher glow placeholder={askHint} onOpen={onAsk} />

      {today}

      <button type="button" className={`${styles.photo} ${styles.wide} ${styles.lilac}`} style={bg(health)} onClick={health.onSelect}>
        <span className={styles.title}>{health.title}</span>
        <span className={styles.foot}>
          <span className={styles.sub}>{health.meta}</span>
          <span className={styles.go} aria-hidden>
            <Icon name="chevron" size={18} />
          </span>
        </span>
      </button>

      <div className={styles.pair}>
        {[
          { c: records, tone: styles.linen },
          { c: family, tone: styles.rose },
        ].map(({ c, tone }) => (
          <button key={c.title} type="button" className={`${styles.photo} ${styles.square} ${tone}`} style={bg(c)} onClick={c.onSelect}>
            <span className={styles.title}>{c.title}</span>
            <span className={styles.foot}>
              <span className={styles.sub}>{c.meta}</span>
              <span className={styles.go} aria-hidden>
                <Icon name="chevron" size={18} />
              </span>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className={styles.row} onClick={onInfo}>
        <Icon name="account" size={20} />
        <span className={styles.rowLabel}>My info</span>
        <span className={styles.rowHint}>Account & settings</span>
        <Icon name="chevron" size={18} className={styles.chev} />
      </button>
    </>
  );
}
