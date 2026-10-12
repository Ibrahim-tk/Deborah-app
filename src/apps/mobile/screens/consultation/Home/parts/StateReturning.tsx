/**
 * Home · State 2 — returning after a chat (Figma 171:145). Home reflects the conversation:
 * Continue with Deborah (resumes at an unanswered question), next steps that fill the profile
 * over time, the 90 Day Journey once unlocked, Reports only once one exists, My Health with
 * profile completion, and recommendations only when personalised (each says why).
 */
import { Button, Icon } from '@mobile/ui';
import { Bar, LinkCard, Recommendations, SectionLabel, TilePair, type Recommendation, type TileProps } from './HomeKit';
import styles from './HomeStates.module.css';

export interface NextStep {
  key: string;
  title: string;
  sub: string;
  onPress: () => void;
}

export interface StateReturningProps {
  /** "yesterday", "3 days ago"… */
  when?: string;
  topic: string;
  summary?: string;
  /** The intake question left unanswered, if the chat stopped partway. */
  pendingQuestion?: string;
  onContinue: () => void;
  steps: NextStep[];
  journey?: { day: number; today?: string; onPress: () => void };
  reports?: { meta: string; onPress: () => void };
  tiles: [TileProps, TileProps];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateReturning(p: StateReturningProps) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="continue-deborah">
        <div className={styles.heroText}>
          <p className={styles.kicker}>Continue with Deborah{p.when ? ` · ${p.when}` : ''}</p>
          <h2 id="continue-deborah" className={styles.heroTitle}>{p.topic}</h2>
          {p.summary && <p className={styles.heroBody}>{p.summary}</p>}
        </div>
        {p.pendingQuestion && <p className={styles.pending}>Next: “{p.pendingQuestion}”</p>}
        <Button fullWidth onClick={p.onContinue}>Continue</Button>
      </section>

      {p.steps.length > 0 && (
        <section className={styles.section} aria-labelledby="next-steps">
          <SectionLabel><span id="next-steps">Next steps</span></SectionLabel>
          <ul className={styles.list}>
            {p.steps.map((s) => (
              <li key={s.key}>
                <button type="button" className={styles.step} onClick={s.onPress}>
                  <span className={styles.stepText}>
                    <span className={styles.stepTitle}>{s.title}</span>
                    <span className={styles.stepSub}>{s.sub}</span>
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.journey && (
        <LinkCard
          tone="linen"
          title="90 Day Journey"
          meta={`Day ${p.journey.day} of 90${p.journey.today ? ` · Today: ${p.journey.today}` : ''}`}
          extra={<Bar value={p.journey.day / 90} />}
          onPress={p.journey.onPress}
        />
      )}

      {p.reports && <LinkCard tone="lilac" title="Reports" meta={p.reports.meta} onPress={p.reports.onPress} />}

      <TilePair tiles={p.tiles} />

      <Recommendations items={p.recommendations} onShop={p.onShop} />
    </>
  );
}
