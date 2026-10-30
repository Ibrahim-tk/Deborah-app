/** M-9.8 edit mode: Visit · Provider seen · What I took away · lists · My own notes. */
import { VISIT_CHECK_THIS } from '@shared/engine';
import type { VisitOutcome } from '@shared/types/domain';
import { DateField, Input, Select } from '@mobile/ui';
import { IntakeSectionHeader } from '@mobile/patterns/widgets';
import { MED_CHANGE_OPTIONS, SPECIALTY_OPTIONS, TEST_STATUS_OPTIONS } from './options';
import { Area } from './Area';
import { RowList } from './RowList';
import type { VisitDraftUpdate } from './useVisitDraft';
import styles from '../LogVisit.module.css';

export interface EditSectionsProps {
  draft: VisitOutcome;
  update: VisitDraftUpdate;
  /** Extraction confidence by field path; low values show "Check this". */
  confidence?: Record<string, number>;
  /** Visit date can't be after today. */
  today: string;
}

const CheckThis = ({ c }: { c?: number }) => (c !== undefined && c < VISIT_CHECK_THIS ? <p className={styles.check}>Check this</p> : null);

export function EditSections({ draft, update, confidence = {}, today }: EditSectionsProps) {
  const set = (fn: (d: VisitOutcome) => void) => update((d) => { const n = structuredClone(d); fn(n); return n; });
  const year = new Date(today).getFullYear();

  return (
    <>
      <section className={styles.section}>
        <IntakeSectionHeader title="Visit" />
        <DateField
          label="Visit date"
          value={draft.visitDate ?? ''}
          minYear={year - 2}
          maxYear={year}
          defaultYear={year}
          onChange={(iso) => set((d) => { d.visitDate = iso > today ? today : iso; })}
        />
        {draft.reason && <p className={styles.meta}>Reason for the visit: {draft.reason}</p>}
      </section>

      <section className={styles.section}>
        <IntakeSectionHeader title="Provider seen" />
        <Select label="Kind of provider" options={SPECIALTY_OPTIONS} value={draft.provider.specialty} onChange={(v) => set((d) => { d.provider.specialty = v; })} />
        {!draft.provider.specialty && <p className={styles.check}>Required</p>}
        <CheckThis c={confidence['provider.specialty']} />
        {draft.provider.specialty === 'other' && (
          <>
            <Input label="What kind of provider?" value={draft.provider.specialtyOther ?? ''} onChange={(e) => set((d) => { d.provider.specialtyOther = e.target.value; })} />
            {!draft.provider.specialtyOther?.trim() && <p className={styles.check}>Required</p>}
          </>
        )}
        <Input label="Provider name (optional)" placeholder="Dr. / NP / PA name" value={draft.provider.name ?? ''} onChange={(e) => set((d) => { d.provider.name = e.target.value; })} />
        <Input label="Practice or clinic (optional)" value={draft.provider.practice ?? ''} onChange={(e) => set((d) => { d.provider.practice = e.target.value; })} />
        <Input label="Follow-up (optional)" placeholder="e.g. In 6 weeks, after labs" value={draft.provider.followUp ?? ''} onChange={(e) => set((d) => { d.provider.followUp = e.target.value; })} />
      </section>

      <section className={styles.section}>
        <IntakeSectionHeader title="What I took away" />
        <Area label="What they told me" minRows={2} value={draft.takeaway.said ?? ''} onChange={(e) => set((d) => { d.takeaway.said = e.target.value; })} />
        <CheckThis c={confidence['takeaway.said']} />
        <Area label="My own understanding (optional)" minRows={2} value={draft.takeaway.understanding ?? ''} onChange={(e) => set((d) => { d.takeaway.understanding = e.target.value; })} />
        <Area label="Still unanswered (optional)" minRows={2} value={draft.takeaway.unanswered ?? ''} onChange={(e) => set((d) => { d.takeaway.unanswered = e.target.value; })} />
      </section>

      <RowList
        title="Tests ordered"
        addLabel="Add test"
        items={draft.tests}
        nameLabel="Test"
        name={(t) => t.name}
        choice={{ label: 'Status', options: TEST_STATUS_OPTIONS, value: (t) => t.status }}
        lowConfidence={(confidence.tests ?? 1) < VISIT_CHECK_THIS}
        onAdd={() => set((d) => { d.tests.push({ name: '', status: 'ordered' }); })}
        onChange={(i, name, status) => set((d) => { d.tests[i] = { name, status: status ?? d.tests[i].status }; })}
        onRemove={(i) => set((d) => { d.tests.splice(i, 1); })}
      />

      <RowList
        title="Medication & supplement changes"
        addLabel="Add medication or supplement"
        items={draft.medChanges}
        nameLabel="Medication or supplement"
        name={(m) => m.name}
        choice={{ label: 'Change', options: MED_CHANGE_OPTIONS, value: (m) => m.change }}
        note={{ label: 'Notes (optional)', value: (m) => m.note ?? '' }}
        lowConfidence={(confidence.medChanges ?? 1) < VISIT_CHECK_THIS}
        onAdd={() => set((d) => { d.medChanges.push({ name: '', change: 'started' }); })}
        onChange={(i, name, change, note) => set((d) => { d.medChanges[i] = { name, change: change ?? d.medChanges[i].change, note: note ?? d.medChanges[i].note }; })}
        onRemove={(i) => set((d) => { d.medChanges.splice(i, 1); })}
      />

      <RowList
        title="Next steps"
        addLabel="Add next step"
        items={draft.nextSteps}
        nameLabel="Next step"
        name={(n) => n.text}
        toggle={{ label: 'I need to book this', value: (n) => !!n.book, onToggle: (i) => set((d) => { d.nextSteps[i].book = !d.nextSteps[i].book; }) }}
        onAdd={() => set((d) => { d.nextSteps.push({ text: '' }); })}
        onChange={(i, text) => set((d) => { d.nextSteps[i].text = text; })}
        onRemove={(i) => set((d) => { d.nextSteps.splice(i, 1); })}
      />

      <section className={styles.section}>
        <IntakeSectionHeader title="My own notes" />
        <Area
          label="Anything you want to remember"
          hideLabel
          minRows={3}
          placeholder="How it felt, how the provider responded, things to mention next time…"
          value={draft.ownNotes ?? ''}
          onChange={(e) => set((d) => { d.ownNotes = e.target.value; })}
        />
      </section>
    </>
  );
}
