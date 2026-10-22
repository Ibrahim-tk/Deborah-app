/** Deborah's "thinking" as her own inputs, one after another (not a generic "Analyzing…"). */
import { useEffect, useState } from 'react';
import { ThinkingIndicator } from '@web/patterns/chat';

export function ThinkingSteps({ steps, durationMs }: { steps: string[]; durationMs: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), durationMs / steps.length);
    return () => window.clearInterval(id);
  }, [steps.length, durationMs]);
  return <ThinkingIndicator label={`Looking at ${steps[i].charAt(0).toLowerCase()}${steps[i].slice(1)}…`} />;
}
