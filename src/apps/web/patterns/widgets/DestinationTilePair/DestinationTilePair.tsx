/**
 * DestinationTilePair — My Health · Family square tiles (Home destinations).
 */
import { cx } from '@shared/utils';
import { Icon, IconWell, type IconName } from '@web/ui';
import { ProgressHairline } from '../ProgressHairline';
import field from '../homeField.module.css';
import styles from './DestinationTilePair.module.css';
import type { LinkTone } from '../LinkStatusCard';

export interface DestinationTileProps {
  tone: LinkTone;
  title: string;
  meta: string;
  progress?: number;
  lead?: IconName;
  onPress: () => void;
}

export function DestinationTilePair({ tiles, compact }: { tiles: [DestinationTileProps, DestinationTileProps]; compact?: boolean }) {
  return (
    <div className={styles.pair}>
      {tiles.map((t) => (
        <button
          key={t.title}
          type="button"
          className={cx(styles.tile, styles[t.tone], compact && styles.compact)}
          onClick={t.onPress}
        >
          <span className={styles.head}>
            {t.lead && <IconWell icon={t.lead} />}
            <span className={field.title}>{t.title}</span>
          </span>
          <span className={styles.foot}>
            <span className={styles.tileMeta}>
              {t.progress !== undefined && <ProgressHairline value={t.progress} className={styles.tileBar} />}
              <span className={field.meta}>{t.meta}</span>
            </span>
            <span className={field.action} aria-hidden>
              <Icon name="chevron" size={18} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
