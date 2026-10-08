/**
 * @pattern NoteRow — Visit Note: kind icon (questions / saved answer / after visit / other),
 *          title, updated date and the body's first line. Kind is an icon, never a tag.
 * @usedBy  M-9.1 (Visit Notes segment)
 * @spec    docs/ux/F09-records.md#m-91--records
 * @xref    web: apps/web/patterns/health/NoteRow — not built
 */
import type { NoteKind } from '@shared/types/domain';
import { Icon, ListRow, type IconName } from '@mobile/ui';
import styles from './NoteRow.module.css';

export interface NoteRowProps {
  title: string;
  kind: NoteKind;
  /** Already formatted, e.g. "12 Sep". */
  updated: string;
  body: string;
  onPress: () => void;
}

const KIND: Record<NoteKind, { icon: IconName; label: string }> = {
  questions: { icon: 'note', label: 'Questions for my visit' },
  'saved-answer': { icon: 'chat', label: 'Saved answer' },
  'after-visit': { icon: 'calendar', label: 'After my visit' },
  free: { icon: 'edit', label: 'Note' },
};

export function NoteRow({ title, kind, updated, body, onPress }: NoteRowProps) {
  const firstLine = body.split('\n').find((l) => l.trim())?.trim();
  const k = KIND[kind];
  return (
    <ListRow
      title={title}
      subtitle={
        <>
          <span className={styles.meta}>{`${k.label} · ${updated}`}</span>
          {firstLine && <span className={styles.preview}>{firstLine}</span>}
        </>
      }
      leading={
        <span className={styles.icon} aria-hidden>
          <Icon name={k.icon} size={22} />
        </span>
      }
      onPress={onPress}
    />
  );
}
