/**
 * The wheel's motion: `rotation` (deg), `zoom` (0 → 1) and `coreZ` (core view) motion values.
 * Overview: angular drag + frictional glide. Focus: horizontal drag rolls the arc, release snaps
 * to the nearest area (a flick travels up to two). `selected` follows whichever disc is at the top.
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from '@mobile/ui';
import { CENTER_Y, SLOT, rotationFor, snapTarget, topIndex } from './geometry';

const ZOOM_SPRING = { type: 'spring', stiffness: 260, damping: 32 } as const;
const ROLL_SPRING = { type: 'spring', stiffness: 300, damping: 34 } as const;

interface Drag { id: number; x: number; y: number; angle: number; time: number; velocity: number; moved: boolean; from: number }

export function useWheel(stage: RefObject<HTMLElement | null>, reduced: boolean, initial?: number) {
  const rotation = useMotionValue(initial === undefined ? 0 : rotationFor(initial, 0));
  const zoom = useMotionValue(initial === undefined ? 0 : 1);
  const coreZ = useMotionValue(0);
  const [selected, setSelected] = useState(initial ?? 0);
  const [mode, setMode] = useState<'overview' | 'area' | 'core'>(initial === undefined ? 'overview' : 'area');
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const glide = useRef(0);
  const suppress = useRef(false);

  const to = useCallback((mv: typeof zoom, value: number, spring: typeof ZOOM_SPRING | typeof ROLL_SPRING) => {
    if (reduced) mv.set(value);
    else animate(mv, value, spring);
  }, [reduced]);

  const stopGlide = () => { cancelAnimationFrame(glide.current); glide.current = 0; };
  useEffect(() => stopGlide, []);

  // Selection follows the wheel while zoomed in.
  useMotionValueEvent(rotation, 'change', (r) => {
    if (mode !== 'area') return;
    const i = topIndex(r);
    setSelected((s) => (s === i ? s : i));
  });

  const focus = (i: number) => {
    stopGlide();
    setSelected(i);
    setMode('area');
    to(rotation, rotationFor(i, rotation.get()), ROLL_SPRING);
    to(zoom, 1, ZOOM_SPRING);
    to(coreZ, 0, ZOOM_SPRING);
  };
  const focusCore = () => {
    stopGlide();
    setMode('core');
    // Turn the wheel half a step so no area sits where the core is; two settle on each side.
    const r = rotation.get();
    to(rotation, Math.round((r - SLOT / 2) / SLOT) * SLOT + SLOT / 2, ROLL_SPRING);
    to(zoom, 1, ZOOM_SPRING);
    to(coreZ, 1, ZOOM_SPRING);
  };
  const unfocus = () => {
    setMode('overview');
    to(zoom, 0, ZOOM_SPRING);
    to(coreZ, 0, ZOOM_SPRING);
  };

  const angleAt = (e: PointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - r.top - CENTER_Y, e.clientX - r.left - r.width / 2) * 180) / Math.PI;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || mode === 'core') return;
    stopGlide();
    rotation.stop();
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, angle: angleAt(e), time: performance.now(), velocity: 0, moved: false, from: rotation.get() };
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.hypot(dx, e.clientY - d.y) < 7) return;
      // Zoomed in, only a sideways drag rolls the wheel; vertical stays page scroll.
      if (mode === 'area' && Math.abs(dx) < Math.abs(e.clientY - d.y)) { drag.current = null; return; }
      d.moved = true;
      stage.current?.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    const now = performance.now();
    let delta: number;
    if (mode === 'area') {
      const width = stage.current?.clientWidth ?? 353;
      // One slot of roll per ~⅓ of the screen (matches the zoomed carousel spacing).
      delta = ((e.clientX - d.x) / (width * 0.33)) * SLOT;
      d.x = e.clientX;
    } else {
      const a = angleAt(e);
      delta = a - d.angle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      d.angle = a;
    }
    d.velocity = d.velocity * 0.45 + (delta / Math.max(8, now - d.time)) * 0.55;
    d.time = now;
    rotation.set(rotation.get() + delta);
  };

  const onPointerUp = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    setDragging(false);
    suppress.current = true;
    setTimeout(() => { suppress.current = false; }, 100);
    if (mode === 'area') {
      const from = Math.round(d.from / SLOT) * SLOT;
      to(rotation, snapTarget(rotation.get(), d.velocity, from), ROLL_SPRING);
      return;
    }
    if (reduced) return;
    let velocity = Math.max(-0.32, Math.min(0.32, d.velocity));
    let previous = performance.now();
    const step = (now: number) => {
      const dt = Math.min(32, now - previous);
      previous = now;
      rotation.set(rotation.get() + velocity * dt);
      velocity *= Math.pow(0.93, dt / 16);
      glide.current = Math.abs(velocity) > 0.003 ? requestAnimationFrame(step) : 0;
    };
    glide.current = requestAnimationFrame(step);
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (drag.current?.id !== e.pointerId) return;
    const moved = drag.current.moved;
    drag.current = null;
    setDragging(false);
    if (moved && mode === 'area') to(rotation, Math.round(rotation.get() / SLOT) * SLOT, ROLL_SPRING);
  };

  /** Step one area (arrow keys, neighbour taps) — or rotate the ring a slot in the overview. */
  const step = (dir: 1 | -1) => {
    stopGlide();
    const target = Math.round(rotation.get() / SLOT) * SLOT - dir * SLOT;
    to(rotation, target, ROLL_SPRING);
  };

  return {
    rotation, zoom, coreZ, selected, mode, dragging,
    focus, focusCore, unfocus, step,
    consumeClick: () => suppress.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
