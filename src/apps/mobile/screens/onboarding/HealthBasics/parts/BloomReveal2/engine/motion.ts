/**
 * Wind, falling petals and the sap rise. Pure state + step functions; drawing lives in compose.ts.
 * Nothing loops: a gust is an impulse that settles, petals fall once, the sap rises once per answer.
 */
import type { Sprite } from './loadRig';

const STIFF = 38;
const DAMP = 4.2;
const GUST_MS = 900;
const PETAL_MS = 2600;
const SAP_MS = 1400;

export interface Spring { x: number; v: number }
export interface Petal { sprite: Sprite; x: number; y: number; vx: number; spin: number; age: number; seed: number }

export interface Motion {
  springs: Spring[];
  /** Time since the gust began (ms); Infinity when calm. */
  gustAge: number;
  gustX: number;
  petals: Petal[];
  sapAge: number;
}

export function createMotion(count: number): Motion {
  return { springs: Array.from({ length: count }, () => ({ x: 0, v: 0 })), gustAge: Infinity, gustX: 0, petals: [], sapAge: Infinity };
}

export function gust(m: Motion, fromRight = true) {
  m.gustAge = 0;
  m.gustX = fromRight ? 1 : 0;
}

export function sap(m: Motion) {
  m.sapAge = 0;
}

/** Detach a few petals from the outer clusters. The clusters themselves stay: the tree never runs out. */
export function pluck(m: Motion, sprites: Sprite[], n = 4) {
  const petals = sprites.filter((s) => s.kind === 'petal');
  const outer = sprites.filter((s) => s.kind === 'blossom' && s.region.startsWith('outer'));
  if (!petals.length || !outer.length) return;
  for (let i = 0; i < n; i++) {
    const from = outer[Math.floor(Math.random() * outer.length)];
    m.petals.push({
      sprite: petals[Math.floor(Math.random() * petals.length)],
      x: from.x + from.frame[2] * Math.random(),
      y: from.y + from.frame[3] * 0.6,
      vx: -20 - Math.random() * 30,
      spin: (Math.random() - 0.5) * 4,
      age: -i * 140,
      seed: Math.random() * 6.28,
    });
  }
}

/** Advance by dt seconds. `width` is the rig width (for the gust front). Returns true while anything moves. */
export function stepMotion(m: Motion, sprites: Sprite[], dt: number, width: number): boolean {
  const ms = dt * 1000;
  let moving = false;
  if (m.gustAge < GUST_MS) {
    m.gustAge += ms;
    moving = true;
  }
  const front = m.gustAge / GUST_MS;
  sprites.forEach((s, i) => {
    const sp = m.springs[i];
    // The gust front crosses the canopy; each cluster gets a push as it passes (phase offset by position).
    const pos = m.gustX ? 1 - (s.x + s.frame[2] / 2) / width : (s.x + s.frame[2] / 2) / width;
    const hit = front >= pos && front < pos + 0.25 ? -1 : 0;
    const force = hit * 60 * s.sway - STIFF * sp.x - DAMP * sp.v;
    sp.v += force * dt;
    sp.x += sp.v * dt;
    if (Math.abs(sp.x) > 0.0005 || Math.abs(sp.v) > 0.0005) moving = true;
    else sp.x = sp.v = 0;
  });
  for (const p of m.petals) {
    p.age += ms;
    if (p.age < 0) continue;
    const t = p.age / 1000;
    p.x += (p.vx + Math.sin(t * 2.4 + p.seed) * 28) * dt;
    p.y += (40 + t * 55) * dt;
  }
  m.petals = m.petals.filter((p) => p.age < PETAL_MS);
  if (m.petals.length) moving = true;
  if (m.sapAge < SAP_MS) {
    m.sapAge += ms;
    moving = true;
  }
  return moving;
}

export const petalLife = (p: Petal) => Math.max(0, p.age) / PETAL_MS;
export const sapFront = (m: Motion) => (m.sapAge < SAP_MS ? m.sapAge / SAP_MS : -1);
