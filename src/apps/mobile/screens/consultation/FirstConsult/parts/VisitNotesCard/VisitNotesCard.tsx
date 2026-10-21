/**
 * Generative visit-notes card (design 2026-10-21, receipt-card reference): a thumbnail and title, then plain
 * label/value facts — provider, appointment, what's in the notes — and two small buttons. No badge (DESIGN.md).
 */
import { formatShortDate } from '@shared/utils';
import { Button, Icon } from '@mobile/ui';
import type { Appointment } from '../AppointmentForm';
import styles from './VisitNotesCard.module.css';

export interface VisitNotesCardProps {
  title: string;
  appointment?: Appointment;
  /** e.g. "4 questions · 2 tests to ask about". */
  summary: string;
  onOpen: () => void;
  onPdf: () => void;
}

export function VisitNotesCard({ title, appointment, summary, onOpen, onPdf }: VisitNotesCardProps) {
  const facts = [
    appointment && { label: 'Provider', value: appointment.provider || 'Not added yet' },
    appointment && { label: 'Appointment', value: formatShortDate(appointment.date) },
    { label: 'Visit notes', value: summary },
  ].filter(Boolean) as { label: string; value: string }[];
  return (
    <section className={styles.root} aria-label={title}>
      <div className={styles.head}>
        <span className={styles.thumb} aria-hidden><Icon name="note" size={24} /></span>
        <div className={styles.titles}>
          <p className={styles.title}>{title}</p>
          <p className={styles.sub}>Ready to review</p>
        </div>
      </div>
      <dl className={styles.facts}>
        {facts.map((f) => (
          <div key={f.label} className={styles.fact}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.actions}>
        <Button size="sm" fullWidth leadingIcon="note" onClick={onOpen}>Open notes</Button>
        <Button size="sm" variant="secondary" fullWidth onClick={onPdf}>Save PDF</Button>
      </div>
    </section>
  );
}
