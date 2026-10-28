/**
 * SuggestionCarousel — next-step artifact cards (icon well · title · sub · arrow · floral PNG).
 */
import { Icon, type IconName } from '@web/ui';
import { artifactForIntent, type HomeArtifactId, type HomeTone } from '../homeArtifacts';
import styles from './SuggestionCarousel.module.css';

export interface SuggestionCard {
  key: string;
  title: string;
  sub?: string;
  tone?: HomeTone;
  artifact?: HomeArtifactId;
  icon?: IconName;
  onPress: () => void;
  /** Middle figure under the title, e.g. Profile complete · 40%. */
  stat?: { label: string; value: string };
  /** Quiet bottom row: [left, right]. */
  foot?: [string, string];
  /** @deprecated Prefer tone + artifact. */
  imageSrc?: string;
}

function iconForKey(key: string): IconName {
  const k = key.toLowerCase();
  if (k === 'labs' || k.includes('lab') || k.includes('upload')) return 'file';
  if (k === 'lifestyle') return 'moon';
  if (k === 'sleep' || k.includes('sleep') || k.includes('food') || k.includes('stress')) return 'moon';
  if (k === 'tired') return 'moon';
  if (k === 'checkin') return 'bell';
  if (k === 'meds' || k.includes('medic')) return 'medicine';
  if (k.includes('supplement')) return 'medicine';
  return 'chat';
}

export function SuggestionCarousel({
  items,
  label = 'Start with the Oracle',
  layout = 'rail',
}: {
  items: SuggestionCard[];
  label?: string;
  /** `essentials` = 3-up grid on desktop (home dashboard). */
  layout?: 'rail' | 'essentials';
}) {
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-labelledby="home-suggest-rail">
      <h2 id="home-suggest-rail" className={styles.label}>{label}</h2>
      <ul className={layout === 'essentials' ? styles.essentials : styles.rail}>
        {items.map((item, index) => {
          let spec = item.tone && item.artifact
            ? { tone: item.tone, artifact: item.artifact }
            : artifactForIntent(item.key, item.title);
          if (label === 'Next steps' && index === items.length - 1) {
            spec = { tone: 'lilac', artifact: 'purple-spike-bloom' };
          }
          const rawIcon = item.icon ?? iconForKey(item.key);
          const icon: IconName =
            rawIcon === 'upload' || rawIcon === 'labs' ? 'file'
              : rawIcon === 'note' && /sleep|food|stress|habit/i.test(item.key + item.title) ? 'moon'
                : rawIcon;
          return (
            <li key={item.key} className={layout === 'essentials' ? styles.essentialsItem : styles.item}>
              <button
                type="button"
                className={styles.card}
                data-tone={spec.tone}
                onClick={item.onPress}
              >
                <span className={styles.icon} aria-hidden>
                  <Icon name={icon} size={20} />
                </span>
                {/* Serif title centred in the card's open middle (reference: finance card). */}
                <span className={styles.middle}>
                  <span className={styles.title}>{item.title}</span>
                  {item.stat ? (
                    <span className={styles.stat}>
                      <span className={styles.statLabel}>{item.stat.label}</span>
                      <span className={styles.statValue}>{item.stat.value}</span>
                    </span>
                  ) : item.sub && <span className={styles.sub}>{item.sub}</span>}
                </span>
                {item.foot && (
                  <span className={styles.foot}>
                    <span>{item.foot[0]}</span>
                    <span>{item.foot[1]}</span>
                  </span>
                )}
                <span className={styles.arrow} aria-hidden>
                  <Icon name="chevron" size={18} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
