/**
 * GenesisTree — 3D tree of life (three.js, ~/Downloads/genesis-tree) as the intake progress tree.
 * Same props as BloomReveal: `progress` 0..1 steps Sprout → Gold bloom; the trunk base sits on the bottom edge.
 * OPEN: "no wave / pulse animations" (CLAUDE.md §8) — the gold light climb is a single pass; confirm with DESIGN.md.
 */
import { useEffect, useRef } from 'react';
import { mountGenesisTree } from './genesisEngine.js';
import styles from './GenesisTree.module.css';

export interface GenesisTreeProps {
  progress?: number;
  className?: string;
  /** Play the wind study (blossoms blown away, tree dissolves) — ~8s. */
  wind?: boolean;
}

export default function GenesisTree({ progress = 0, className, wind = false }: GenesisTreeProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ setProgress: (p: number) => void; wind: () => void } | null>(null);
  const goal = useRef(progress);
  const windRef = useRef(wind);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | null = null;
    // The engine expects its panel elements; give it detached stand-ins (no visible chrome in the intake).
    const el = (tag: string) => document.createElement(tag);
    mountGenesisTree({
      root: root.current!, canvas: canvas.current!, stage: el('h1'), caption: el('p'), scrub: el('input'),
      ages: el('div'), play: el('button'), next: el('button'), replay: el('button'), time: el('span'),
    }).then((d) => {
      if (cancelled) return d();
      dispose = d;
      api.current = d;
      d.setProgress(goal.current);
      if (windRef.current) d.wind();
    }).catch((err) => console.error('GenesisTree failed to start', err));
    return () => { cancelled = true; api.current = null; dispose?.(); };
  }, []);

  useEffect(() => { windRef.current = wind; if (wind) api.current?.wind(); }, [wind]);
  useEffect(() => { goal.current = progress; api.current?.setProgress(progress); }, [progress]);

  return (
    <div ref={root} className={`${styles.root} ${wind ? styles.gone : ''} ${className ?? ''}`} aria-hidden>
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  );
}
