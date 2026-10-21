/**
 * @pattern IntakeTile — the in-chat Health intake tile: ActionTile with a percentage progress ring (as on Home, design 2026-10-21).
 * @usedBy  M-2.12 First consultation · M-2.1 Conversation
 */
import { intakeProgress } from '@shared/engine/intake';
import { useAppStore } from '@shared/store';
import { ActionTile } from '@mobile/ui';

export function IntakeTile({ onOpen, className }: { onOpen: () => void; className?: string }) {
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const progress = profile ? intakeProgress(profile) : 0;
  return (
    <ActionTile
      className={className}
      icon="health"
      title="Finish your health intake"
      meta="Helps Deborah personalise her guidance"
      progress={progress}
      progressLabel="Health intake progress"
      showPercent
      onClick={onOpen}
    />
  );
}
