/**
 * @screen  M-9.4 · Note editor
 * @flow    F09 My Health records
 * @states  new (empty) · editing · questions checklist · saved answer (source line) · delete confirm
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-94--note-editor-not-in-wireframes
 * @xref    web: W-9.4 (apps/web/screens/records/NoteEditor)
 *
 * OPEN: "may Deborah read these notes in later consultations (consent)?" — not wired to chat.
 */
import { useState } from 'react';
import { selectMessage, useAppStore } from '@shared/store';
import type { NoteKind } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { ActionSheet, IconButton, Input, Segmented, TextArea, useAlert, type IconName } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useScreenParams } from '@web/navigation';
import { ChecklistPreview } from './parts/ChecklistPreview';
import { DEFAULT_TITLE, useNoteAutosave } from './parts/useNoteAutosave';
import styles from './NoteEditor.module.css';

type EditableKind = Exclude<NoteKind, 'saved-answer'>;
const KINDS: { value: EditableKind; label: string; icon: IconName }[] = [
  { value: 'questions', label: 'Questions for my visit', icon: 'chat' },
  { value: 'after-visit', label: 'After my visit', icon: 'calendar' },
  { value: 'free', label: 'Other', icon: 'note' },
];

export default function NoteEditor() {
  const params = useScreenParams<{ noteId: string; kind: NoteKind; profileId: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const alert = useAlert();
  // Read once: the editor owns the draft while open.
  const [note] = useState(() => (params.noteId ? useAppStore.getState().notes.byId[params.noteId] : undefined));
  const profileId = useAppStore((s) => note?.profileId ?? params.profileId ?? s.activeProfileId);
  const source = useAppStore((s) => (note?.sourceMessageId ? selectMessage(s, note.sourceMessageId) : undefined));
  const [title, setTitle] = useState(note?.title ?? '');
  const [kind, setKind] = useState<NoteKind>(note?.kind ?? params.kind ?? 'questions');
  const [body, setBody] = useState(note?.body ?? '');
  const [menu, setMenu] = useState(false);
  const autosave = useNoteAutosave({ title, kind, body }, profileId, note?.id);

  const close = () => {
    autosave.flush();
    pop();
    // Back on an untouched new note discards silently.
    if (autosave.didSave) toast('Saved');
  };

  const remove = async () => {
    setMenu(false);
    const choice = await alert({
      title: 'Delete this note?',
      message: 'This can’t be undone.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive' }],
    });
    if (choice !== 1) return;
    autosave.cancel();
    const id = autosave.noteId;
    if (id) useAppStore.getState().deleteNote(id);
    pop();
    if (id) toast('Note deleted');
  };

  return (
    <>
      <DerivedPage
        title={note ? 'Note' : 'New note'}
        composerPlaceholder="Ask Deborah about this note…"
        onBack={close}
        showBack
        trailing={note ? <IconButton icon="more" label="More options" onClick={() => setMenu(true)} /> : undefined}
      >
        <div className={styles.body} data-xref="M-9.4 · Note editor">
          <Input label="Title" placeholder={DEFAULT_TITLE[kind]} value={title} onChange={(e) => setTitle(e.target.value)} />

          {kind === 'saved-answer' ? (
            <p className={styles.kindText}>Saved answer from Deborah</p>
          ) : (
            <Segmented label="Note type" options={KINDS} value={kind} onChange={setKind} />
          )}

          {source && (
            <p className={styles.source}>{`From Deborah’s answer on ${formatShortDate(source.message.createdAt)}`}</p>
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
      </DerivedPage>
      <ActionSheet open={menu} actions={[{ label: 'Delete note', destructive: true, onSelect: remove }]} onClose={() => setMenu(false)} />
    </>
  );
}
