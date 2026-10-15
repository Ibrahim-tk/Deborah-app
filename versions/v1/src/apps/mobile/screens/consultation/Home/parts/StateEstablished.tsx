/**
 * Home · State 3 — a few weeks in (Figma 172:145). A "today" card leads (the day's habits, tap to
 * mark), then compact section cards with status, and personalised recommendations.
 */
import { Icon } from '@flow-v1/apps/mobile/ui';
import { Bar, LinkCard, Recommendations, TilePair, type Recommendation, type TileProps } from './HomeKit';
import styles from './HomeStates.module.css';

export interface TodayHabit {
  id: string;
  text: string;
  done: boolean;
}

export interface StateEstablishedProps {
  day: number;
  habits: TodayHabit[];
  onToggle: (habitId: string) => void;
  continueMeta?: string;
  onContinue: () => void;
  onJourney: () => void;
  reports?: { meta: string; onPress: () => void };
  tiles: [TileProps, TileProps];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateEstablished(p: StateEstablishedProps) {
  const done = p.habits.filter((h) => h.done).length;
  return (
    <>
      <section className={styles.hero} aria-labelledby="today-habits" data-placeholder>
        <div className={styles.heroText}>
          <p className={styles.kicker}>
            <Icon name="calendar" size={16} />
            Today · Day {p.day} of 90
          </p>
          <h2 id="today-habits" className={styles.heroTitle}>Your habits for today</h2>
        </div>
        {p.habits.length > 0 && (
          <ul className={styles.habits}>
            {p.habits.map((h) => (
              <li key={h.id}>
                <button type="button" className={styles.habit} role="checkbox" aria-checked={h.done} onClick={() => p.onToggle(h.id)}>
                  <span className={styles.mark} data-on={h.done || undefined} aria-hidden>
                    {h.done && <Icon name="check" size={14} />}
                  </span>
                  <span>{h.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.todayFoot}>
          <Bar value={p.habits.length ? done / p.habits.length : 0} className={styles.todayBar} />
          <span className={styles.stepSub}>{done} of {p.habits.length} done</span>
        </div>
      </section>

      <LinkCard tone="linen" lead="chat" title="Continue with Deborah" meta={p.continueMeta ?? 'Pick up where you left off'} onPress={p.onContinue} />
      <LinkCard tone="rose" lead="calendar" title="90 Day Journey" meta={`Day ${p.day} of 90 · On track`} onPress={p.onJourney} />
      {p.reports && <LinkCard tone="lilac" lead="labs" title="Reports" meta={p.reports.meta} onPress={p.reports.onPress} />}
      <TilePair tiles={p.tiles} compact />
      <Recommendations items={p.recommendations} onShop={p.onShop} />
    </>
  );
}
