/**
 * @screen  M-9.4 · Note editor
 * @flow    F09 My Health records
 * @states  new (empty) · editing · questions checklist · saved answer (source line) · delete confirm
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-94--note-editor-not-in-wireframes
 * @xref    web: W-9.4 (apps/web/screens/records/NoteEditor) — not built
 *
 * OPEN: "may the Oracle use these notes in later consultations (consent)?" — not wired to chat.
 */
import { useState } from 'react';
import { selectMessage, useAppStore } from '@shared/store';
import type { NoteKind } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { IconButton, Input, Menu, Modal, Segmented, TextArea, type IconName } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { ChecklistPreview } from './parts/ChecklistPreview';
import { DEFAULT_TITLE, useNoteAutosave } from './parts/useNoteAutosave';
import styles from './NoteEditor.module.css';

type EditableKind = Extract<NoteKind, 'questions' | 'after-visit'>;
// Two balanced segments; 'free' notes keep their kind but show as plain text (no "Other" segment).
const KINDS: { value: EditableKind; label: string; icon: IconName }[] = [
  { value: 'questions', label: 'Before my visit', icon: 'chat' },
  { value: 'after-visit', label: 'After my visit', icon: 'calendar' },
];
const isEditable = (k: NoteKind): k is EditableKind => KINDS.some((o) => o.value === k);

export default function NoteEditor() {
  const params = useScreenParams<{ noteId: string; kind: NoteKind; profileId: string }>();
  const { dismissModal } = useNav();
  const toast = useToast();
  // Read once: the editor owns the draft while open.
  const [note] = useState(() => (params.noteId ? useAppStore.getState().notes.byId[params.noteId] : undefined));
  const profileId = useAppStore((s) => note?.profileId ?? params.profileId ?? s.activeProfileId);
  const source = useAppStore((s) => (note?.sourceMessageId ? selectMessage(s, note.sourceMessageId) : undefined));
  const [title, setTitle] = useState(note?.title ?? '');
  const [kind, setKind] = useState<NoteKind>(note?.kind ?? params.kind ?? 'questions');
  const [body, setBody] = useState(note?.body ?? '');
  const autosave = useNoteAutosave({ title, kind, body }, profileId, note?.id);

  const close = () => {
    autosave.flush();
    dismissModal();
    // × on an untouched new note discards silently.
    if (autosave.didSave) toast('Saved');
  };

  const remove = () => {
    autosave.cancel();
    const id = autosave.noteId;
    if (id) useAppStore.getState().deleteNote(id);
    dismissModal();
    if (id) toast('Note deleted');
  };

  return (
    <div className={styles.root} data-xref="M-9.4 · Note editor">
      <Modal
        title={note ? 'Note' : 'New note'}
        left={
          note ? (
            <Menu
              side="bottom"
              align="start"
              trigger={<IconButton icon="more" label="More options" />}
              items={[{ id: 'delete', label: 'Delete note', destructive: true }]}
              onSelect={(id) => { if (id === 'delete') remove(); }}
            />
          ) : undefined
        }
        right={<IconButton icon="close" label="Close" onClick={close} />}
      >
        <div className={styles.body}>
          <Input label="Title" placeholder={DEFAULT_TITLE[kind]} value={title} onChange={(e) => setTitle(e.target.value)} />

          {isEditable(kind) ? (
            <Segmented label="Note type" options={KINDS} value={kind} onChange={setKind} />
          ) : (
            <p className={styles.kindText}>{kind === 'saved-answer' ? 'Saved answer from the Oracle' : 'Note'}</p>
          )}

          {source && (
            <p className={styles.source}>{`From the Oracle’s answer on ${formatShortDate(source.message.createdAt)}`}</p>
          )}

          <label className={styles.field}>
            <span className={styles.label}>{kind === 'questions' ? 'One question per line' : 'Note'}</span>
            <TextArea
              label="Note text"
              minRows={6}
              maxRows={40}
              placeholder={kind === 'questions' ? 'What should I ask about my sleep?' : 'Write anything you want to remember.'}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>

          {kind === 'questions' && <ChecklistPreview body={body} />}
        </div>
      </Modal>
    </div>
  );
}
