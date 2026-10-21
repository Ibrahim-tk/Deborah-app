/**
 * TodayHabitsCard — established Home habits on a solid artifact field (no photo, no eyebrow).
 */
import { Icon } from '@mobile/ui';
import { ProgressHairline } from '../ProgressHairline';
import styles from './TodayHabitsCard.module.css';

export interface TodayHabit {
  id: string;
  text: string;
  done: boolean;
}

export function TodayHabitsCard({
  day,
  habits,
  onToggle,
}: {
  day: number;
  habits: TodayHabit[];
  onToggle: (habitId: string) => void;
  /** @deprecated Photo banner removed. */
  imageSrc?: string;
}) {
  const done = habits.filter((h) => h.done).length;
  return (
    <div className={styles.wrap}>
      <span className={styles.stack} aria-hidden />
      <section className={styles.root} aria-labelledby="today-habits" data-placeholder>
        <div className={styles.panel}>
          <div className={styles.text}>
            <h2 id="today-habits" className={styles.title}>Your habits for today</h2>
            <p className={styles.meta}>Day {day} of 90</p>
          </div>
          {habits.length > 0 && (
            <ul className={styles.habits}>
              {habits.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    className={styles.habit}
                    role="checkbox"
                    aria-checked={h.done}
                    onClick={() => onToggle(h.id)}
                  >
                    <span className={styles.mark} data-on={h.done || undefined} aria-hidden>
                      {h.done && <Icon name="check" size={14} />}
                    </span>
                    <span>{h.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.foot}>
            <ProgressHairline value={habits.length ? done / habits.length : 0} className={styles.bar} />
            <span className={styles.sub}>{done} of {habits.length} done</span>
          </div>
        </div>
      </section>
    </div>
  );
}
