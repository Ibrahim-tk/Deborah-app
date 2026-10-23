/**
 * @screen  M-9.1 · My Visit Notes (web)
 * @flow    F09 My Health records
 * @states  loading · notes · search · empty · other profile · floating artifact preview (as chat)
 * @spec    docs/ux/F09-records.md#m-91--records
 * @xref    mobile: apps/mobile/screens/records/Records
 */
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectProfileNotes, useAppStore } from '@shared/store';
import type { Note } from '@shared/types/domain';
import { useDevice } from '@shell/device';
import { ActionTile, BottomSheet, Button } from '@web/ui';
import { EmptyState, VisitNoteCard } from '@web/patterns/health';
import { DerivedPage } from '@web/patterns/shell';
import { simBetween } from '@web/hooks/simTiming';
import { useNav, useScreenParams } from '@web/navigation';
import { NotePreview } from './parts/NotePreview';
import styles from './Records.module.css';

/** First line: just the date (the appointment when set, else when it was saved). */
const dateFor = (n: Note) =>
  new Date(n.brief?.appointmentDate ?? n.visitLog?.visitDate ?? n.updatedAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
/** Third line: what the provider said once logged, else the note's own first line. */
const detailFor = (n: Note) => n.visitLog?.diagnosis?.trim() || n.body.split('\n').find((l) => l.trim())?.trim();
/** A new chat already carrying the visit as context (design 2026-10-20). */
function askAbout(n: Note): string {
  const log = n.visitLog;
  const parts = [`About my visit on ${dateFor(n)} (${n.title}).`];
  if (log?.diagnosis) parts.push(`My provider said: ${log.diagnosis}`);
  if (log?.labs.length) parts.push(`Labs ordered: ${log.labs.map((l) => `${l.test} (${l.status.toLowerCase()})`).join(', ')}.`);
  if (log?.changes.length) parts.push(`Changes: ${log.changes.map((c) => `${c.name} ${c.change.toLowerCase()}`).join(', ')}.`);
  parts.push('What should I understand from this, and what should I ask next?');
  return parts.join(' ');
}

export default function Records() {
  const params = useScreenParams<{ profileId: string }>();
  const { open, openAsk } = useNav();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  const profile = useAppStore((s) => s.profiles.byId[profileId]);
  const notes = useAppStore(useShallow((s) => selectProfileNotes(s, profileId)));
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paneMode, setPaneMode] = useState<'view' | 'log'>('view');
  const [noteMenu, setNoteMenu] = useState(false);
  const { setClientGuide } = useDevice();

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setClientGuide('records-notes');
    return () => setClientGuide(null);
  }, [setClientGuide]);

  const otherProfile = Boolean(profile) && (profileId !== activeProfileId || profile?.relationship !== 'self');
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      notes.filter((n) => {
        if (!q) return true;
        return `${n.title} ${n.body}`.toLowerCase().includes(q);
      }),
    [notes, q],
  );

  // Same floating artifact pane as chat (M-2.1): list stays, note floats on the right.
  const openNote = (n: Note) => {
    setPaneMode('view');
    setSelectedId(n.id);
  };

  const pick = (go: () => void) => {
    setNoteMenu(false);
    go();
  };

  const list = loading ? (
    <p className={styles.loading} aria-busy="true">
      Loading…
    </p>
  ) : filtered.length === 0 ? (
    <div className={styles.empty}>
      <EmptyState
        icon="note"
        title={q ? 'No notes match that search' : 'Nothing here'}
      />
    </div>
  ) : (
    <ul className={styles.cards}>
      {filtered.map((n) => (
        <li key={n.id}>
          <VisitNoteCard
            date={dateFor(n)}
            title={n.title || 'Untitled note'}
            detail={detailFor(n)}
            logged={Boolean(n.visitLog)}
            selected={selectedId === n.id}
            onOpen={() => openNote(n)}
            onLog={() => { setPaneMode('log'); setSelectedId(n.id); }}
            onAsk={() => {
              useAppStore.getState().archiveActive(n.profileId);
              openAsk({ prefill: askAbout(n), focus: true });
            }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div className={styles.shell} data-preview={selectedId ? '' : undefined}>
        <DerivedPage
          title="My Visit Notes"
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Search notes"
          trailing={
            <Button leadingIcon="plus" onClick={() => setNoteMenu(true)}>
              New
            </Button>
          }
          composerPlaceholder="Ask Deborah about a visit…"
        >
          <div className={styles.stack}>
            {otherProfile && <p className={styles.context}>{`${profile?.name}’s visit notes`}</p>}
            {list}
          </div>
        </DerivedPage>
        {selectedId && (
          <aside className={styles.preview} aria-label="Visit notes preview">
            <div className={styles.previewBody}>
              <NotePreview
                key={`${selectedId}-${paneMode}`}
                noteId={selectedId}
                mode={paneMode}
                onClear={() => setSelectedId(null)}
              />
            </div>
          </aside>
        )}
      </div>

      <BottomSheet open={noteMenu} onClose={() => setNoteMenu(false)} showClose title="New note">
        <div className={styles.choices}>
          <ActionTile
            icon="edit"
            title="A note for myself"
            meta="Questions, reminders, anything to remember"
            onClick={() => pick(() => open('M-9.10', { profileId }))}
          />
          <ActionTile
            icon="calendar"
            title="Log a provider visit"
            meta="What they said, labs ordered and next steps"
            onClick={() => pick(() => open('M-9.9', { profileId }))}
          />
        </div>
      </BottomSheet>
    </>
  );
}
