import { useEffect, useRef, useState, type CSSProperties } from 'react';
import artSrc from './assets/photo-jacaranda-art.png';
import mapSrc from './assets/photo-jacaranda-map.png';

const clamp = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const segment = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Growth, not a reveal (design direction 2026-10-14). The picture never scales; the tree grows inside it:
 *  · wood    a short sprout at 0, then trunk → branch tips over 0–0.5. Grows like a shoot, not a fade:
 *            at the front only the branch's centre line shows, thickening to full width behind it, so
 *            every growing tip is slim and tapered with a crisp edge (centreline from a distance field).
 *  · bloom   0.42 → 1: florets open near the trunk first and move outward along and away from the branches.
 *            Timing = the growth time of the bark each flower hangs from + its distance from that branch
 *            + fine floret-sized organic noise, so flowers
 *            appear as small soft speckles, never patches. Each floret opens over a short window with a
 *            hint of pale-to-colour.
 */
const GROW = { sprout: 0.08, woodEnd: 0.5, woodTip: 0.012, taper: 0.07, taperPx: 14, bloomStart: 0.42, bloomTip: 0.07, floretPx: 5, alongBranch: 0.6, scatter: 0.3, pale: 0.3 };

/**
 * Rapunzel look (design direction 2026-10-14): the whole tree is always there as a faint grayscale ghost;
 * the living tree grows over it with purple-accented bark; blossoms open with a violet glow on their
 * front; branches carry faint glowing purple-pink veins down their centre lines. On the final step a few florets (~10% of the canopy, scattered at random) turn
 * golden and glow, from the trunk outward; everything else stays violet.
 */
const LOOK = {
  ghost: 0.14, // grayscale ghost opacity
  woodAccent: [138, 78, 170], // mauve-purple mixed into the bark: `woodBase` everywhere, more on highlights
  woodBase: 0.38,
  woodHighlight: 0.35,
  // Fairy veins: a luminous purple-pink line down the centre of every branch, with a faint glow.
  vein: [214, 132, 255],
  veinStrength: 0.55,
  veinCore: 0.82, // centre-line threshold: higher = thinner vein (1 = the exact centre)
  veinGlow: 0.2,
  goldShare: 0.1, // share of blossom area that turns golden (≈100 of 1,000 florets)
  glowPurple: [186, 130, 255],
  glowGold: [255, 205, 110],
  goldTint: [255, 214, 140],
  goldStart: 0.9, // progress where the golden glow begins (the last step)
  glowBlur: 5,
  glowStrength: 0.75,
};

/**
 * For every pixel: distance to the nearest bark pixel, and that bark pixel's growth time (how far it is
 * from the root along the branches). Two-pass chamfer that carries the time along with the distance.
 */
function nearestWood(mask: Uint8Array, woodTime: Float32Array, w: number, h: number) {
  const dist = new Float32Array(w * h);
  const time = new Float32Array(w * h);
  for (let k = 0; k < dist.length; k++) {
    dist[k] = mask[k] ? 0 : 1e6;
    time[k] = mask[k] ? woodTime[k] : 1;
  }
  const relax = (k: number, from: number, cost: number) => {
    if (dist[from] + cost < dist[k]) {
      dist[k] = dist[from] + cost;
      time[k] = time[from];
    }
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (x > 0) relax(k, k - 1, 1);
      if (y > 0) relax(k, k - w, 1);
      if (x > 0 && y > 0) relax(k, k - w - 1, 1.4);
      if (x < w - 1 && y > 0) relax(k, k - w + 1, 1.4);
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const k = y * w + x;
      if (x < w - 1) relax(k, k + 1, 1);
      if (y < h - 1) relax(k, k + w, 1);
      if (x < w - 1 && y < h - 1) relax(k, k + w + 1, 1.4);
      if (x > 0 && y < h - 1) relax(k, k + w - 1, 1.4);
    }
  return { dist, time };
}

