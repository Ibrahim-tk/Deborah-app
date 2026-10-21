import { useEffect, useState } from 'react';

/** Matches `.stepLeaving` in HealthBasics.module.css. */
const EXIT_MS = 220;

/**
 * Keeps the outgoing question on screen while it fades out, then swaps in the new one (which fades in).
 * Returns the item to render and whether it is currently leaving.
 */
export function useStepTransition<T extends { key: string }>(current: T) {
  const [shown, setShown] = useState(current);
  const leaving = shown.key !== current.key;

  useEffect(() => {
    if (!leaving) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => setShown(current), reduced ? 0 : EXIT_MS);
    return () => window.clearTimeout(t);
  }, [leaving, current]);

  // Same question: always render the latest object (titles can depend on answers).
  return { shown: leaving ? shown : current, leaving };
}
