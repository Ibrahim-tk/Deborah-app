import type { Message } from '@shared/types/domain';

/** Message kinds rendered by SafetyMessage (docs/ux/F03-safety.md). */
export const SAFETY_KINDS = new Set<Message['kind']>(['emergency', 'crisis', 'medicationSafety', 'outOfScope', 'escalation']);
