/**
 * Loads tree-rig.json and its WebP layers (built by tools/tree-assets) and prepares the reveal layers.
 */
import rig from '../assets/tree-rig.json';
import rootsSrc from '../assets/roots_mature.webp';
import rootsMapSrc from '../assets/roots_mature_growth.webp';
import rootsSeedSrc from '../assets/roots_seedling.webp';
import trunkSeedSrc from '../assets/trunk_seedling.webp';
import trunkYoungSrc from '../assets/trunk_young.webp';
import trunkMatureSrc from '../assets/trunk_mature.webp';
import trunkMapSrc from '../assets/trunk_mature_growth.webp';
import canopySeedSrc from '../assets/canopy_seedling.webp';
import canopyYoungSrc from '../assets/canopy_young.webp';
import canopyMatureSrc from '../assets/canopy_mature.webp';
import atlasSrc from '../assets/sprites.webp';
import { RevealLayer } from './RevealLayer';

export type Rig = typeof rig;
export type Sprite = Rig['sprites'][number];
export type Window = [number, number];

export interface Tree {
  rig: Rig;
  roots: RevealLayer;
  trunkYoung: RevealLayer;
  canopyYoung: RevealLayer;
  canopyMature: RevealLayer;
  trunkMature: RevealLayer;
  rootsSeed: HTMLImageElement;
  trunkSeed: HTMLImageElement;
  canopySeed: HTMLImageElement;
  atlas: HTMLImageElement;
}

function image(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function pixels(img: HTMLImageElement): ImageData {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is unavailable');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
}

function channel(data: ImageData): Uint8Array {
  const out = new Uint8Array(data.width * data.height);
  for (let i = 0; i < out.length; i++) out[i] = data.data[i * 4];
  return out;
}

/** Canopy timing: distance from the trunk base, roughened so the edge isn't a perfect arc. */
function radialMap(w: number, h: number, ax: number, ay: number): Uint8Array {
  const out = new Uint8Array(w * h);
  const reach = Math.hypot(Math.max(ax, w - ax), ay);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = Math.sin(x * 0.043 + y * 0.021) * Math.sin(y * 0.037 - x * 0.017) * 0.06;
      const t = Math.hypot(x - ax, y - ay) / reach + n;
      out[y * w + x] = Math.max(0, Math.min(255, Math.round(t * 255)));
    }
  }
  return out;
}

/**
 * Taper the growth front: pixels near a limb's edge appear a little after its centre, so a growing limb
 * comes to a point instead of a flat, sawn-off end. Edge distance comes from a 3-4 chamfer transform.
 */
function taper(times: Uint8Array, img: ImageData, lead = 10): Uint8Array {
  const { width: w, height: h, data } = img;
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = data[i * 4 + 3] > 40 ? 1e6 : 0;
  const pass = (i: number, j: number, c: number) => {
    if (d[j] + c < d[i]) d[i] = d[j] + c;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!d[i]) continue;
      if (x > 0) pass(i, i - 1, 3);
      if (y > 0) pass(i, i - w, 3);
      if (x > 0 && y > 0) pass(i, i - w - 1, 4);
      if (x < w - 1 && y > 0) pass(i, i - w + 1, 4);
      if (x === 0 || y === 0 || x === w - 1) d[i] = Math.min(d[i], 3);
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (!d[i]) continue;
      if (x < w - 1) pass(i, i + 1, 3);
      if (y < h - 1) pass(i, i + w, 3);
      if (x < w - 1 && y < h - 1) pass(i, i + w + 1, 4);
      if (x > 0 && y < h - 1) pass(i, i + w - 1, 4);
    }
  }
  const out = new Uint8Array(times.length);
  for (let i = 0; i < out.length; i++) out[i] = Math.min(255, times[i] + Math.round(lead * Math.exp(-d[i] / 3 / 8)));
  return out;
}

export async function loadTree(): Promise<Tree> {
  const [roots, rootsMap, rootsSeed, trunkSeed, trunkYoung, trunkMature, trunkMap, canopySeed, canopyYoung, canopyMature, atlas] =
    await Promise.all([rootsSrc, rootsMapSrc, rootsSeedSrc, trunkSeedSrc, trunkYoungSrc, trunkMatureSrc, trunkMapSrc, canopySeedSrc, canopyYoungSrc, canopyMatureSrc, atlasSrc].map(image));
  const [w, h] = rig.size;
  const [ax, ay] = rig.anchor.trunkBase;
  const canopyMap = radialMap(w, h, ax, ay);
  const trunkTimes = channel(pixels(trunkMap));
  const young = pixels(trunkYoung);
  const mature = pixels(trunkMature);
  return {
    rig,
    roots: new RevealLayer(pixels(roots), channel(pixels(rootsMap))),
    // The young trunk shares the mature skeleton, so one travel-time map grows both.
    trunkYoung: new RevealLayer(young, taper(trunkTimes, young)),
    canopyYoung: new RevealLayer(pixels(canopyYoung), canopyMap),
    canopyMature: new RevealLayer(pixels(canopyMature), canopyMap),
    // The mature trunk grows along the same map too, so its fine twigs arrive as wood, not as a fading haze.
    trunkMature: new RevealLayer(mature, taper(trunkTimes, mature)),
    rootsSeed,
    trunkSeed,
    canopySeed,
    atlas,
  };
}
