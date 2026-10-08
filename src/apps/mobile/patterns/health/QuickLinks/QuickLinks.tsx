/**
 * @pattern QuickLinks — History · Visit Notes · Labs, each with its count as plain text ("Labs · 1")
 * @usedBy  M-7.2
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 5)
 * @xref    web: apps/web/patterns/health/QuickLinks — not built
 */
import { Icon, type IconName } from '@mobile/ui';
import styles from './QuickLinks.module.css';

export interface QuickLink<K extends string = string> {
  key: K;
  label: string;
  icon: IconName;
  count: number;
}

export interface QuickLinksProps<K extends string = string> {
  links: QuickLink<K>[];
  onSelect: (key: K) => void;
}

export function QuickLinks<K extends string>({ links, onSelect }: QuickLinksProps<K>) {
  return (
    <nav className={styles.root} aria-label="Your records">
      {links.map((l) => (
        <button key={l.key} type="button" className={styles.link} onClick={() => onSelect(l.key)}>
          <Icon name={l.icon} size={24} className={styles.icon} />
          <span className={styles.label}>
            {l.label} · {l.count}
          </span>
        </button>
      ))}
    </nav>
  );
}
