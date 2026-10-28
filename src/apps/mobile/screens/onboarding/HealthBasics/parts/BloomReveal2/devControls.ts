/**
 * Feature flag + sandbox controls for BloomTree2. In memory only.
 * `useNewTree` is off by default: the real flow keeps BloomReveal until the swap-in (Phase 7).
 * The other fields are written by the /internal/tree dev panel and ignored when null.
 */
import { create } from 'zustand';

interface TreeDevState {
  useNewTree: boolean;
  /** 0..1 overrides the screen's progress while set. */
  progressOverride: number | null;
  /** null = follow the OS setting. */
  reduceMotion: boolean | null;
  /** Bumped to fire a gust / pluck petals. */
  gust: number;
  pluck: number;
  fps: number;
  set: (patch: Partial<Omit<TreeDevState, 'set'>>) => void;
}

export const useTreeDev = create<TreeDevState>((set) => ({
  useNewTree: false,
  progressOverride: null,
  reduceMotion: null,
  gust: 0,
  pluck: 0,
  fps: 0,
  set: (patch) => set(patch),
}));
