/**
 * @screen  M-9.7 · My Visit Notes (For My Provider)
 * @flow    F09b Visit brief (Miro Step 5) · entered from F02e Discuss with provider
 * @presentation push (DerivedPage)
 * @states  review (read-only notes; provider name + appointment date editable) · saved · empty
 *
 * Design direction 2026-10-20 / 2026-10-21: the notes sit straight on the page (no white card); only the provider's
 * name and the appointment date can be changed. Share / Download live on the records pane bar when embedded.
 * Footer: Done (saves; a date also schedules the day-after visit check-in).
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09b-visit-brief.md
 * @xref    web: W-9.7 — not built
 */
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { assembleVisitBrief, latestCompletedAnswer, visitBriefPreview } from '@shared/engine';
import { healingPlanContext } from '@shared/engine/planConcerns';
import { BOOKING_DAY_AFTER_BODY, FOLLOW_UP_TITLE, selectPlan90, selectProfileNotes, useAppStore } from '@shared/store';
import type { VisitBriefContent } from '@shared/types/domain';
import { addDays, nowFrom, uid } from '@shared/utils';
import { Button, Input, Select } from '@web/ui';
import { visitSpecialties } from '@shared/data';
import { EmptyState } from '@web/patterns/health';
import { DerivedPage } from '@web/patterns/shell';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useScreenParams } from '@web/navigation';
import { BriefDocument } from './parts/BriefDocument';
import styles from './VisitBrief.module.css';

function healingPlanNote(profileId: string): string | undefined {
  const s = useAppStore.getState();
  const profile = s.profiles.byId[profileId];
  if (!profile) return undefined;
  return healingPlanContext(selectPlan90(s, profileId), profile, selectProfileNotes(s, profileId));
}

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
    brief: assembleVisitBrief(conv, profile, msg.answer, healingPlanNote(profile.id)),
    conversationId: conv.id,
    sourceMessageId: msg.id,
    profileId: profile.id,
  };
}

export default function VisitBrief() {
  const params = useScreenParams<{ messageId: string; conversationId: string; noteId: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const seed = useMemo(
    () => resolveBrief(params),
    // Params object identity changes; key fields drive re-assembly.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
    [params.messageId, params.conversationId, params.noteId],
  );
  const [brief, setBrief] = useState<VisitBriefContent | null>(() => seed?.brief ?? null);
  const [noteId, setNoteId] = useState<string | undefined>(() => seed?.noteId);
  const profileId = seed?.profileId;
  // One name everywhere: tile · pane bar · this heading. Saved notes use store title (rename syncs).
  const noteTitle = useAppStore((s) => (noteId ? s.notes.byId[noteId]?.title : undefined));
  const topic = useAppStore((s) => (seed?.conversationId ? s.conversations.byId[seed.conversationId]?.topic : undefined));
  const raw = noteTitle?.trim() || brief?.title?.trim() || topic?.trim();
  const heading = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'My Visit Notes';

  // Keep store clock in sync for follow-up scheduling.
  useAppStore(useShallow((s) => ({ now: s.simulatedNow, anchor: s.clockAnchor })));

  if (!brief || !profileId) {
    return (
      <DerivedPage title="For my provider" composerPlaceholder="Ask Oracle about your visit notes…">
        <div className={styles.body} data-xref="M-9.7 · My Visit Notes">
          <EmptyState icon="note" text="There’s not enough from this conversation yet for a provider note. Keep talking with the Oracle first." />
          <div className={styles.actions}>
            <Button fullWidth onClick={pop}>Done</Button>
          </div>
        </div>
      </DerivedPage>
    );
  }

  const persist = () => {
    const s = useAppStore.getState();
    const next: VisitBriefContent = { ...brief, title: heading };
    const body = visitBriefPreview(next);
    // Keep the renamed note title; only brand-new notes fall back from the generic heading.
    const title = (noteId && s.notes.byId[noteId]?.title?.trim()) || (heading === 'My Visit Notes' ? 'Your visit notes' : heading);
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

  // Done: one tap saves. With an appointment date, the visit check-in is set for the day after — no extra step.
  const onDone = () => {
    const id = persist();
    if (brief.appointmentDate) {
      const s = useAppStore.getState();
      s.scheduleNotification({
        id: uid('n'),
        title: FOLLOW_UP_TITLE,
        body: BOOKING_DAY_AFTER_BODY,
        // F09c: the day after, open the visit debrief for this brief (docs/ux/F09c-log-visit.md › Entry points).
        deepLink: `visit:${id}`,
        deliverAt: addDays(brief.appointmentDate, 1),
        delivered: false,
        read: false,
      });
    }
    toast('Saved to My Visit Notes');
    pop();
  };

  const dateValue = brief.appointmentDate ? brief.appointmentDate.slice(0, 10) : '';

  return (
    <DerivedPage title={heading} composerPlaceholder="Ask Oracle about your visit notes…">
      <div className={styles.body} data-xref="M-9.7 · My Visit Notes">
        {/* The only two things to fill in here; the rest of the notes are read-only. */}
        <section className={styles.fields} aria-label="Your appointment">
          <Input
            label="Provider’s name"
            placeholder="e.g. Dr. Patel"
            autoComplete="off"
            autoCapitalize="words"
            value={brief.providerName ?? ''}
            onChange={(e) => setBrief({ ...brief, providerName: e.target.value })}
          />
          <Select
            label="Specialty"
            placeholder="Choose…"
            options={visitSpecialties.map((o) => ({ value: o.label, label: o.label }))}
            value={brief.providerSpecialty}
            onChange={(v) => setBrief({ ...brief, providerSpecialty: v })}
          />
          <Input
            label="Appointment date"
            type="date"
            value={dateValue}
            onChange={(e) => setBrief({ ...brief, appointmentDate: e.target.value ? new Date(`${e.target.value}T12:00:00`).toISOString() : undefined })}
          />
        </section>
        <BriefDocument brief={brief} flat />
        <div className={styles.actions}>
          <Button fullWidth onClick={onDone}>Done</Button>
        </div>
      </div>
    </DerivedPage>
  );
}
