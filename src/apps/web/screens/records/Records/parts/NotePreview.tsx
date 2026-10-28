/**
 * Note pane (web): a pinned tool bar (Edit incl. rename · Download · Share · Close) over the note itself, rendered in place —
 * no "Open" hop to a full page. Used by My Visit Notes (M-9.1) and the chat side panel (M-2.1).
 * `mode`: 'view' shows the note's own screen (brief / log / note); 'edit' the editor; 'log' the visit log form.
 */
import { Suspense, useState } from 'react';
import { useAppStore } from '@shared/store';
import { Button, IconButton, Input } from '@web/ui';
import { meta } from '@web/navigation';
import { useToast } from '@web/hooks/toast.store';
import { DetailHostProvider } from '../../../DetailHost';
import styles from './NotePreview.module.css';

export type NotePaneMode = 'view' | 'edit' | 'log';

export function NotePreview({ noteId, mode: initial = 'view', onClear }: { noteId: string; mode?: NotePaneMode; onClear: () => void }) {
  const note = useAppStore((s) => s.notes.byId[noteId]);
  const toast = useToast();
  const [mode, setMode] = useState<NotePaneMode>(initial);
  const [renaming, setRenaming] = useState<string | null>(null);

  if (!note) {
    return (
      <div className={styles.root}>
        <p className={styles.empty}>This note is no longer available.</p>
        <Button variant="ghost" onClick={onClear}>Close</Button>
      </div>
    );
  }

  const screenId = mode === 'log' ? 'M-9.9' : mode === 'edit' && note.kind !== 'provider-brief' ? 'M-9.4' : note.kind === 'provider-brief' ? 'M-9.7' : note.visit ? 'M-9.8' : 'M-9.4';
  const Screen = meta(screenId)?.component;
  const share = async () => {
    if (!navigator.share) return toast('Sharing isn’t available in this browser');
    try { await navigator.share({ title: note.title || 'My visit notes', text: 'Notes for my provider from Your Oracle' }); } catch { /* dismissed */ }
  };
  const saveName = () => {
    const t = renaming?.trim();
    if (t) {
      const brief = note.brief ? { ...note.brief, title: t } : note.brief;
      useAppStore.getState().updateNote(note.id, { title: t, brief });
    }
    setRenaming(null);
  };

  return (
    <div className={styles.root}>
      {/* Pinned tools — stays put while the note scrolls. */}
      <div className={styles.bar}>
        {renaming !== null ? (
          <form className={styles.rename} onSubmit={(e) => { e.preventDefault(); saveName(); }}>
            <Input label="Note name" hideLabel value={renaming} autoFocus onChange={(e) => setRenaming(e.target.value)} onBlur={saveName} />
          </form>
        ) : (
          <span
            className={styles.barTitle}
            title="Double-click to rename"
            onDoubleClick={() => setRenaming(note.title || '')}
          >
            {note.title || 'Untitled note'}
          </span>
        )}
        <div className={styles.tools}>
          {mode === 'view' ? (
            // Edit also renames: the name becomes editable in this bar.
            <IconButton icon="edit" label="Edit" size="sm" onClick={() => { setRenaming(note.title || ''); setMode('edit'); }} />
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { if (renaming !== null) saveName(); setMode('view'); }}>Done</Button>
          )}
          <IconButton icon="download" label="Download PDF" size="sm" onClick={() => toast('Downloaded as PDF (demo)')} />
          <Button size="sm" onClick={share}>Share</Button>
          <IconButton icon="close" label="Close preview" size="sm" onClick={onClear} />
        </div>
      </div>
      <div className={styles.scroll}>
        {Screen && (
          <DetailHostProvider key={`${screenId}-${note.id}`} screenId={screenId} params={{ noteId: note.id }} onClear={onClear} previousTitle="Notes">
            <Suspense fallback={<p className={styles.empty}>Loading…</p>}>
              <Screen />
            </Suspense>
          </DetailHostProvider>
        )}
      </div>
    </div>
  );
}
