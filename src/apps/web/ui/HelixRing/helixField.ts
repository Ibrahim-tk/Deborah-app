/**
 * Rasterises a DNA double helix bent into a ring onto a character grid.
 * Returns per-cell brightness (0–1) and depth-lit "front" flag for the gold shading.
 */
export interface Field {
  cols: number;
  /** Brightness per cell, row-major. */
  lum: Float32Array;
  /** Angle around the ring per cell (radians), for the moving specular sweep. */
  ang: Float32Array;
}

export const TWISTS = 10; // helical turns around the ring (matches the reference)
export const RUNGS = 70; // base-pair rungs

export function createField(cols: number): Field {
  return { cols, lum: new Float32Array(cols * cols), ang: new Float32Array(cols * cols) };
}

function plot(f: Field, x: number, y: number, v: number, a: number) {
  const c = Math.round(x);
  const r = Math.round(y);
  if (c < 0 || r < 0 || c >= f.cols || r >= f.cols) return;
  const i = r * f.cols + c;
  if (v > f.lum[i]) {
    f.lum[i] = v;
    f.ang[i] = a;
  }
}

/** phase: twist offset (radians) so the strands roll along the ring over time. */
export function drawHelixRing(f: Field, phase: number) {
  f.lum.fill(0);
  const n = f.cols;
  const cx = (n - 1) / 2;
  const R = n * 0.36; // ring radius
  const A = n * 0.085; // strand amplitude (tube radius)
  const steps = n * 40;

  const point = (t: number, strand: 0 | 1) => {
    const twist = TWISTS * t + phase + strand * Math.PI;
    const r = R + A * Math.sin(twist);
    // Depth: strands passing "in front" read brighter, like the lit edge in the reference.
    const depth = 0.5 + 0.5 * Math.cos(twist);
    return { x: cx + r * Math.cos(t), y: cx + r * Math.sin(t), depth };
  };

  // Backbones.
  for (let s = 0; s < steps; s++) {
    const t = (s / steps) * Math.PI * 2;
    for (const strand of [0, 1] as const) {
      const p = point(t, strand);
      plot(f, p.x, p.y, 0.45 + 0.55 * p.depth, t);
    }
  }

  // Rungs (base pairs): dimmer, drawn between the two strands.
  for (let k = 0; k < RUNGS; k++) {
    const t = (k / RUNGS) * Math.PI * 2;
    const a = point(t, 0);
    const b = point(t, 1);
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const segs = Math.max(2, Math.ceil(len * 1.5));
    for (let j = 1; j < segs; j++) {
      const u = j / segs;
      const d = a.depth * (1 - u) + b.depth * u;
      plot(f, a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, 0.18 + 0.32 * d, t);
    }
  }
}

/** Point on a strand in a size×size box (used by the smooth renderer). */
export function helixPoint(size: number, t: number, strand: 0 | 1, phase: number) {
  const c = size / 2;
  const R = size * 0.36;
  const A = size * 0.085;
  const twist = TWISTS * t + phase + strand * Math.PI;
  const r = R + A * Math.sin(twist);
  return { x: c + r * Math.cos(t), y: c + r * Math.sin(t), depth: 0.5 + 0.5 * Math.cos(twist) };
}
