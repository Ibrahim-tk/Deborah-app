/** Timed progress for the uploading (1–1.5 s) and reading (1.5–2.5 s) phases. No network. */
import { useEffect, useRef, useState } from 'react';
import { simBetween } from '@web/hooks/simTiming';

type Phase = 'uploading' | 'reading';

const RANGE: Record<Phase, [number, number]> = { uploading: [1000, 1500], reading: [1500, 2500] };

export const REJECT_COPY = {
  format: () => 'We accept PDF, JPG, PNG or TXT files.',
  size: (mb?: number) => `This file is ${mb ?? 'over 20'} MB. The limit is 20 MB.`,
  empty: () => 'This file looks empty. Try another one.',
} as const;

export function useSimulatedUpload(phase: Phase | null, onDone: (phase: Phase) => void) {
  // Progress is tagged with its phase, so a new phase reads 0 without a reset inside the effect.
  const [progress, setProgress] = useState<{ phase: Phase | null; value: number }>({ phase: null, value: 0 });
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    if (!phase) return;
    const total = simBetween(...RANGE[phase]);
    const started = Date.now();
    const tick = window.setInterval(() => setProgress({ phase, value: Math.min(1, (Date.now() - started) / Math.max(total, 1)) }), 80);
    const end = window.setTimeout(() => done.current(phase), total);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(end);
    };
  }, [phase]);

  return progress.phase === phase ? progress.value : 0;
}
