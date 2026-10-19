/** M-9.8 read mode: the saved visit as plain text, section by section. Empty sections are hidden. */
import { specialtyLabel } from '@shared/engine';
import type { VisitOutcome } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { IntakeSectionHeader } from '@mobile/patterns/widgets';
import { labelOf, MED_CHANGE_OPTIONS, SPECIALTY_OPTIONS, TEST_STATUS_OPTIONS } from './options';
import styles from '../LogVisit.module.css';

const Line = ({ label, text }: { label: string; text?: string }) =>
  text?.trim() ? (
    <p className={styles.line}><span className={styles.lineLabel}>{label}</span>{text}</p>
  ) : null;

export function ReadView({ visit }: { visit: VisitOutcome }) {
  const p = visit.provider;
  const kind = p.specialty === 'other' ? specialtyLabel(visit) : labelOf(SPECIALTY_OPTIONS, p.specialty);
  return (
    <>
      <section className={styles.section}>
        <IntakeSectionHeader title="Visit" />
        <Line label="Date" text={formatShortDate(visit.visitDate)} />
        <Line label="Reason" text={visit.reason} />
        <Line label="Provider" text={[kind, p.name].filter(Boolean).join(' · ')} />
        <Line label="Practice" text={p.practice} />
        <Line label="Follow-up" text={p.followUp} />
      </section>

      {(visit.takeaway.said || visit.takeaway.understanding || visit.takeaway.unanswered) && (
        <section className={styles.section}>
          <IntakeSectionHeader title="What I took away" />
          <Line label="What they told me" text={visit.takeaway.said} />
          <Line label="My understanding" text={visit.takeaway.understanding} />
          <Line label="Still unanswered" text={visit.takeaway.unanswered} />
        </section>
      )}

      {visit.tests.length > 0 && (
        <section className={styles.section}>
          <IntakeSectionHeader title="Tests ordered" />
          {visit.tests.map((t, i) => <Line key={i} label={labelOf(TEST_STATUS_OPTIONS, t.status) ?? ''} text={t.name} />)}
        </section>
      )}

      {visit.medChanges.length > 0 && (
        <section className={styles.section}>
          <IntakeSectionHeader title="Medication & supplement changes" />
          {visit.medChanges.map((m, i) => (
            <Line key={i} label={labelOf(MED_CHANGE_OPTIONS, m.change) ?? ''} text={[m.name, m.note].filter(Boolean).join(' — ')} />
          ))}
        </section>
      )}

      {visit.nextSteps.length > 0 && (
        <section className={styles.section}>
          <IntakeSectionHeader title="Next steps" />
          {visit.nextSteps.map((n, i) => <Line key={i} label={n.book ? 'To book' : 'To do'} text={n.text} />)}
        </section>
      )}

      {visit.ownNotes?.trim() && (
        <section className={styles.section}>
          <IntakeSectionHeader title="My own notes" />
          <p className={styles.notes}>{visit.ownNotes}</p>
        </section>
      )}
    </>
  );
}
