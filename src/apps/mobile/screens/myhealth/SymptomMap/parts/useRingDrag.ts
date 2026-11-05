/**
 * Direct angular drag on the overview ring, then a short frictional glide. No idle spinning.
 * Returns the rotation (degrees), pointer handlers for the map, and `consumeClick` so a drag
 * that ends over a disc doesn't also select it.
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { CENTER_Y } from './geometry';

interface Drag { id: number; startX: number; startY: number; angle: number; time: number; velocity: number; moved: boolean }

export function useRingDrag(mapRef: RefObject<HTMLElement | null>, enabled: boolean, reduced: boolean) {
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const suppress = useRef(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setDragging(false);
  }, []);
  useEffect(() => stop, [stop]);

  const angleOf = (e: PointerEvent) => {
    const r = mapRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - r.top - CENTER_Y, e.clientX - r.left - r.width / 2) * 180) / Math.PI;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!enabled || e.button !== 0) return;
    stop();
    drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, angle: angleOf(e), time: performance.now(), velocity: 0, moved: false };
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 7) return;
    if (!d.moved) {
      d.moved = true;
      mapRef.current?.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    const now = performance.now();
    const a = angleOf(e);
    let delta = a - d.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.velocity = d.velocity * 0.45 + (delta / Math.max(8, now - d.time)) * 0.55;
    d.angle = a;
    d.time = now;
    setRotation((r) => r + delta);
  };

  const onPointerUp = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    suppress.current = true;
    setTimeout(() => { suppress.current = false; }, 100);
    if (reduced) { setDragging(false); return; }
    let velocity = Math.max(-0.32, Math.min(0.32, d.velocity));
    let previous = performance.now();
    const glide = (now: number) => {
      const dt = Math.min(32, now - previous);
      previous = now;
      setRotation((r) => r + velocity * dt);
      velocity *= Math.pow(0.93, dt / 16);
      if (Math.abs(velocity) > 0.003) frame.current = requestAnimationFrame(glide);
      else stop();
    };
    frame.current = requestAnimationFrame(glide);
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (drag.current?.id === e.pointerId) { drag.current = null; setDragging(false); }
  };

  const consumeClick = () => suppress.current;
  const rotateBy = (deg: number) => { stop(); setRotation((r) => r + deg); };

  return { rotation, dragging, stop, rotateBy, consumeClick, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
}
