/**
 * Streaming (docs/07-ai-simulation.md §2): 2–6 character chunks at a characters-per-second rate
 * with ±20 % jitter, so text feels token-like. Pure: the bridge owns the timers.
 */
export const CPS = { text: 45, section: 70 } as const;

export interface Chunk {
  text: string;
  ms: number;
}

export function chunkText(text: string, cps: number, rng: () => number = Math.random): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  while (i < text.length) {
    const size = 2 + Math.floor(rng() * 5);
    const piece = text.slice(i, i + size);
    const jitter = 0.8 + rng() * 0.4;
    chunks.push({ text: piece, ms: (piece.length / cps) * 1000 * jitter });
    i += size;
  }
  return chunks;
}

/** Random delay within a range, e.g. thinking time. */
export function between(min: number, max: number, rng: () => number = Math.random): number {
  return Math.round(min + rng() * (max - min));
}
