/**
 * @ui ActionTile — one quiet frosted row: icon well (or progress ring around the icon) · title + meta · chevron.
 * Used for standing paths in the thread (Talk with Deborah, Health intake).
 */
import { Icon, type IconName } from '../Icon';
import { ProgressRing } from '../ProgressRing';
import { cx } from '@shared/utils';
import styles from './ActionTile.module.css';

export interface ActionTileProps {
  icon: IconName;
  title: string;
  meta?: string;
  /** 0–1: draws a progress ring around the icon instead of the tinted well. */
  progress?: number;
  progressLabel?: string;
  onClick: () => void;
  className?: string;
}

export function ActionTile({ icon, title, meta, progress, progressLabel, onClick, className }: ActionTileProps) {
  return (
    <button type="button" className={cx(styles.tile, className)} onClick={onClick}>
      {progress === undefined ? (
        <span className={styles.well} aria-hidden><Icon name={icon} size={18} /></span>
      ) : (
        <ProgressRing value={progress} size={40} label={progressLabel ?? title} className={styles.ring}>
          <Icon name={icon} size={18} />
        </ProgressRing>
      )}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
      <Icon name="chevron" size={18} className={styles.chevron} />
    </button>
  );
}
