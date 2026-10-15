import { useEffect, useRef } from "react";
import artSrc from "./assets/jacaranda-art.webp";
import mapSrc from "./assets/jacaranda-map.png";

/**
 * BloomReveal — trunk grows first, then the canopy blooms.
 *
 * Usage:  <BloomReveal progress={currentStep / totalSteps} />
 * progress: 0..1. The component eases toward each new value on its own (~1s),
 * so just update the prop when the user taps Next/Back.
 *
 * Map image channels:  R = trunk/branch reveal time, G = canopy/ground reveal time,
 * B = region (255 trunk, 128 ground, 0 canopy), A = painted pixel.
 * The art has a transparent background, so it sits on any screen colour or gradient.
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const pixels = (img) => {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height).data;
};

export default function BloomReveal({ progress = 0, className, style }) {
  const canvasRef = useRef(null);
  const state = useRef({ ready: false, cur: 0, target: 0, drawn: -1, raf: 0 });

  // Load assets once
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadImage(artSrc), loadImage(mapSrc)]).then(([art, map]) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      canvas.width = art.width;
      canvas.height = art.height;
      const ctx = canvas.getContext("2d");
      Object.assign(state.current, {
        ready: true,
        ctx,
        col: pixels(art),
        map: pixels(map),
        out: ctx.createImageData(art.width, art.height),
      });
      tick();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(state.current.raf);
    };
  }, []);

  // React to step changes
  useEffect(() => {
    state.current.target = clamp(progress);
    if (state.current.ready) tick();
  }, [progress]);

  function draw(p) {
    const { ctx, col, map, out } = state.current;
    const d = out.data;
    const wood = seg(p, 0, 0.45) * 1.03; // trunk first, at a steady pace
    const ground = seg(p, 0.82, 1) * 1.1; // fallen flowers last, after the bloom
    const canopy = ease(seg(p, 0.38, 0.88)) * 1.05; // bloom before the flowers fall
    for (let i = 0; i < d.length; i += 4) {
      let a = 0;
      if (map[i + 3]) {
        const region = map[i + 2];
        if (region > 200) a = clamp((wood - map[i] / 255) / 0.012);
        // Ground: the grass (green-dominant pixels) is there from the start; the fallen flowers come last.
        else if (region > 100) a = col[i + 1] > col[i + 2] + 8 ? 1 : clamp((ground - map[i + 1] / 255) / 0.05);
        else a = clamp((canopy - map[i + 1] / 255) / 0.03);
      }
      d[i] = col[i];
      d[i + 1] = col[i + 1];
      d[i + 2] = col[i + 2];
      d[i + 3] = col[i + 3] * a; // transparent background
    }
    ctx.clearRect(0, 0, out.width, out.height);
    ctx.putImageData(out, 0, 0);
  }

  function tick() {
    const s = state.current;
    cancelAnimationFrame(s.raf);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      s.cur = reduce ? s.target : s.cur + (s.target - s.cur) * (1 - Math.exp(-dt * 3));
      if (Math.abs(s.target - s.cur) < 5e-4) s.cur = s.target;
      if (s.cur !== s.drawn) {
        draw(s.cur);
        s.drawn = s.cur;
      }
      if (s.cur !== s.target) s.raf = requestAnimationFrame(step); // stops when settled
    };
    s.raf = requestAnimationFrame(step);
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Jacaranda tree growing as your profile fills in"
      className={className}
      style={{ width: "100%", height: "auto", display: "block", ...style }}
    />
  );
}