/** How central each wood pixel is (1 = on the branch's centre line, ~0 = at its bark edge). */
function centreline(mask: Uint8Array, w: number, h: number, radius: number) {
  // Chamfer distance to the nearest non-wood pixel (two passes).
  const d = new Float32Array(w * h);
  for (let k = 0; k < d.length; k++) d[k] = mask[k] ? 1e6 : 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (!d[k]) continue;
      if (x > 0) d[k] = Math.min(d[k], d[k - 1] + 1);
      if (y > 0) d[k] = Math.min(d[k], d[k - w] + 1);
      if (x > 0 && y > 0) d[k] = Math.min(d[k], d[k - w - 1] + 1.4);
      if (x < w - 1 && y > 0) d[k] = Math.min(d[k], d[k - w + 1] + 1.4);
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const k = y * w + x;
      if (!d[k]) continue;
      if (x < w - 1) d[k] = Math.min(d[k], d[k + 1] + 1);
      if (y < h - 1) d[k] = Math.min(d[k], d[k + w] + 1);
      if (x < w - 1 && y < h - 1) d[k] = Math.min(d[k], d[k + w + 1] + 1.4);
      if (x > 0 && y < h - 1) d[k] = Math.min(d[k], d[k + w - 1] + 1.4);
    }
  // Local branch half-width: max distance nearby (separable max filter).
  const tmp = new Float32Array(w * h);
  const peak = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let m = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(w - 1, x + radius); k++) m = Math.max(m, d[y * w + k]);
      tmp[y * w + x] = m;
    }
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      let m = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(h - 1, y + radius); k++) m = Math.max(m, tmp[k * w + x]);
      peak[y * w + x] = m;
    }
  const out = new Float32Array(w * h);
  for (let k = 0; k < out.length; k++) out[k] = mask[k] ? clamp(d[k] / (peak[k] || 1)) : 0;
  return out;
}

