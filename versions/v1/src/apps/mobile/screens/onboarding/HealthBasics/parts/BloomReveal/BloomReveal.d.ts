import type { CSSProperties, ReactElement } from 'react';

/** Types for the provided BloomReveal.jsx (kept as delivered; logic untouched). */
export interface BloomRevealProps {
  /** 0..1 — the component eases toward each new value itself. */
  progress?: number;
  className?: string;
  style?: CSSProperties;
}
export default function BloomReveal(props: BloomRevealProps): ReactElement;
