/** EdgeLight motion: the endless drift for one glow segment, startable from any offset (so a released glow
 *  carries on from where it is instead of jumping back to a saved spot). */
export function startDrift(r: SVGRectElement, i: number, duration: number, from?: number): Animation[] {
  const phase = Number(r.dataset.phase);
  const baseLen = Number(r.dataset.len);
  // Each layer/phase drifts at its own pace and breathes in length.
  const lapMs = duration * 1000 * (0.72 + ((i * 0.17) % 0.55));
  const start = from ?? baseLen / 2 - phase;
  const travel = r.animate(
    [
      { strokeDashoffset: start, offset: 0 },
      { strokeDashoffset: start - 0.22, offset: 0.28, easing: 'ease-in-out' },
      { strokeDashoffset: start - 0.48, offset: 0.52, easing: 'ease-out' },
      { strokeDashoffset: start - 0.7, offset: 0.74, easing: 'ease-in' },
      { strokeDashoffset: start - 1, offset: 1 },
    ],
    { duration: lapMs, iterations: Infinity },
  );
  // Fresh start: stagger clocks so they never lock into a shared beat. Resuming: begin exactly where it is.
  if (from === undefined) travel.currentTime = (i * lapMs * 0.31) % lapMs;

  const breathe = r.animate(
    [
      { strokeDasharray: `${baseLen * 0.7} ${1 - baseLen * 0.7}` },
      { strokeDasharray: `${baseLen * 1.35} ${1 - baseLen * 1.35}` },
      { strokeDasharray: `${baseLen * 0.85} ${1 - baseLen * 0.85}` },
      { strokeDasharray: `${baseLen * 1.15} ${1 - baseLen * 1.15}` },
      { strokeDasharray: `${baseLen * 0.7} ${1 - baseLen * 0.7}` },
    ],
    { duration: lapMs * (1.4 + (i % 3) * 0.35), iterations: Infinity, easing: 'ease-in-out', direction: i % 2 === 0 ? 'normal' : 'reverse' },
  );
  if (from === undefined) breathe.currentTime = (i * 900) % (lapMs * 1.4);
  return [travel, breathe];
}

/**
 * Where the bottom edge sits on a rounded rect's path (pathLength 1). SVG starts a rounded rect's path at
 * (rx, 0) — after the top-left curve — and runs clockwise: top straight, top-right curve, right straight,
 * bottom-right curve, bottom straight (right → left), bottom-left curve, left straight, top-left curve.
 * `cover` spans the bottom straight plus both bottom curves, so the band reaches both lower corners evenly.
 */
export function bottomEdge(rect: SVGRectElement | undefined, radius: number) {
  // The rect's own units (getBBox), not screen pixels: the phone preview is drawn scaled, and the corner
  // radius is in the rect's units.
  const box = rect?.getBBox();
  const w = box?.width ?? 0;
  const h = box?.height ?? 0;
  if (!w || !h) return { centre: 0.625, cover: 0.3 };
  const r = Math.min(Number(rect?.getAttribute('rx')) || radius, w / 2, h / 2);
  const top = w - 2 * r;
  const side = h - 2 * r;
  const arc = (Math.PI * r) / 2;
  const p = 2 * top + 2 * side + 4 * arc;
  const centre = (top + arc + side + arc + top / 2) / p;
  return { centre, cover: (top + 2 * arc) / p };
}
