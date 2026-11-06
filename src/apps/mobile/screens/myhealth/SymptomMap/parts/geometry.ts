/**
 * M-7.9 wheel geometry. One wheel, two springs: `rotation` (deg) and `zoom` (0 overview → 1 focus).
 * Every disc's place is a pure blend of the overview ring and the zoomed-in arc, so the
 * tapped disc rides up to the top and swells into the hero while its neighbours roll aside.
 */
export const AREA_COUNT = 8;
export const SLOT = 360 / AREA_COUNT;
/** Ring centre (px from the stage top) in the overview. */
export const CENTER_Y = 225;
/** Hero disc centre (px from the stage top) when zoomed in. */
export const HERO_Y = 150;
/** Base DOM size of a disc; everything else is scale. */
export const DISC = 86;
export const HERO = 260;
const NEIGHBOUR = 72;
/** Stage height: overview vs zoomed (the content flows right under the hero). */
export const STAGE = { overview: 450, focus: 300 } as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function ringRadius(width: number): number {
  return Math.min(128, width / 2 - 51);
}

/** Zoomed radius: the ±1 neighbours land just inside the screen edges. */
function focusRadius(width: number): number {
  return (width / 2 - 26) / Math.SQRT1_2;
}

/** Disc angle (deg) at a rotation; −90 is the top. */
export function angleOf(i: number, rotation: number): number {
  return -135 + i * SLOT + rotation;
}

/** Angular distance from the top (0…180). */
function fromTop(i: number, rotation: number): number {
  const d = (((angleOf(i, rotation) + 90) % 360) + 540) % 360 - 180;
  return Math.abs(d);
}

/** Rotation that puts area `i` at the top, nearest the current rotation. */
export function rotationFor(i: number, rotation: number): number {
  const base = 45 - i * SLOT;
  return base + 360 * Math.round((rotation - base) / 360);
}

/** Area currently nearest the top. */
export function topIndex(rotation: number): number {
  return ((Math.round((45 - rotation) / SLOT) % AREA_COUNT) + AREA_COUNT) % AREA_COUNT;
}

/** Snap target for a release in focus: nearest slot after a short velocity projection (max 2 slots). */
export function snapTarget(rotation: number, velocity: number, from: number): number {
  const projected = rotation + velocity * 160;
  const target = Math.round(projected / SLOT) * SLOT;
  return Math.max(from - 2 * SLOT, Math.min(from + 2 * SLOT, target));
}

export interface DiscLayout { x: number; y: number; scale: number; opacity: number; label: number; icon: number; z: number }

/** Where disc `i` sits. `strength` sizes the overview disc; `coreZ` sinks the areas for the core view. */
export function wheelLayout(i: number, rotation: number, zoom: number, width: number, strength: number, coreZ: number): DiscLayout {
  const a = (angleOf(i, rotation) * Math.PI) / 180;
  const r1 = focusRadius(width);
  const r = lerp(ringRadius(width), r1, zoom);
  const cy = lerp(CENTER_Y, HERO_Y + r1, zoom);
  const d = fromTop(i, rotation);

  const s0 = strength === 2 ? 94 / DISC : strength === 1 ? 90 / DISC : 1;
  const s1 = d < SLOT ? lerp(HERO, NEIGHBOUR, d / SLOT) / DISC : lerp(NEIGHBOUR, 44, clamp01((d - SLOT) / SLOT)) / DISC;
  const o1 = d < 20 ? 1 : d <= 60 ? lerp(1, 0.6, (d - 20) / 40) : 0.6 * (1 - clamp01((d - 60) / 40));
  const icon1 = lerp(72, 28, clamp01(d / SLOT));

  return {
    x: Math.cos(a) * r,
    y: cy + Math.sin(a) * r + coreZ * 220,
    scale: lerp(s0, s1, zoom),
    opacity: lerp(1, o1, zoom) * (1 - coreZ),
    label: 1 - clamp01(zoom / 0.4),
    icon: lerp(22, icon1, zoom),
    z: Math.round(lerp(10, 200 - d, zoom)),
  };
}
