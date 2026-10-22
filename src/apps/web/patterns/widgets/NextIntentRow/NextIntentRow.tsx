/**
 * NextIntentRow list — returning-user next steps (check-in, labs, deferred intake…).
 */
import { Icon, IconWell, type IconName } from '@web/ui';
import { HomeSectionLabel } from '../HomeSectionLabel';
import styles from './NextIntentRow.module.css';

export interface NextIntent {
  key: string;
  title: string;
  sub: string;
  icon: IconName;
  onPress: () => void;
}

export function NextIntentList({ items, label = 'Next steps' }: { items: NextIntent[]; label?: string }) {
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-labelledby="next-intents">
      <HomeSectionLabel><span id="next-intents">{label}</span></HomeSectionLabel>
      <ul className={styles.list}>
        {items.map((s) => (
          <li key={s.key}>
            <button type="button" className={styles.step} onClick={s.onPress}>
              <IconWell icon={s.icon} tint="lilac" />
              <span className={styles.text}>
                <span className={styles.title}>{s.title}</span>
                <span className={styles.sub}>{s.sub}</span>
              </span>
              <Icon name="chevron" size={18} className={styles.chevron} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
