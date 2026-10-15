/**
 * @pattern ThinkingIndicator — ProgressStatus with Deborah-voice steps (no typing dots)
 * @usedBy  M-2.1
 * @spec    DESIGN.md › Messages › Progress status
 * @xref    web: apps/web/patterns/chat/ThinkingIndicator — not built
 */
import { ProgressStatus } from '@flow-v1/apps/mobile/ui';

export function ThinkingIndicator({ label }: { label: string }) {
  return <ProgressStatus label={label} />;
}
