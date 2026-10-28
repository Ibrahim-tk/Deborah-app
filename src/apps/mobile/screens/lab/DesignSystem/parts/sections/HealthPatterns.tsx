/** My Health patterns used in V2 product screens. */
import { useState } from 'react';
import {
  CheckInCard, ConsultationRow, ContentCard, EmptyState, FocusCard, HabitRow,
  LabValueRow, PlanProgressCard,
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
    <Section id="health" title="My Health" lede="Hub after a consultation: plan, focus, check-ins, habits and records — patterns V2 screens import.">
      <Grid>
        <Specimen name="PlanProgressCard · FocusCard" path="patterns/health/PlanProgressCard">
          <PlanProgressCard day={12} habitsDone={3} habitsTotal={5} onPress={noop} />
          <FocusCard topic="Sleep and night waking" dateLabel="12 Sep" summary="Calming the evening, steadying blood sugar overnight." onPress={noop} />
        </Specimen>
        <Specimen name="CheckInCard" path="patterns/health/CheckInCard" note="States: due · scheduled · unscheduled · off.">
          <Variant label="due"><CheckInCard state={{ kind: 'due' }} onCheckIn={noop} onReminders={noop} /></Variant>
          <Variant label="scheduled"><CheckInCard state={{ kind: 'scheduled', daysUntil: 4 }} upcoming="Tuesday, Oct 28 · 10:00 AM" onCheckIn={noop} onReminders={noop} /></Variant>
        </Specimen>
        <Specimen name="HabitRow" path="patterns/health/HabitRow" note="Checkbox habit with a plain-text source.">
          <div className={styles.listCard}>
            <HabitRow text="Lights low an hour before bed" done={habits[0]} source="from your answer" onToggle={() => flip(0)} onLongPress={noop} />
            <HabitRow text="Protein with breakfast" done={habits[1]} source="from your answer" onToggle={() => flip(1)} onLongPress={noop} />
          </div>
        </Specimen>
        <Specimen name="ConsultationRow · LabValueRow" path="patterns/health/ConsultationRow" note="Records rows; lab values edit in place.">
          <div className={styles.listCard}>
            <ConsultationRow topic="Sleep and night waking" date="12 Sep" status="answered" withLabs onPress={noop} />
            <ConsultationRow topic="Afternoon energy" date="3 Oct" status="in-progress" onPress={noop} />
            <LabValueRow value={lab} editing={editing} onEdit={() => setEditing(true)} onDone={() => setEditing(false)} onDelete={noop}
              onChange={(p) => setLab((l) => ({ ...l, ...p, edited: true }))} />
          </div>
        </Specimen>
        <Specimen name="ContentCard" path="patterns/health/ContentCard" note="Horizontal tonal card: body title left, rounded cover right.">
          {libraryItems.slice(0, 2).map((item) => <div key={item.id} data-placeholder><ContentCard item={item} reason="Because you asked about sleep" onPress={noop} /></div>)}
        </Specimen>
        <Specimen name="EmptyState" path="patterns/health/EmptyState" note="title-2 invitation, one line of callout, one primary button.">
          <EmptyState icon="note" title="No notes yet" text="Save an answer or jot down questions for your visit." actionLabel="Ask Oracle" actionIcon="chat" onAction={noop} />
        </Specimen>
      </Grid>
    </Section>
  );
}
