/**
 * @ui EdgeLight — a soft violet glow that drifts behind a rounded card (never on the rim).
 *     Length and pace vary so the motion feels organic rather than metronomic.
 *     Place as a sibling behind the card fill (or inside a host that is not stacking-context
 *     locked over the bloom). Still under reduced motion.
 *     OPEN: DESIGN.md bans shimmer animations; kept on the designer's request (2026-10-12).
 */
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { cx } from '@shared/utils';
import { bottomEdge, startDrift } from './drift';
import styles from './EdgeLight.module.css';

export interface EdgeLightProps {
  /** Corner radius of the card, px. */
  radius?: number;
  /** Base seconds per lap (actual pace drifts around this). */
  duration?: number;
  /** Freeze the glow where it is (it stays visible). */
  paused?: boolean;
  /** Each glow runs from wherever it is to the bottom centre and gathers there (composer in use). Releasing
   *  sends it back to where it was and the drift resumes. */
  gather?: boolean;
  className?: string;
}

const VIOLET = '#8b5cf6';
/** Soft bloom layers — lengths breathe in the animation. */
const LAYERS = [
  { baseLen: 0.16, color: VIOLET, opacity: 0.32, width: 9 },
  { baseLen: 0.1, color: VIOLET, opacity: 0.22, width: 7 },
  { baseLen: 0.06, color: VIOLET, opacity: 0.14, width: 5 },
];
/** Uneven phases so the two glows never sit opposite like clock hands. */
const PHASES = [0.04, 0.41];

export function EdgeLight({ radius = 24, duration = 16, paused = false, gather = false, className }: EdgeLightProps) {
  const id = useId().replace(/:/g, '');
  const root = useRef<SVGSVGElement>(null);
  /** Drift animations per segment (travel + breathe), and the in-between transitions. */
  const drifts = useRef(new Map<SVGRectElement, Animation[]>());
  const moves = useRef<Animation[]>([]);
  const live = useRef({ paused, gather, duration });
  live.current = { paused, gather, duration };
  const rects = () => [...(root.current?.querySelectorAll<SVGRectElement>(`rect[data-edge="${id}"]`) ?? [])];

  // Start the endless drift (still under reduced motion).
  useEffect(() => {
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('reduced-motion');
    if (reduced || !root.current) return;
    const map = drifts.current;
    rects().forEach((r, i) => map.set(r, startDrift(r, i, duration)));
    if (live.current.paused) map.forEach((as) => as.forEach((a) => a.pause()));
    return () => {
      map.forEach((as) => as.forEach((a) => a.cancel()));
      map.clear();
      moves.current.forEach((a) => a.cancel());
      moves.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (re)start only when the identity or pace changes
  }, [id, duration]);

  // Pause / resume in place.
  useEffect(() => {
    if (gather) return;
    drifts.current.forEach((as) => as.forEach((a) => (paused ? a.pause() : a.play())));
  }, [paused, gather]);

  // Gather: every glow runs the short way round to the bottom and spreads along the whole bottom edge.
  // Release: from that spot it narrows back to its normal length while it starts moving, and the drift
  // carries on from there — one continuous motion, never a jump back to an earlier position.
  const first = useRef(true);
  useEffect(() => {
    const svg = root.current;
    if (first.current) {
      first.current = false;
      if (!gather) return;
    }
    if (!svg || !drifts.current.size) return;
    const { centre, cover } = bottomEdge(rects()[0], radius);
    const prev = moves.current;
    moves.current = [];
    rects().forEach((r, i) => {
      const cs = getComputedStyle(r);
      const at = parseFloat(cs.strokeDashoffset) || 0;
      const dash = cs.strokeDasharray;
      drifts.current.get(r)?.forEach((a) => a.cancel());
      if (gather) {
        let to = cover / 2 - centre;
        to += Math.round(at - to);
        moves.current.push(
          r.animate(
            [{ strokeDashoffset: at, strokeDasharray: dash }, { strokeDashoffset: to, strokeDasharray: `${cover} ${1 - cover}` }],
            { duration: 700, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' },
          ),
        );
      } else {
        const len = Number(r.dataset.len) * 0.7; // the drift's own starting length
        let end = len / 2 - centre - 0.04; // a little way along the edge, already moving
        end += Math.round(at - end); // same lap as now: never the long way round
        const out = r.animate(
          [{ strokeDashoffset: at, strokeDasharray: dash }, { strokeDashoffset: end, strokeDasharray: `${len} ${1 - len}` }],
          { duration: 700, easing: 'cubic-bezier(0.45, 0, 0.9, 0.6)', fill: 'forwards' },
        );
        moves.current.push(out);
        out.onfinish = () => {
          if (live.current.gather) return;
          const next = startDrift(r, i, live.current.duration, end);
          if (live.current.paused) next.forEach((a) => a.pause());
          drifts.current.set(r, next);
          out.cancel();
        };
      }
    });
    prev.forEach((a) => a.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on gather changes only
  }, [gather]);

  const seg = (phase: number) => (s: (typeof LAYERS)[number], i: number) => (
    <rect
      key={`${phase}-${i}`}
      x="0"
      y="0"
      width="100%"
      height="100%"
      rx={radius}
      pathLength={1}
      fill="none"
      stroke={s.color}
      strokeLinecap="round"
      strokeOpacity={s.opacity}
      strokeWidth={s.width}
      data-edge={id}
      data-len={s.baseLen}
      data-phase={phase}
      style={{ strokeDasharray: `${s.baseLen} ${1 - s.baseLen}`, strokeDashoffset: s.baseLen / 2 - phase } as CSSProperties}
    />
  );

  return (
    <svg ref={root} className={cx(styles.layer, styles.bloom, className)} aria-hidden="true">
      <defs>
        <filter id={`b${id}`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g filter={`url(#b${id})`}>{PHASES.map((p) => LAYERS.map(seg(p)))}</g>
    </svg>
  );
}
