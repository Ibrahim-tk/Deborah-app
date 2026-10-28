/** Tree sandbox controls: progress, step, gust, pluck, reduced motion, FPS. Prototype tooling only. */
import { useTreeDev } from '@mobile/screens/onboarding/HealthBasics/parts/BloomReveal2';
import styles from './DevPanel.module.css';

const STEP = 1 / 8;

export function DevPanel() {
  const { progressOverride, reduceMotion, fps, gust, pluck, set } = useTreeDev();
  const value = progressOverride ?? 0;
  const nudge = (d: number) => set({ progressOverride: Math.max(0, Math.min(1, Math.round((value + d) / STEP) * STEP)) });

  return (
    <aside className={styles.panel} aria-label="Tree sandbox controls">
      <p className={styles.title}>Tree sandbox</p>
      <label className={styles.row}>
        <input type="checkbox" checked={progressOverride !== null} onChange={(e) => set({ progressOverride: e.target.checked ? value : null })} />
        Override progress
      </label>
      <label className={styles.row}>
        <input
          type="range" min={0} max={1} step={0.01} value={value} disabled={progressOverride === null}
          onChange={(e) => set({ progressOverride: Number(e.target.value) })}
        />
        <span className={styles.value}>{value.toFixed(2)}</span>
      </label>
      <div className={styles.buttons}>
        <button type="button" onClick={() => nudge(-STEP)}>Back</button>
        <button type="button" onClick={() => nudge(STEP)}>Next</button>
      </div>
      <div className={styles.buttons}>
        <button type="button" onClick={() => set({ gust: gust + 1 })}>Wind gust</button>
        <button type="button" onClick={() => set({ pluck: pluck + 1 })}>Pluck petals</button>
      </div>
      <label className={styles.row}>
        Reduce motion
        <select
          value={reduceMotion === null ? 'os' : reduceMotion ? 'on' : 'off'}
          onChange={(e) => set({ reduceMotion: e.target.value === 'os' ? null : e.target.value === 'on' })}
        >
          <option value="os">Follow OS</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </label>
      <p className={styles.row}>FPS <span className={styles.value}>{fps || 'idle'}</span></p>
    </aside>
  );
}
