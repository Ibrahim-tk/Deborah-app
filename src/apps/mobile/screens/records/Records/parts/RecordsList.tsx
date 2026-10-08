/** The list for one Records segment: rows newest first, empty state, primary action. */
import { useShallow } from 'zustand/react/shallow';
import { selectProfileConversations, selectProfileLabs, selectProfileNotes, useAppStore } from '@shared/store';
import type { Conversation } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { Button, Divider, Icon, ListRow } from '@mobile/ui';
import { ConsultationRow, EmptyState, NoteRow } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import styles from '../Records.module.css';
import own from './RecordsList.module.css';

export type Segment = 'consultations' | 'notes' | 'labs';

export interface RecordsListProps {
  segment: Segment;
  profileId: string;
  /** Asking and adding labs act on the active profile's chat, so they are hidden for others. */
  isActiveProfile: boolean;
}

const topicOf = (c: Conversation) =>
  c.topic ?? (c.scriptId === 'checkin' ? 'Check-in' : c.messages.find((m) => m.role === 'user')?.text) ?? 'Consultation';
const isAnswered = (c: Conversation) => Boolean(c.countedAt) || c.messages.some((m) => m.kind === 'answer' && m.answer && !m.meta?.streaming);
const hasLabs = (c: Conversation) => c.messages.some((m) => (m.answer?.labsReferenced?.length ?? 0) > 0);

export function RecordsList({ segment, profileId, isActiveProfile }: RecordsListProps) {
  const { open, openAsk } = useNav();
  const conversations = useAppStore(useShallow((s) => selectProfileConversations(s, profileId)));
  const notes = useAppStore(useShallow((s) => selectProfileNotes(s, profileId)));
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const newNote = () => open('M-9.4', { kind: 'questions', profileId });
  // ASSUMPTION: viewing another profile's records offers no Ask / Add labs (they act on the active profile).
  const addLabs = isActiveProfile ? () => open('M-5.3') : undefined;

  if (segment === 'consultations') {
    if (conversations.length === 0) {
      return (
        <div className={styles.top}>
          <EmptyState
            icon="chat"
            title="No consultations yet"
            actionLabel={isActiveProfile ? 'Ask Deborah' : undefined}
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

  if (segment === 'notes') {
    if (notes.length === 0) {
      return (
        <div className={styles.top}>
          <EmptyState icon="note" title="Jot down questions before your next visit" actionLabel="New note" actionIcon="plus" onAction={newNote} />
        </div>
      );
    }
    return (
      <>
        <div className={styles.top}>
          <Button variant="secondary" size="md" leadingIcon="plus" onClick={newNote}>New note</Button>
        </div>
        <ul className={own.list}>
          {notes.map((n) => (
            <li key={n.id}>
              <NoteRow
                title={n.title || 'Untitled note'}
                kind={n.kind}
                updated={formatShortDate(n.updatedAt)}
                body={n.body}
                onPress={() => open('M-9.4', { noteId: n.id })}
              />
              <Divider />
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (labs.length === 0) {
    return (
      <div className={styles.top}>
        <EmptyState icon="labs" title="No lab results yet" actionLabel={addLabs && 'Add labs'} actionIcon="plus" onAction={addLabs} />
      </div>
    );
  }
  return (
    <>
      {addLabs && (
        <div className={styles.top}>
          <Button variant="secondary" size="md" leadingIcon="plus" onClick={addLabs}>Add</Button>
        </div>
      )}
      <ul className={own.list}>
        {labs.map((r) => (
          <li key={r.id}>
            <ListRow
              title={r.labName || 'Lab results'}
              subtitle={[r.collectedAt && formatShortDate(r.collectedAt), `${r.values.length} ${r.values.length === 1 ? 'value' : 'values'}`]
                .filter(Boolean)
                .join(' · ')}
              leading={<span className={own.icon}><Icon name="labs" size={22} /></span>}
              onPress={() => open('M-9.5', { reportId: r.id })}
            />
            <Divider />
          </li>
        ))}
      </ul>
    </>
  );
}
