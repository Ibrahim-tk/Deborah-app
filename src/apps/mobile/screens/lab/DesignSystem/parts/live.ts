/**
 * Live token reading for the design system page. Values come from getComputedStyle on an element inside
 * `phone-root`, so the page always shows what the app really renders (primitives → mobile tokens →
 * refresh → Deborah skin), never a copied table that can drift.
 */
import { createContext, useContext } from 'react';

export const LiveRoot = createContext<HTMLElement | null>(null);

/** Resolved value of a custom property (`--color-ink` → `#302335`), or '' before the page mounts. */
export function useToken(name: string): string {
  const root = useContext(LiveRoot);
  return root ? getComputedStyle(root).getPropertyValue(name).trim() : '';
}

/** A reader for many tokens at once (one getComputedStyle call). */
export function useTokenReader(): (name: string) => string {
  const root = useContext(LiveRoot);
  const cs = root ? getComputedStyle(root) : null;
  return (name) => (cs ? cs.getPropertyValue(name).trim() : '');
}

type RGBA = [number, number, number, number];

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() (comma or space syntax). Gradients and mixes return null. */
export function parseColor(value: string): RGBA | null {
  const v = value.trim().toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const fn = v.match(/^rgba?\(([^)]+)\)$/);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean).map((p) => (p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p)));
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  }
  return null;
}

/** Composites a translucent colour over an opaque one. */
function over([r, g, b, a]: RGBA, [br, bg, bb]: RGBA): RGBA {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio of `fg` on `bg`, or null when either isn't a plain colour. */
export function contrast(fg: string, bg: string): number | null {
  const b = parseColor(bg);
  const f = parseColor(fg);
  if (!b || !f) return null;
  const base = b[3] < 1 ? over(b, [255, 255, 255, 1]) : b;
  const top = f[3] < 1 ? over(f, base) : f;
  const [l1, l2] = [luminance(top), luminance(base)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
