/**
 * @screen  M-9.7 · My Visit Notes (For My Provider)
 * @flow    F09b Visit brief (Miro Step 5) · entered from F02e Discuss with provider
 * @states  review · saved · appointment follow-up · empty
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09b-visit-brief.md
 * @xref    web: W-9.7 — not built
 */
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { assembleVisitBrief, latestCompletedAnswer, visitBriefPreview } from '@shared/engine';
import {
  BOOKING_DAY_AFTER_BODY,
  FOLLOW_UP_TITLE,
  useAppStore,
  VISIT_NOTES_TAKE_BODY,
} from '@shared/store';
import type { VisitBriefContent } from '@shared/types/domain';
import { addDays, nowFrom, uid } from '@shared/utils';
import { Button, Modal } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { AppointmentFollowUp } from './parts/AppointmentFollowUp';
import { BriefDocument } from './parts/BriefDocument';
import styles from './VisitBrief.module.css';

function resolveBrief(
  params: { messageId?: string; conversationId?: string; noteId?: string },
): { brief: VisitBriefContent; conversationId?: string; sourceMessageId?: string; profileId?: string; noteId?: string } | null {
  const s = useAppStore.getState();
  if (params.noteId) {
    const note = s.notes.byId[params.noteId];
    if (note?.brief) {
      return {
        brief: note.brief,
        conversationId: note.conversationId,
        sourceMessageId: note.sourceMessageId,
        profileId: note.profileId,
        noteId: note.id,
      };
    }
  }
  const activeId = s.conversations.activeByProfile[s.activeProfileId];
  const conv =
    (params.conversationId && s.conversations.byId[params.conversationId]) ||
    (params.messageId
      ? Object.values(s.conversations.byId).find((c) => c.messages.some((m) => m.id === params.messageId))
      : undefined) ||
    (activeId ? s.conversations.byId[activeId] : undefined);
  if (!conv) return null;
  const msg = params.messageId
    ? conv.messages.find((m) => m.id === params.messageId)
    : latestCompletedAnswer(conv);
  if (!msg?.answer) return null;
  const profile = s.profiles.byId[conv.profileId];
  if (!profile) return null;
  return {
    brief: assembleVisitBrief(conv, profile, msg.answer),
    conversationId: conv.id,
    sourceMessageId: msg.id,
    profileId: profile.id,
  };
}

export default function VisitBrief() {
  const params = useScreenParams<{ messageId: string; conversationId: string; noteId: string }>();
  const { dismissModal, open } = useNav();
  const toast = useToast();
  const seed = useMemo(
    () => resolveBrief(params),
    // Params object identity changes; key fields drive re-assembly.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
    [params.messageId, params.conversationId, params.noteId],
  );
  const [brief, setBrief] = useState<VisitBriefContent | null>(() => seed?.brief ?? null);
  const [noteId, setNoteId] = useState<string | undefined>(() => seed?.noteId);
  const [followUp, setFollowUp] = useState(false);
  const profileId = seed?.profileId;

  // Keep store clock in sync for follow-up scheduling.
  useAppStore(useShallow((s) => ({ now: s.simulatedNow, anchor: s.clockAnchor })));

  if (!brief || !profileId) {
    return (
      <div className={styles.root} data-xref="M-9.7 · My Visit Notes">
        <Modal title="My Visit Notes" right={<Button variant="ghost" size="md" onClick={dismissModal}>Done</Button>}>
          <EmptyState icon="note" text="There’s not enough from this conversation yet for a provider note. Keep talking with Deborah first." />
        </Modal>
      </div>
    );
  }

  const persist = () => {
    const s = useAppStore.getState();
    const next: VisitBriefContent = { ...brief };
    const body = visitBriefPreview(next);
    const title = 'For my provider';
    if (noteId) {
      s.updateNote(noteId, { title, body, brief: next, kind: 'provider-brief', sourceMessageId: seed?.sourceMessageId, conversationId: seed?.conversationId });
      return noteId;
    }
    const id = uid('n');
    s.addNote({
      id,
      profileId,
      kind: 'provider-brief',
      title,
      body,
      brief: next,
      updatedAt: nowFrom(s).toISOString(),
      sourceMessageId: seed?.sourceMessageId,
      conversationId: seed?.conversationId,
    });
    setNoteId(id);
    return id;
  };

  const afterAction = () => setFollowUp(true);

  const onSave = () => {
    persist();
    toast('Saved to My Visit Notes');
    afterAction();
  };

  const onPdf = () => {
    const id = persist();
    open('M-9.6', { briefNoteId: id });
    afterAction();
  };

  const scheduleDayAfter = (appointmentIso: string) => {
    const s = useAppStore.getState();
    s.updateNote(persist(), { brief: { ...brief, appointmentDate: appointmentIso } });
    s.scheduleNotification({
      id: uid('n'),
      title: FOLLOW_UP_TITLE,
      body: BOOKING_DAY_AFTER_BODY,
      deepLink: `followup:${profileId}`,
      deliverAt: addDays(appointmentIso, 1),
      delivered: false,
      read: false,
    });
    toast('Check-in set for the day after your appointment');
    dismissModal();
  };

  const scheduleSevenDay = () => {
    const s = useAppStore.getState();
    s.scheduleNotification({
      id: uid('n'),
      title: FOLLOW_UP_TITLE,
      body: VISIT_NOTES_TAKE_BODY,
      deepLink: `followup:${profileId}`,
      deliverAt: addDays(nowFrom(s).toISOString(), 7),
      delivered: false,
      read: false,
    });
    toast('Take the notes to the appointment — we’ll check in after 7 days');
    dismissModal();
  };

  return (
    <div className={styles.root} data-xref="M-9.7 · My Visit Notes">
      <Modal
        title="My Visit Notes"
        right={<Button variant="ghost" size="md" onClick={dismissModal}>Done</Button>}
        footer={
          followUp ? (
            <AppointmentFollowUp onWithDate={scheduleDayAfter} onWithoutDate={scheduleSevenDay} />
          ) : (
            <div className={styles.actions}>
              <Button variant="secondary" leadingIcon="note" onClick={onSave}>Save a copy</Button>
              <Button variant="secondary" leadingIcon="pdf" onClick={onPdf}>Download PDF</Button>
            </div>
          )
        }
      >
        <div className={styles.body}>
          <BriefDocument brief={brief} onChange={setBrief} />
        </div>
      </Modal>
    </div>
  );
}
