/**
 * @screen  M-9.10 · New note (for my provider)
 * @flow    F09 Records — "+ New note › A note for myself"
 * @presentation push (DerivedPage)
 * @states  empty · filled
 * @spec    Design request 2026-10-20: same sections as the visit note Deborah prepares (M-9.7), in the visit-log
 *          form style (dividers; description boxes, one item per line). OPEN: add to docs/ux/F09.
 * @xref    web: not built
 *
 * Back closes without saving; ✓ (trailing) saves a provider-brief note the visit notes list and
 * "Ask Deborah" can use.
 */
import { useState } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import type { VisitBriefContent } from '@shared/types/domain';
import { uid } from '@shared/utils';
import { IconButton, Input } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useScreenParams } from '@web/navigation';
import { useToast } from '@web/hooks/toast.store';
import { Area, Section } from '../VisitLog/parts/Rows';
import styles from '../VisitLog/VisitLog.module.css';


const lines = (t: string) => t.split('\n').map((l) => l.trim()).filter(Boolean);

export default function MyVisitNote() {
  const { profileId } = useScreenParams<{ profileId: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const profile = useAppStore(selectActiveProfile);
  const [date, setDate] = useState('');
  const [complaint, setComplaint] = useState('');
  // Description boxes (design 2026-10-20); each line becomes one item in the saved note.
  const [questions, setQuestions] = useState('');
  const [labs, setLabs] = useState('');
  const [meds, setMeds] = useState('');
  const [notes, setNotes] = useState('');

  const save = () => {
    const s = useAppStore.getState();
    const at = new Date().toISOString();
    const brief: VisitBriefContent = {
      header: { name: profile?.name ?? '', whatThisIs: 'Note for the provider — written by me' },
      appointmentDate: date ? new Date(`${date}T09:00:00`).toISOString() : undefined,
      chiefComplaint: complaint, clinicalContext: notes,
      questions: lines(questions).map((text) => ({ text, why: '' })),
      labs: lines(labs).map((name) => ({ name, tier: 'primary', reason: '' })),
      medications: lines(meds).map((name) => ({ name, current: true })),
      redFlagsSummary: '', recommendation: '', disclaimer: [], status: 'placeholder',
    };
    s.addNote({ id: uid('note'), profileId: profileId ?? s.activeProfileId, kind: 'provider-brief', title: complaint.split(/[.\n]/)[0].trim() || 'Note for my visit', body: complaint, updatedAt: at, brief });
    toast('Note saved');
    pop();
  };

  return (
    <DerivedPage
      title="New note"
      composerPlaceholder="Ask Oracle about this note…"
      trailing={<IconButton icon="check" label="Save note" onClick={save} />}
    >
      <div className={styles.body} data-xref="M-9.10 · New note" data-placeholder>
        <Input label="Appointment date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Section n="1" title="What I want help with">
          <Area label="The main thing to raise" placeholder="e.g. Waking hot at 3am for about a year" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
        </Section>
        <Section n="2" title="Questions for my provider">
          <Area label="One question per line" placeholder="e.g. Could this be perimenopause?" value={questions} onChange={(e) => setQuestions(e.target.value)} />
        </Section>
        <Section n="3" title="Tests to discuss">
          <Area label="One test per line" placeholder="e.g. FSH, Free T3, Vitamin D" value={labs} onChange={(e) => setLabs(e.target.value)} />
        </Section>
        <Section n="4" title="Medicines and supplements">
          <Area label="One per line, with dose if you know it" placeholder="e.g. Magnesium glycinate 200 mg at night" value={meds} onChange={(e) => setMeds(e.target.value)} />
        </Section>
        <Section n="5" title="Your own notes (optional)">
          <Area label="Anything else to remember" placeholder="How you’ve been feeling, what to mention" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Section>
      </div>
    </DerivedPage>
  );
}
