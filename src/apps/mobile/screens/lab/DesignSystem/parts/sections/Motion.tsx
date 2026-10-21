/** Motion: durations and easings, each playable. Calm iOS motion, no overshoot (V2 CSS bans). */
import { useState, type CSSProperties } from 'react';
import { Button } from '@mobile/ui';
import { Section, Group } from '../Section';
import { useTokenReader } from '../live';
import { DURATIONS, EASINGS } from '../catalog';
import styles from './sections.module.css';

export function Motion() {
  const read = useTokenReader();
  const [on, setOn] = useState(false);
  const track = (dur: string, ease: string) => ({ '--dur': dur, '--ease': ease }) as CSSProperties;
  return (
    <Section
      id="motion"
      title="Motion"
      lede="Quick, calm and critically damped. Reduced motion turns every movement into a 120 ms crossfade. Banned: waves, ripples, shimmer, bounce, pulse, parallax, confetti."
    >
      <div>
        <Button variant="secondary" size="sm" leadingIcon="play" onClick={() => setOn((x) => !x)}>Play all</Button>
      </div>
      <Group title="Durations" note="Each uses --ease-ios.">
        <div className={styles.motionList}>
          {DURATIONS.map((t) => (
            <div key={t.name} className={styles.motionRow}>
              <span className={styles.mono}>{t.name}</span>
              <span className={styles.monoMuted}>{read(t.name)} · {t.use}</span>
              <span className={styles.motionTrack} data-on={on} style={track(`var(${t.name})`, 'var(--ease-ios)')}>
                <span className={styles.motionDot} />
              </span>
            </div>
          ))}
        </div>
      </Group>
      <Group title="Easing" note="Shown at 600 ms so the curve is visible.">
        <div className={styles.motionList}>
          {EASINGS.map((t) => (
            <div key={t.name} className={styles.motionRow}>
              <span className={styles.mono}>{t.name}</span>
              <span className={styles.monoMuted}>{read(t.name)} · {t.use}</span>
              <span className={styles.motionTrack} data-on={on} style={track('600ms', `var(${t.name})`)}>
                <span className={styles.motionDot} />
              </span>
            </div>
          ))}
        </div>
      </Group>
    </Section>
  );
}
