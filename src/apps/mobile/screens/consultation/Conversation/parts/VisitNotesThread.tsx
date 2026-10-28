/**
 * Mobile "Create visit notes" (ported from web, 2026-10-28) in the chat thread (mirrors the first-consult flow, M-2.12):
 * Deborah asks about an appointment → Yes opens the small provider/date form → a visit-notes tile appears.
 * The note is saved to My Visit Notes from the latest answer. Copy is placeholder (same as visitNotesAsk).
 */
import { useState } from 'react';
import { briefFromAnswer, visitBriefPreview } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import type { Answer } from '@shared/types/domain';
import { formatShortDate, nowFrom, uid } from '@shared/utils';
import { MessageBubble } from '@mobile/patterns/chat';
import { InlineChoicePills } from '@mobile/patterns/widgets';
import { VisitNoteCard } from '@mobile/patterns/health';
import { AppointmentForm, type Appointment } from '@mobile/screens/consultation/FirstConsult/parts/AppointmentForm';

type Step = 'ask' | 'form' | 'done';

export function VisitNotesThread({ answer, topic, onOpenNotes }: { answer?: Answer; topic: string; onOpenNotes: (noteId?: string) => void }) {
  const [step, setStep] = useState<Step>('ask');
  const [reply, setReply] = useState<string>();
  const [appt, setAppt] = useState<Appointment>();
  const [summary, setSummary] = useState('');
  const [noteId, setNoteId] = useState<string>();

  const create = (a?: Appointment) => {
    const s = useAppStore.getState();
    const profile = selectActiveProfile(s);
    if (profile && answer) {
      const brief = {
        ...briefFromAnswer(profile, answer, topic),
        ...(a?.provider && { providerName: a.provider }),
        ...(a?.specialty && { providerSpecialty: a.specialty }),
        ...(a?.date && { appointmentDate: new Date(`${a.date}T12:00:00`).toISOString() }),
      };
      const id = uid('n');
      setNoteId(id);
      s.addNote({ id, profileId: profile.id, kind: 'provider-brief', title: 'Your visit notes', body: visitBriefPreview(brief), brief, updatedAt: nowFrom(s).toISOString() });
    }
    setSummary([a?.provider, a?.specialty, a?.date && formatShortDate(a.date)].filter(Boolean).join(' · ') || topic);
    setStep('done');
  };

  const date = (appt?.date ? new Date(`${appt.date}T12:00:00`) : nowFrom(useAppStore.getState())).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <MessageBubble role="deborah" text="Do you have an appointment?">
        {step === 'ask' && (
          <InlineChoicePills
            label="Do you have an appointment?"
            options={['Yes', 'No']}
            onPick={(label) => {
              setReply(`${label}.`);
              if (label === 'Yes') setStep('form');
              else create();
            }}
          />
        )}
      </MessageBubble>
      {reply && <MessageBubble role="user" text={reply} />}
      {(step === 'form' || appt) && (
        <MessageBubble role="deborah" text="Add who you’re seeing and when, and I’ll put it on your notes.">
          {step === 'form' && (
            <AppointmentForm
              active
              onSave={(a) => {
                setAppt(a);
                create(a);
              }}
            />
          )}
        </MessageBubble>
      )}
      {appt && <MessageBubble role="user" text={`${appt.provider ? `With ${appt.provider}, ` : ''}${formatShortDate(appt.date)}.`} />}
      {step === 'done' && (
        <MessageBubble role="deborah" text="Done. Here are your visit notes, ready to take with you.">
          <VisitNoteCard date={date} title="Your visit notes" detail={summary} actionLabel="Open" onOpen={() => onOpenNotes(noteId)} onLog={() => onOpenNotes(noteId)} />
        </MessageBubble>
      )}
    </>
  );
}
