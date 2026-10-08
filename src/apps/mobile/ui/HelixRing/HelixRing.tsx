/**
 * @ui HelixRing — polished-gold DNA ring. The smooth double helix draws itself around the circle
 * from 12 o'clock, then a faint ASCII grain fades in underneath; the strands keep slowly rolling while a specular glint
 * sweeps around. Canvas-rendered; static final frame under reduced motion.
 * @usedBy M-1.1 Splash
 */
import { useEffect, useRef } from 'react';
import { createField, drawHelixRing } from './helixField';
import { drawSmooth } from './drawSmooth';
import styles from './HelixRing.module.css';

const RAMP = ' .,:;-=+*%#@';
const FORM_MS = 1600;
/** Fade-in time of the ASCII grain after the ring is drawn. */
const SMOOTH_MS = 800;
/** How much ASCII texture sits under the smooth ring. */
const ASCII_REST = 0.18;

export interface HelixRingProps {
  /** CSS pixel size of the square mark. */
  size?: number;
  /** Characters across; higher = finer detail. */
  cols?: number;
  label?: string;
  className?: string;
}

/** Polished-gold ramp for a light canvas: deep bronze shadows → bright gold → pale glint. */
function gold(l: number, glint: number) {
  const g = Math.min(1, l * 0.9);
  const r = 97 + (209 - 97) * g; // gold-900 → gold-600
  const gg = 72 + (171 - 72) * g;
  const b = 30 + (80 - 30) * g;
  const k = Math.min(1, glint); // blend toward a warm white glint
  return `rgb(${Math.round(r + (255 - r) * k)} ${Math.round(gg + (244 - gg) * k)} ${Math.round(b + (214 - b) * k)})`;
}

export function HelixRing({ size = 168, cols = 56, label, className }: HelixRingProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cell = size / cols;
    ctx.font = `500 ${cell * 1.25}px ui-monospace, 'SF Mono', Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const field = createField(cols);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = reduced ? FORM_MS * 2 : now - start;
      const phase = t * 0.0006;
      drawHelixRing(field, phase);
      ctx.clearRect(0, 0, size, size);
      const sweep = t * 0.0011; // specular glint angle
      const p = Math.min(1, t / FORM_MS);
      const reveal = 1 - Math.pow(1 - p, 3); // ease-out draw-on
      const asciiFade = ASCII_REST * Math.min(1, Math.max(0, (t - FORM_MS) / SMOOTH_MS));
      // Faint ASCII grain fades in only once the ring has drawn itself.
      if (asciiFade > 0) {
        for (let i = 0; i < field.lum.length; i++) {
          const l = field.lum[i];
          if (l < 0.05) continue;
          const d = Math.cos(field.ang[i] - sweep);
          const glint = d > 0.9 ? (d - 0.9) * 10 * l : 0;
          ctx.globalAlpha = asciiFade;
          ctx.fillStyle = gold(l, glint);
          ctx.fillText(RAMP[Math.min(RAMP.length - 1, Math.round(l * (RAMP.length - 1)))], (i % cols) * cell + cell / 2, Math.floor(i / cols) * cell + cell / 2);
        }
      }
      ctx.globalAlpha = 1;
      drawSmooth(ctx, size, phase, sweep, Math.min(1, p * 2), gold, reveal);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, cols]);

  return (
    <canvas
      ref={ref}
      className={`${styles.root} ${className ?? ''}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