/** Smooth value noise (0..1) with ~cell-sized soft blobs: organic floret shapes, no square edges. */
function floretNoise(w: number, h: number, cell: number, start = 7) {
  const gw = Math.ceil(w / cell) + 2;
  const grid = new Float32Array(gw * (Math.ceil(h / cell) + 2));
  let seed = start;
  for (let i = 0; i < grid.length; i++) {
    seed = (seed * 16807) % 2147483647;
    grid[i] = seed / 2147483647;
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const gy = y / cell;
    const y0 = Math.floor(gy);
    const fy = smooth(gy - y0);
    for (let x = 0; x < w; x++) {
      const gx = x / cell;
      const x0 = Math.floor(gx);
      const fx = smooth(gx - x0);
      const top = grid[y0 * gw + x0] + (grid[y0 * gw + x0 + 1] - grid[y0 * gw + x0]) * fx;
      const bottom = grid[(y0 + 1) * gw + x0] + (grid[(y0 + 1) * gw + x0 + 1] - grid[(y0 + 1) * gw + x0]) * fx;
      out[y * w + x] = top + (bottom - top) * fy;
    }
  }
  return out;
}
const load = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load bloom asset: ${src}`));
    image.src = src;
  });
function pixels(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export interface BloomTreeProps {
  /** 0..1; also supports reversing and interrupted step changes. */
  progress?: number;
  /** Easing rate toward `progress` (per second); lower = slower growth / un-growth. */
  rate?: number;
  className?: string;
  style?: CSSProperties;
}

/** Map: R = branch distance, G = blossom timing, B = wood mask, A = subject. */
export default function BloomTree({ progress = 0, rate = 7, className, style }: BloomTreeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(0);
  const speed = useRef(rate);
  speed.current = rate;
  const wake = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);
  const safeProgress = clamp(progress);

  useEffect(() => {
    target.current = safeProgress;
    wake.current();
  }, [safeProgress]);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let current = 0;
    let last = 0;
    let drawn = -1;
    let inView = true;
    let breezeStart = 0;
    let breezeTarget = -1;
    const breezeDuration = 1800;
    let render: ((value: number, sway: number) => void) | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const step = (now: number) => {
      raf = 0;
      if (disposed || document.hidden || !inView || !render) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      current = reduced.matches
        ? target.current
        : current + (target.current - current) * (1 - Math.exp(-speed.current * dt));
      if (Math.abs(current - target.current) < 0.0005) current = target.current;
      // A finite breeze follows each answer; roots stay fixed and the image settles exactly.
      const age = Math.min(1, Math.max(0, (now - breezeStart) / breezeDuration));
      const moving = !reduced.matches && age < 1 && current > 0.32;
      const sway = moving ? Math.sin(Math.PI * age) * Math.sin(2 * Math.PI * age) : 0;
      render(current, sway);
      drawn = current;
      if (current !== target.current || moving) raf = requestAnimationFrame(step);
    };
    const start = () => {
      stop();
      if (disposed || document.hidden || !inView || !render) return;
      last = performance.now();
      if (breezeTarget !== target.current) {
        breezeTarget = target.current;
        breezeStart = last;
      }
      raf = requestAnimationFrame(step);
    };
    wake.current = start;
    const visibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', start);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    if (canvas.current) observer.observe(canvas.current);

    Promise.all([load(artSrc), load(mapSrc)])
      .then(([art, map]) => {
        if (disposed || !canvas.current) return;
        if (art.naturalWidth !== map.naturalWidth || art.naturalHeight !== map.naturalHeight) {
          throw new Error('Bloom art and growth map dimensions differ');
        }
        const element = canvas.current;
        element.width = art.naturalWidth;
        element.height = art.naturalHeight;
        const context = element.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        const buffer = document.createElement('canvas');
        buffer.width = art.naturalWidth;
        buffer.height = art.naturalHeight;
        const bufferContext = buffer.getContext('2d');
        if (!bufferContext) throw new Error('Canvas buffer is unavailable');
        const makeLayer = () => {
          const c = document.createElement('canvas');
          c.width = art.naturalWidth;
          c.height = art.naturalHeight;
          const x = c.getContext('2d');
          if (!x) throw new Error('Canvas buffer is unavailable');
          return [c, x] as const;
        };
        const [ghost, ghostContext] = makeLayer();
        const [live, liveContext] = makeLayer();
        const [glowLayer, glowContext] = makeLayer();
        const colors = pixels(art);
        const timings = pixels(map).data;
        const output = new ImageData(
          new Uint8ClampedArray(colors.data),
          colors.width,
          colors.height,
        );
        const active: number[] = [];
        for (let i = 0; i < colors.data.length; i += 4) {
          if (colors.data[i + 3]) active.push(i);
        }
        // Blossom timing (design direction 2026-10-14): flowers follow the tree, not the picture. Each one
        // inherits the growth time of the bark it hangs from (near the trunk → early, outer branches → late),
        // then opens outward from that branch by its distance, + floret noise; normalised over the canopy.
        const w = colors.width;
        const h = colors.height;
        const woodMask = new Uint8Array(w * h);
        const woodTime = new Float32Array(w * h);
        for (const i of active) if (timings[i + 2] > 200) { woodMask[i / 4] = 1; woodTime[i / 4] = timings[i] / 255; }
        const attach = nearestWood(woodMask, woodTime, w, h);
        let reach = 1;
        for (const i of active) if (!woodMask[i / 4]) reach = Math.max(reach, Math.min(attach.dist[i / 4], 1e5));
        const noise = floretNoise(w, h, GROW.floretPx);
        const bloomTime = new Float32Array(w * h);
        let lo = Infinity;
        let hi = -Infinity;
        for (const i of active) {
          const k = i / 4;
          const tree = attach.time[k] * GROW.alongBranch + Math.min(1, attach.dist[k] / reach) * (1 - GROW.alongBranch);
          const t = tree * (1 - GROW.scatter) + noise[k] * GROW.scatter;
          bloomTime[k] = t;
          if (timings[i + 2] <= 200) {
            lo = Math.min(lo, t);
            hi = Math.max(hi, t);
          }
        }
        for (const i of active) bloomTime[i / 4] = clamp((bloomTime[i / 4] - lo) / (hi - lo || 1));
        const centre = centreline(woodMask, w, h, GROW.taperPx);
        // The ghost: the full bloomed tree in grayscale, always present behind the living tree.
        const ghostData = new ImageData(new Uint8ClampedArray(colors.data), w, h);
        for (const i of active) {
          const l = 0.3 * colors.data[i] + 0.59 * colors.data[i + 1] + 0.11 * colors.data[i + 2];
          ghostData.data[i] = ghostData.data[i + 1] = ghostData.data[i + 2] = l;
          ghostData.data[i + 3] = colors.data[i + 3] * LOOK.ghost;
        }
        ghostContext.putImageData(ghostData, 0, 0);
        const glow = new ImageData(w, h);
        // Golden florets: the top `goldShare` of a second, independent floret noise over the blossoms.
        // A fresh random seed each time the tree loads, so the golden florets land somewhere new.
        const goldNoise = floretNoise(w, h, GROW.floretPx * 1.3, 1 + Math.floor(Math.random() * 2147483645));
        const canopyValues: number[] = [];
        for (const i of active) if (timings[i + 2] <= 200) canopyValues.push(goldNoise[i / 4]);
        canopyValues.sort((a, b) => a - b);
        const goldCut = canopyValues[Math.floor(canopyValues.length * (1 - LOOK.goldShare))] ?? 1;
        const golden = new Float32Array(w * h);
        for (const i of active) {
          if (timings[i + 2] <= 200) golden[i / 4] = smooth(clamp((goldNoise[i / 4] - goldCut) / 0.02));
        }
        const mix = (a: number, b: number, t: number) => a + (b - a) * t;
        render = (p, sway) => {
          if (p !== drawn) {
            const wood = GROW.sprout + (1 - GROW.sprout + GROW.taper + GROW.woodTip) * segment(p, 0, GROW.woodEnd);
            const bloom = (1 + GROW.bloomTip) * smooth(segment(p, GROW.bloomStart, 1));
            const goldFront = 1.25 * smooth(segment(p, LOOK.goldStart, 1));
            for (const i of active) {
              const isWood = timings[i + 2] > 200;
              const time = isWood ? timings[i] / 255 : bloomTime[i / 4];
              const alpha = isWood
                ? // Behind the front by more than the taper: full width. Near it: only the centre line.
                  smooth(clamp((wood - time - GROW.taper * (1 - centre[i / 4]) ** 1.5) / GROW.woodTip))
                : smooth(clamp((bloom - time) / GROW.bloomTip));
              // Golden florets only (never bark), lighting up from the trunk outward on the last step.
              const gold = isWood ? 0 : golden[i / 4] * smooth(clamp((goldFront - time) / 0.2)) * alpha;
              let red = colors.data[i];
              let green = colors.data[i + 1];
              let blue = colors.data[i + 2];
              if (isWood) {
                // Brown bark with purple accents on its highlights.
                const lum = (red + green + blue) / 765;
                const accent = LOOK.woodBase + LOOK.woodHighlight * smooth(clamp((lum - 0.2) / 0.3));
                red = mix(red, LOOK.woodAccent[0], accent);
                green = mix(green, LOOK.woodAccent[1], accent);
                blue = mix(blue, LOOK.woodAccent[2], accent);
                // Glowing veins along each branch's centre line (soft falloff to the bark edge).
                const vein = smooth(clamp((centre[i / 4] - LOOK.veinCore) / (1 - LOOK.veinCore))) * LOOK.veinStrength;
                red = mix(red, LOOK.vein[0], vein);
                green = mix(green, LOOK.vein[1], vein);
                blue = mix(blue, LOOK.vein[2], vein);
              } else {
                // A hint of pale as each floret opens, settling to the photo's colour.
                const pale = (1 - alpha) * GROW.pale;
                red = mix(red, 255, pale);
                green = mix(green, 240, pale);
                blue = mix(blue, 250, pale);
              }
              output.data[i] = mix(red, LOOK.goldTint[0], gold * 0.6);
              output.data[i + 1] = mix(green, LOOK.goldTint[1], gold * 0.6);
              output.data[i + 2] = mix(blue, LOOK.goldTint[2], gold * 0.6);
              output.data[i + 3] = Math.round(colors.data[i + 3] * alpha);
              // Glow (blossoms only): bright on the opening front, a faint violet aura once settled, gold on
              // the few golden florets at the end. Bark never glows.
              const front = 4 * alpha * (1 - alpha);
              const purple = isWood
                ? smooth(clamp((centre[i / 4] - LOOK.veinCore) / (1 - LOOK.veinCore))) * LOOK.veinGlow * alpha // only the veins
                : Math.min(1, front * 0.9 + alpha * 0.16);
              const tone = isWood ? LOOK.vein : LOOK.glowPurple;
              glow.data[i] = mix(tone[0], LOOK.glowGold[0], gold);
              glow.data[i + 1] = mix(tone[1], LOOK.glowGold[1], gold);
              glow.data[i + 2] = mix(tone[2], LOOK.glowGold[2], gold);
              glow.data[i + 3] = colors.data[i + 3] * Math.min(1, purple * (1 - gold) + gold * 0.85);
            }
            liveContext.putImageData(output, 0, 0);
            glowContext.putImageData(glow, 0, 0);
            // Compose: ghost → living tree → blurred additive glow (a wide halo + a tight sheen).
            bufferContext.clearRect(0, 0, buffer.width, buffer.height);
            bufferContext.drawImage(ghost, 0, 0);
            bufferContext.drawImage(live, 0, 0);
            bufferContext.globalCompositeOperation = 'lighter';
            bufferContext.globalAlpha = LOOK.glowStrength;
            bufferContext.filter = `blur(${LOOK.glowBlur}px)`;
            bufferContext.drawImage(glowLayer, 0, 0);
            bufferContext.globalAlpha = LOOK.glowStrength * 0.5;
            bufferContext.filter = 'blur(2px)';
            bufferContext.drawImage(glowLayer, 0, 0);
            bufferContext.filter = 'none';
            bufferContext.globalAlpha = 1;
            bufferContext.globalCompositeOperation = 'source-over';
          }
          context.clearRect(0, 0, element.width, element.height);
          if (sway === 0) {
            context.drawImage(buffer, 0, 0);
          } else {
            // Raster displacement: upper canopy moves less than 2 CSS pixels, lower trunk stays fixed.
            // Use adjacent source bands; no vector tracing, redrawing, or repeated pixel processing.
            const band = 4;
            for (let y = 0; y < element.height; y += band) {
              const height = Math.min(band, element.height - y);
              const canopyWeight = clamp((0.76 - y / element.height) / 0.62);
              const shift = sway * 5 * canopyWeight * canopyWeight;
              context.drawImage(
                buffer,
                0,
                y,
                element.width,
                height,
                shift,
                y,
                element.width,
                height,
              );
            }
          }
        };
        start();
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      stop();
      wake.current = () => {};
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', start);
    };
  }, []);

  const label = `Blooming tree, ${Math.round(safeProgress * 100)}% of the growth sequence`;
  const imageStyle: CSSProperties = { width: '100%', height: 'auto', display: 'block', ...style };
  return failed ? (
    <img
      src={artSrc}
      alt="Photographic purple jacaranda tree"
      className={className}
      style={imageStyle}
    />
  ) : (
    <canvas ref={canvas} role="img" aria-label={label} className={className} style={imageStyle} />
  );
}
