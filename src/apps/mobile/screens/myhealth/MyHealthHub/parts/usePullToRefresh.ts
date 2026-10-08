/**
 * Pull-to-refresh, visual only (F07 M-7.2: 600 ms). Nothing reloads — the data is local.
 * ASSUMPTION: simplified gesture — drag down with pointer/touch while scrolled to the top, or
 * scroll up past the top with a wheel/trackpad. No rubber-banding of the content itself.
 */
import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { simMs } from '@mobile/hooks/simTiming';

const THRESHOLD = 56;
const MAX_PULL = 80;
const REFRESH_MS = 600;

export function usePullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    timer.current = window.setTimeout(() => setRefreshing(false), simMs(REFRESH_MS));
  };

  const end = () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD) refresh();
    setPull(0);
  };

  const bind = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop <= 0 && !refreshing) startY.current = e.clientY;
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (startY.current === null) return;
      const dy = e.clientY - startY.current;
      setPull(dy > 0 ? Math.min(MAX_PULL, dy * 0.5) : 0);
    },
    onPointerUp: end,
    onPointerCancel: end,
    onPointerLeave: end,
    onWheel: (e: WheelEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop <= 0 && e.deltaY < -40) refresh();
    },
  };

  return { bind, pull, refreshing };
}
