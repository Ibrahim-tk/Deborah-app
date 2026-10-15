/** Engine bridge (non-visual): runs engine plans against the store. Used by both apps' hooks. */
export { runPlan, stopPlan, useRunnerStore } from './conversationRunner';
export type { RunHandlers } from './conversationRunner';
export { contextFor, ensureConversation, runInput } from './context';
export { simBetween, simMs } from './simTiming';
