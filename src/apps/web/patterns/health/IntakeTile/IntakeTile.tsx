/**
 * @pattern IntakeTile — the in-chat Health intake tile: ActionTile with a percentage progress ring (as on Home, design 2026-10-21).
 * @usedBy  M-2.12 First conversation · M-2.1 Conversation
 *
 * Callers pass the same healthProfileCompletion fraction Home and My Health use.
 */
import { ActionTile } from '@web/ui';

export function IntakeTile({
  progress,
  onOpen,
  className,
}: {
  /** 0–1, same score as Home’s Complete your intake card. */
  progress: number;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <ActionTile
      className={className}
      icon="health"
      title="Finish your health intake"
      meta="Helps the Oracle personalise its guidance"
      progress={progress}
      progressLabel="Health intake progress"
      showPercent
      onClick={onOpen}
    />
  );
}
