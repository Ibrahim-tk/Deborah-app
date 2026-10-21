/**
 * PhotoDestinationPair — My Health · Family destination tiles
 * (centered art · title/meta bottom-left · circular action bottom-right).
 */
import { Icon, type IconName } from '@mobile/ui';
import { type HomeArtifactId, type HomeTone } from '../homeArtifacts';
import styles from './PhotoDestinationPair.module.css';

export interface PhotoDestination {
  title: string;
  meta: string;
  tone?: HomeTone;
  artifact?: HomeArtifactId;
  /** Circular action: chevron (My Health) · plus (Family). */
  action?: 'chevron' | 'plus';
  onPress: () => void;
  imageSrc?: string;
}

export function PhotoDestinationPair({ tiles }: { tiles: [PhotoDestination, PhotoDestination] }) {
  return (
    <div className={styles.pair}>
      {tiles.map((t, i) => {
        const tone = t.tone ?? (i === 0 ? 'mint' : 'rose');
        const action: IconName = t.action ?? (i === 0 ? 'chevron' : 'plus');
        return (
          <button
            key={t.title}
            type="button"
            className={styles.tile}
            data-tone={tone}
            onClick={t.onPress}
          >
            <span className={styles.foot}>
              <span className={styles.copy}>
                <span className={styles.title}>{t.title}</span>
                <span className={styles.meta}>{t.meta}</span>
              </span>
              <span className={styles.action} aria-hidden>
                <Icon name={action} size={18} />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
