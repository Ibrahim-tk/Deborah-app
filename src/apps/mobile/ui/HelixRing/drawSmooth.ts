/** Smooth polished-gold rendering of the helix ring, drawn over the fading ASCII. */
import { helixPoint, RUNGS } from './helixField';

type Gold = (l: number, glint: number) => string;

/** reveal (0–1): how much of the ring has been drawn so far, starting at the top. */
export function drawSmooth(ctx: CanvasRenderingContext2D, size: number, phase: number, sweep: number, alpha: number, gold: Gold, reveal = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  const steps = 720;
  const START = -Math.PI / 2; // draw from 12 o'clock, clockwise
  const end = reveal * Math.PI * 2;
  const glintAt = (t: number, l: number) => {
    const d = Math.cos(t - sweep);
    return d > 0.88 ? (d - 0.88) * 8 * l : 0;
  };

  // Rungs first (behind the backbones), thin and soft.
  for (let k = 0; k < RUNGS; k++) {
    const u = (k / RUNGS) * Math.PI * 2;
    if (u > end) break;
    const t = START + u;
    const a = helixPoint(size, t, 0, phase);
    const b = helixPoint(size, t, 1, phase);
    const l = 0.35 + 0.3 * ((a.depth + b.depth) / 2);
    ctx.strokeStyle = gold(l, glintAt(t, l) * 0.6);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Backbones: thicker and brighter where the strand passes in front.
  for (const strand of [0, 1] as const) {
    let prev = helixPoint(size, START, strand, phase);
    for (let s = 1; s <= steps; s++) {
      const u = (s / steps) * Math.PI * 2;
      if (u > end) break;
      const t = START + u;
      const p = helixPoint(size, t, strand, phase);
      const l = 0.4 + 0.6 * p.depth;
      ctx.strokeStyle = gold(l, glintAt(t, l));
      ctx.lineWidth = 0.8 + 1.6 * p.depth;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      prev = p;
    }
  }
  ctx.restore();
}
