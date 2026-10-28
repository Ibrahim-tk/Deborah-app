/**
 * BloomTree2 — layered jacaranda (tools/tree-assets rig) drawn on a 2D canvas. Drop-in for BloomTree:
 * same props, same easing toward the target, pauses when hidden or off-screen, jumps when motion is reduced.
 * After each answer: a gust, a few falling petals and one sap rise, all settling to stillness.
 * OPEN: "no wave / pulse animations" (CLAUDE.md §8) — the gust front, sap rise and gold sweep are single,
 * non-looping passes; confirm against DESIGN.md before the swap-in.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import fallbackSrc from './assets/canopy_mature.webp';
import { loadTree, type Tree } from './engine/loadRig';
import { compose } from './engine/compose';
import { createMotion, gust, pluck, sap, stepMotion } from './engine/motion';
import { useTreeDev } from './devControls';

export interface BloomTree2Props {
  /** 0..1; reversible and interruptible. */
  progress?: number;
  className?: string;
  style?: CSSProperties;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export default function BloomTree2({ progress = 0, className, style }: BloomTree2Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const override = useTreeDev((s) => s.progressOverride);
  const target = useRef(0);
  const wake = useRef<(answered: boolean) => void>(() => {});
  const [failed, setFailed] = useState(false);
  const goal = clamp(override ?? progress);

  useEffect(() => {
    const forward = goal > target.current;
    target.current = goal;
    wake.current(forward);
  }, [goal]);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let last = 0;
    let current = 0;
    let inView = true;
    let tree: Tree | undefined;
    let motion = createMotion(0);
    let frames = 0;
    let fpsAt = performance.now();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduced = () => useTreeDev.getState().reduceMotion ?? media.matches;
    const ctx = canvas.current?.getContext('2d');

    const step = (now: number) => {
      raf = 0;
      if (disposed || document.hidden || !inView || !tree || !ctx) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      current = reduced() ? target.current : current + (target.current - current) * (1 - Math.exp(-7 * dt));
      if (Math.abs(current - target.current) < 0.0005) current = target.current;
      const moving = !reduced() && stepMotion(motion, tree.rig.sprites, dt, tree.rig.size[0]);
      compose(ctx, tree, current, motion);
      frames++;
      if (now - fpsAt > 500) {
        useTreeDev.getState().set({ fps: Math.round((frames * 1000) / (now - fpsAt)) });
        frames = 0;
        fpsAt = now;
      }
      if (current !== target.current || moving) raf = requestAnimationFrame(step);
      else useTreeDev.getState().set({ fps: 0 });
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (disposed || document.hidden || !inView || !tree) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const settle = () => {
      motion = createMotion(tree?.rig.sprites.length ?? 0);
      start();
    };
    const answered = (forward: boolean) => {
      if (tree && forward && !reduced() && current > 0.3) {
        gust(motion);
        pluck(motion, tree.rig.sprites, 3);
        sap(motion);
      }
      start();
    };
    wake.current = answered;

    const offDev = useTreeDev.subscribe((s, prev) => {
      if (!tree) return;
      if (s.reduceMotion !== prev.reduceMotion) return settle();
      if (reduced()) return;
      if (s.gust !== prev.gust) gust(motion, Math.random() > 0.5);
      if (s.pluck !== prev.pluck) pluck(motion, tree.rig.sprites, 6);
      if (s.gust !== prev.gust || s.pluck !== prev.pluck) start();
    });
    const visibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', settle);
    const observer = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else cancelAnimationFrame(raf);
    });
    if (canvas.current) observer.observe(canvas.current);

    loadTree()
      .then((t) => {
        if (disposed || !canvas.current) return;
        tree = t;
        canvas.current.width = t.rig.size[0];
        canvas.current.height = t.rig.size[1];
        motion = createMotion(t.rig.sprites.length);
        start();
      })
      .catch(() => !disposed && setFailed(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      offDev();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', settle);
      wake.current = () => {};
    };
  }, []);

  if (failed) return <img className={className} style={style} src={fallbackSrc} alt="" aria-hidden="true" />;
  return <canvas ref={canvas} className={className} style={style} aria-hidden="true" />;
}
