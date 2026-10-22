/** Plain-text rendering of an answer for copy, share and Visit Notes. */
import type { Answer } from '@shared/types/domain';

export function answerToText(answer: Answer): string {
  const parts = answer.sections.map((s, i) => {
    const bullets = (s.bullets ?? []).map((b) => `• ${b}`).join('\n');
    return [`${i + 1}. ${s.title}`, s.body, bullets].filter(Boolean).join('\n');
  });
  return [...parts, answer.closingLine].join('\n\n');
}
