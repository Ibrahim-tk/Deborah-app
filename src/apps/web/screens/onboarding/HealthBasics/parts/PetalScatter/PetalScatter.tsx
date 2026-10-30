/**
 * PetalScatter — Kung Fu Panda peach-tree moment, in two acts.
 *  · `scatter` (Health Basics exit): the canopy sheds its blossoms in three gusts; each petal tumbles in 3D,
 *    sways on its way across the page and thins into the air. Near petals are larger and softly out of focus,
 *    far ones small and faint, so the drift has depth.
 *  · `settle` (Oracle's welcome arrival): the last few stragglers drift down through the new screen.
 * Pure CSS; every petal gets a seeded start, path, sway, spin, depth and timing through custom properties.
 */
import type { CSSProperties } from 'react';
import styles from './PetalScatter.module.css';

// Deterministic pseudo-random so the scatter is the same every run.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

type Mode = 'scatter' | 'settle';

function build(mode: Mode) {
  const count = mode === 'scatter' ? 150 : 14;
  return Array.from({ length: count }, (_, i) => {
    const depth = rand(i, 10); // 0 far … 1 near
    const gust = mode === 'scatter' ? i % 3 : 0; // three waves of shedding
    return {
      shape: rand(i, 11) < 0.25 ? 'spark' : rand(i, 11) < 0.4 ? 'bloom' : 'petal',
      x: mode === 'scatter' ? 6 + rand(i, 1) * 84 : rand(i, 1) * 100,
      y: mode === 'scatter' ? 6 + rand(i, 2) * 58 : -6 - rand(i, 2) * 10,
      dx: mode === 'scatter' ? -(70 + rand(i, 3) * 70) : (rand(i, 3) - 0.6) * 30,
      dy: mode === 'scatter' ? (rand(i, 4) - 0.65) * 50 : 70 + rand(i, 4) * 40,
      sway: 2 + rand(i, 12) * 5,
      rot: (rand(i, 5) - 0.5) * 1080,
      flip: 1 + Math.floor(rand(i, 13) * 4),
      size: (5 + depth * 12) * (mode === 'settle' ? 1.1 : 1),
      blur: depth > 0.82 ? (depth - 0.82) * 14 : depth < 0.2 ? 0.6 : 0,
      alpha: 0.45 + depth * 0.5,
      delay: mode === 'scatter' ? 100 + gust * 200 + rand(i, 7) * 300 : 200 + rand(i, 7) * 1600,
      dur: mode === 'scatter' ? 1800 + rand(i, 8) * 600 : 3200 + rand(i, 8) * 1800,
      tone: Math.floor(rand(i, 9) * 4),
    };
  });
}

const SETS: Record<Mode, ReturnType<typeof build>> = { scatter: build('scatter'), settle: build('settle') };

export function PetalScatter({ mode = 'scatter' }: { mode?: Mode }) {
  return (
    <div className={styles.root} data-mode={mode} aria-hidden data-overlay>
      {SETS[mode].map((p, i) => (
        <span
          key={i}
          className={styles.carrier}
          style={
            {
              '--x': `${p.x}%`,
              '--y': `${p.y}%`,
              '--dx': `${p.dx}vw`,
              '--dy': `${p.dy}vh`,
              '--sway': `${p.sway}vh`,
              '--delay': `${p.delay}ms`,
              '--dur': `${p.dur}ms`,
              '--alpha': p.alpha,
            } as CSSProperties
          }
        >
          <span
            className={styles.petal}
            data-shape={p.shape}
            data-tone={p.tone}
            style={
              {
                '--size': `${p.size}px`,
                '--blur': `${p.blur}px`,
                '--rot': `${p.rot}deg`,
                '--flip': p.flip,
                '--delay': `${p.delay}ms`,
                '--dur': `${p.dur}ms`,
              } as CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
