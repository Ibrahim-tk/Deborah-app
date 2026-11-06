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
export const HERO_Y = 125;
/** Base DOM size of a disc; everything else is scale. */
export const DISC = 86;
export const HERO = 180;
/** Core view (designer, 2026-11-07): the core is the main circle; areas continue the wheel, two each side. */
export const CORE_HERO = HERO;
export const CORE_Y = HERO_Y;
/** Stage height: overview vs zoomed (the content flows right under the hero). */
export const STAGE = { overview: 450, focus: 272 } as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function ringRadius(width: number): number {
  return Math.min(128, width / 2 - 51);
}

/** Inner orbit (the person's symptoms): between the core's edge and the area discs' inner edge. */
export function satelliteRadius(width: number): number {
  return ringRadius(width) * 0.47;
}


/** Disc angle (deg) at a rotation; −90 is the top. */
export function angleOf(i: number, rotation: number): number {
  return -135 + i * SLOT + rotation;
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

export interface DiscLayout { x: number; y: number; scale: number; opacity: number; label: number; labelScale: number; hero: number; heroScale: number; icon: number; z: number }

/** Zoomed "carousel" stops, in slots from the top: x offset, y drop, size and fade at 0 · 1 · 2 · 3 slots. */
function focusStop(u: number, width: number) {
  const X = [0, width * 0.33, width / 2 - 20, width / 2 + 30];
  const Y = [0, 34, 58, 70];
  const S = [HERO, 58, 42, 36];
  const O = [1, 0.85, 0.5, 0];
  const I = [56, 22, 18, 18];
  const k = Math.min(2, Math.floor(u));
  const t = clamp01(u - k);
  return { x: lerp(X[k], X[k + 1], t), y: lerp(Y[k], Y[k + 1], t), size: lerp(S[k], S[k + 1], t), o: lerp(O[k], O[k + 1], t), icon: lerp(I[k], I[k + 1], t) };
}

/** Where disc `i` sits. `strength` sizes the overview disc; `coreZ` sinks the areas for the core view. */
export function wheelLayout(i: number, rotation: number, zoom: number, width: number, strength: number, coreZ: number): DiscLayout {
  const a = (angleOf(i, rotation) * Math.PI) / 180;
  const r0 = ringRadius(width);
  // Overview: a ring around the core.
  const x0 = Math.cos(a) * r0;
  const y0 = CENTER_Y + Math.sin(a) * r0;
  // Zoomed (designer, 2026-11-07): one smaller main disc with two on each side, sliding along a gentle arc.
  const signed = ((((angleOf(i, rotation) + 90) % 360) + 540) % 360) - 180;
  const u = Math.abs(signed) / SLOT;
  const f = focusStop(Math.min(u, 3), width);
  const x1 = Math.sign(signed) * f.x;
  const y1 = HERO_Y + f.y;
  const d = Math.abs(signed);

  // Overview discs hold only the icon; the name sits below, so the circles can be smaller.
  const s0 = (strength === 2 ? 72 : strength === 1 ? 68 : 64) / DISC;
  const s1 = f.size / DISC;
  const scale = lerp(s0, s1, zoom);

  // Core view: the wheel sits on half-steps, so areas fall at 1, 2, 3… slots either side of the core.
  const half = Math.abs(signed) / SLOT + 0.5;
  const fc = focusStop(Math.min(half, 3), width);
  const xc = (Math.sign(signed) || 1) * fc.x;
  const yc = HERO_Y + fc.y;
  const sc = fc.size / DISC;
  return {
    x: lerp(lerp(x0, x1, zoom), xc, coreZ),
    y: lerp(lerp(y0, y1, zoom), yc, coreZ),
    scale: lerp(scale, sc, coreZ),
    opacity: lerp(lerp(1, f.o, zoom), fc.o, coreZ),
    label: 1 - clamp01(zoom / 0.4),
    // Overview name stays 11px on screen however the disc scales.
    labelScale: (11 / 12) / lerp(scale, sc, coreZ),
    // In-disc name: only on the main disc while zoomed; 14px under a 56px icon.
    hero: zoom * clamp01(1 - d / 22) * (1 - coreZ),
    heroScale: (14 / 12) / lerp(scale, sc, coreZ),
    icon: lerp(lerp(24, f.icon, zoom), fc.icon, coreZ),
    z: Math.round(lerp(10, 200 - d, zoom)),
  };
}
