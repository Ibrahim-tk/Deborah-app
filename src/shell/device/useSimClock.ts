/**
 * Simulated device clock: follows session.simulatedNow (docs/05-state-and-scenarios.md §2) so the
 * status bar and lock screen show the scenario's time, e.g. 9:41 in S07.
 */
import { useEffect, useState } from 'react';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';

export const formatTime = (d: Date) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
export const formatLockDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/** Returns `format(now)`, re-rendering only when the formatted value changes. */
export function useSimClock(format: (d: Date) => string = formatTime): string {
  const simulatedNow = useAppStore((s) => s.simulatedNow);
  const clockAnchor = useAppStore((s) => s.clockAnchor);
  const [value, setValue] = useState(() => format(nowFrom({ simulatedNow, clockAnchor })));
  useEffect(() => {
    const tick = () => setValue(format(nowFrom({ simulatedNow, clockAnchor })));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [simulatedNow, clockAnchor, format]);
  return value;
}
