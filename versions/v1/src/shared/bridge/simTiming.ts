/**
 * Simulated waits for things that "talk to a server" (docs/07-ai-simulation.md): store sheet,
 * sign-in, lab reading. Follows the shell's Network speed toggle (Slow ×3, Instant 0).
 */
import { useAppStore } from '../store';

export function simMs(ms: number): number {
  return ms * { normal: 1, slow: 3, instant: 0 }[useAppStore.getState().dev.speed];
}

/** A random wait between min and max, scaled by network speed. */
export function simBetween(min: number, max: number): number {
  return simMs(min + Math.random() * (max - min));
}
