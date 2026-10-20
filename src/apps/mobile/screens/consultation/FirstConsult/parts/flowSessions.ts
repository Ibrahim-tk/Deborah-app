/**
 * Where a scripted chat stopped, kept for the session so Home's "Continue your chat" resumes it exactly
 * (design 2026-10-20). Kept with the sign-up snapshot, so it survives a reload until Reset.
 */
import { readFlow, writeFlow } from '@shared/store';
import type { FlowValue } from '@shared/engine';
import type { Entry } from './useFlowPlayer';

export interface FlowSession { entries: Entry[]; vars: Record<string, FlowValue>; labels: Record<string, string>; extraPrep: string[] }

export const getFlowSession = (key: string) => readFlow<FlowSession>(key);
export const saveFlowSession = (key: string, s: FlowSession) => writeFlow(key, s);
export const hasFlowSession = (key: string) => (readFlow<FlowSession>(key)?.entries.length ?? 0) > 0;
