/** My Health patterns: plan, focus, check-ins, habits, records rows, library cards, empty states. */
import { useState } from 'react';
import {
  CheckInCard, ConsultationRow, ContentCard, EmptyState, FocusCard, HabitRow, LabValueRow, NoteRow, PlanProgressCard, QuickLinks,
} from '@mobile/patterns/health';
import { libraryItems, labSampleReports } from '@shared/data';
import type { LabValue } from '@shared/types/domain';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

const noop = () => {};
const sample = Object.values(labSampleReports)[0]?.values[0];

export function HealthPatterns() {
  const [habits, setHabits] = useState([true, false]);
  const [lab, setLab] = useState<LabValue>({ id: 'l1', marker: sample?.marker ?? 'Marker', value: sample?.value ?? '0', unit: sample?.unit ?? '' });
  const [editing, setEditing] = useState(false);
  const flip = (i: number) => setHabits((h) => h.map((x, j) => (j === i ? !x : x)));
  return (
    <Section id="health" title="My Health" lede="The hub after a consultation: a 90-day plan, the current focus, gentle check-ins and records — rows and tonal cards, plain-text statuses.">
      <Grid>
        <Specimen name="PlanProgressCard · FocusCard" path="patterns/health/PlanProgressCard">
          <PlanProgressCard day={12} habitsDone={3} habitsTotal={5} onPress={noop} />
          <FocusCard topic="Sleep and night waking" dateLabel="12 Sep" summary="Calming the evening, steadying blood sugar overnight." onPress={noop} />
        </Specimen>
        <Specimen name="CheckInCard" path="patterns/health/CheckInCard" note="States: due · scheduled · unscheduled · off.">
          <Variant label="due"><CheckInCard state={{ kind: 'due' }} onCheckIn={noop} onReminders={noop} /></Variant>
          <Variant label="scheduled"><CheckInCard state={{ kind: 'scheduled', daysUntil: 4 }} upcoming="Tuesday, Oct 28 · 10:00 AM" onCheckIn={noop} onReminders={noop} /></Variant>
        </Specimen>
        <Specimen name="HabitRow · QuickLinks" path="patterns/health/HabitRow" note="Checkbox habit with a plain-text source. Counts as plain text, never a badge.">
          <div className={styles.listCard}>
            <HabitRow text="Lights low an hour before bed" done={habits[0]} source="from your answer" onToggle={() => flip(0)} onLongPress={noop} />
            <HabitRow text="Protein with breakfast" done={habits[1]} source="from your answer" onToggle={() => flip(1)} onLongPress={noop} />
          </div>
          <QuickLinks links={[{ key: 'h', label: 'History', icon: 'chat', count: 4 }, { key: 'n', label: 'Visit Notes', icon: 'note', count: 2 }, { key: 'l', label: 'Labs', icon: 'labs', count: 1 }]} onSelect={noop} />
        </Specimen>
        <Specimen name="ConsultationRow · NoteRow · LabValueRow" path="patterns/health/ConsultationRow" note="Records rows: topic, date and status on one subtitle line. Lab values edit in place (tap the pencil).">
          <div className={styles.listCard}>
            <ConsultationRow topic="Sleep and night waking" date="12 Sep" status="answered" withLabs onPress={noop} />
            <ConsultationRow topic="Afternoon energy" date="3 Oct" status="in-progress" onPress={noop} />
            <NoteRow title="Questions for my visit" kind="questions" updated="5 Oct" body="Ask about timing of evening routine." onPress={noop} />
            <LabValueRow value={lab} editing={editing} onEdit={() => setEditing(true)} onDone={() => setEditing(false)} onDelete={noop}
              onChange={(p) => setLab((l) => ({ ...l, ...p, edited: true }))} />
          </div>
        </Specimen>
        <Specimen name="ContentCard" path="patterns/health/ContentCard" note="Library item as a tonal note card.">
          {libraryItems.slice(0, 2).map((item) => <div key={item.id} data-placeholder><ContentCard item={item} reason="Because you asked about sleep" onPress={noop} /></div>)}
        </Specimen>
        <Specimen name="EmptyState" path="patterns/health/EmptyState" note="title-2 invitation, one line of callout, one primary button.">
          <EmptyState icon="note" title="No notes yet" text="Save an answer or jot down questions for your visit." actionLabel="Ask Deborah" actionIcon="chat" onAction={noop} />
        </Specimen>
      </Grid>
    </Section>
  );
}
