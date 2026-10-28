/** The list for one Records segment: rows newest first, empty state, primary action. */
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectProfileConversations, selectProfileNotes, useAppStore } from '@shared/store';
import type { Conversation, Note } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { ActionTile, BottomSheet, Button, Divider } from '@mobile/ui';
import { ConsultationRow, EmptyState, VisitNoteCard } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import styles from '../Records.module.css';
import own from './RecordsList.module.css';

export type Segment = 'consultations' | 'notes';

export interface RecordsListProps {
  segment: Segment;
  profileId: string;
  /** Asking acts on the active profile's chat, so it is hidden for others. */
  isActiveProfile: boolean;
}

const topicOf = (c: Conversation) =>
  c.topic ?? (c.scriptId === 'checkin' ? 'Check-in' : c.messages.find((m) => m.role === 'user')?.text) ?? 'Consultation';
const isAnswered = (c: Conversation) => Boolean(c.countedAt) || c.messages.some((m) => m.kind === 'answer' && m.answer && !m.meta?.streaming);
/** First line: just the date (the appointment when set, else when it was saved). */
const dateFor = (n: Note) =>
  new Date(n.brief?.appointmentDate ?? n.visitLog?.visitDate ?? n.updatedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
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

const hasLabs = (c: Conversation) => c.messages.some((m) => (m.answer?.labsReferenced?.length ?? 0) > 0);

export function RecordsList({ segment, profileId, isActiveProfile }: RecordsListProps) {
  const { open, openAsk } = useNav();
  const conversations = useAppStore(useShallow((s) => selectProfileConversations(s, profileId)));
  const notes = useAppStore(useShallow((s) => selectProfileNotes(s, profileId)));
  const [noteMenu, setNoteMenu] = useState(false);
  const newNote = () => setNoteMenu(true);
  // "+ New note" (design 2026-10-20): a sheet with two choices — a note for herself, or log a provider visit
  // in the same form as the visit notes Deborah prepares (M-9.9).
  const pick = (go: () => void) => { setNoteMenu(false); go(); };
  const noteMenuSheet = (
    <BottomSheet open={noteMenu} onClose={() => setNoteMenu(false)} showClose title="New note">
      <div className={own.choices}>
        <ActionTile icon="edit" title="A note for myself" meta="Questions, reminders, anything to remember" onClick={() => pick(() => open('M-9.10', { profileId }))} />
        <ActionTile icon="calendar" title="Log a provider visit" meta="What they said, labs ordered and next steps" onClick={() => pick(() => open('M-9.9', { profileId }))} />
      </div>
    </BottomSheet>
  );

  if (segment === 'consultations') {
    if (conversations.length === 0) {
      return (
        <div className={styles.top}>
          <EmptyState
            icon="chat"
            title="No consultations yet"
            actionLabel={isActiveProfile ? 'Ask Oracle' : undefined}
            actionIcon="deborah"
            onAction={() => openAsk({ focus: true })}
          />
        </div>
      );
    }
    return (
      <ul className={own.list}>
        {conversations.map((c) => (
          <li key={c.id}>
            <ConsultationRow
              topic={topicOf(c)}
              date={formatShortDate(c.countedAt ?? c.startedAt)}
              status={isAnswered(c) ? 'answered' : 'in-progress'}
              withLabs={hasLabs(c)}
              onPress={() => open('M-9.2', { conversationId: c.id })}
            />
            <Divider />
          </li>
        ))}
      </ul>
    );
  }

  // Lab reports removed (design 2026-10-28): notes are the only other segment.
  if (notes.length === 0) {
    return (
      <div className={styles.top}>
        <EmptyState icon="note" title="Jot down questions before your next visit" actionLabel="New note" actionIcon="plus" onAction={newNote} />
        {noteMenuSheet}
      </div>
    );
  }
  return (
    <>
      {noteMenuSheet}
      <ul className={own.cards}>
        {notes.map((n) => (
          <li key={n.id}>
            <VisitNoteCard
              date={dateFor(n)}
              title={n.title || 'Untitled note'}
              detail={detailFor(n)}
              logged={Boolean(n.visitLog)}
              onOpen={() => (n.kind === 'provider-brief' ? open('M-9.7', { noteId: n.id }) : n.visit ? open('M-9.8', { noteId: n.id }) : open('M-9.4', { noteId: n.id }))}
              onLog={() => open('M-9.9', { noteId: n.id })}
              onAsk={() => { useAppStore.getState().archiveActive(n.profileId); openAsk({ prefill: askAbout(n), focus: true }); }}
            />
          </li>
        ))}
      </ul>
      {/* New sits bottom right, floating (design 2026-10-20). */}
      <Button className={own.fab} leadingIcon="plus" onClick={newNote}>New note</Button>
    </>
  );
}
