/** On-the-fly chat widgets (also staged in context at /wid). */
import { useState } from 'react';
import {
  BookDeborah,
  ChoicePills,
  ConfirmCard,
  FullChoicePills,
  InlineChoicePills,
  InlineConsent,
  MoodScale,
  PillDescribeField,
  ReminderCard,
  ScaleCheck,
  UploadCard,
} from '@flow-v1/apps/mobile/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const noop = () => {};

const SEX = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'intersex', label: 'Intersex' },
];
const PERIODS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'describe', label: 'I’m not sure / I want to describe' },
];
const BLOCKERS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];

function DescribeMorphDemo() {
  const [selected, setSelected] = useState<string>();
  const [text, setText] = useState('');
  return (
    <FullChoicePills
      label="Have your periods started?"
      options={PERIODS}
      selected={selected}
      describeValue="describe"
      describePlaceholder="describe your situation"
      describeText={text}
      onDescribeChange={setText}
      onDescribeConfirm={noop}
      onPick={setSelected}
    />
  );
}

function YesDetailsMorphDemo() {
  const [selected, setSelected] = useState<string>();
  const [text, setText] = useState('');
  return (
    <FullChoicePills
      label="Using any puberty blockers?"
      options={BLOCKERS}
      selected={selected}
      describeValue="yes"
      describeLabel="Details"
      describePlaceholder="details of puberty blocker"
      describeText={text}
      onDescribeChange={setText}
      onDescribeConfirm={noop}
      onPick={setSelected}
    />
  );
}

export function WidgetPatterns() {
  const [picked, setPicked] = useState<string[]>(['Hot flashes']);
  const toggle = (o: string) => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  return (
    <Section id="widgets" title="Chat widgets" lede={<>Small interactive cards Deborah drops into the thread. See them in a live conversation in the widget lab at <code>/wid</code>.</>}>
      <Grid>
        <Specimen name="InlineConsent" path="patterns/widgets/InlineConsent" note="Health-data consent inline in the chat. Variant row (chosen 2026-10-14).">
          <Variant label="row"><InlineConsent onAgree={noop} onDecline={noop} /></Variant>
          <Variant label="answered"><InlineConsent onAgree={noop} onDecline={noop} answered="agreed" /></Variant>
        </Specimen>
        <Specimen name="InlineChoicePills" path="patterns/widgets/InlineChoicePills" note="Compact 34px chat pills.">
          <InlineChoicePills label="Still having periods?" options={['Yes', 'No', 'Not sure']} onPick={noop} keepAnswer />
        </Specimen>
        <Specimen name="ChoicePills" path="patterns/widgets/ChoicePills" note="OPEN: frosted short-answer pills are a widget-lab exploration outside DESIGN.md’s no-pills rule.">
          <Variant label="single"><ChoicePills label="Still having periods?" options={['Yes', 'No', 'Not sure']} onPick={noop} keepAnswer /></Variant>
          <Variant label="multi">
            <ChoicePills label="Any of these?" options={['Hot flashes', 'Night sweats', 'Brain fog']} onPick={noop} selected={picked} onToggle={toggle} />
          </Variant>
        </Specimen>
        <Specimen name="FullChoicePills" path="patterns/widgets/FullChoicePills" note="Full-width stacked intake pills. describeValue morphs into PillDescribeField (check inside). Field hidden until tapped.">
          <Variant label="stacked"><FullChoicePills label="Sex at birth" options={SEX} onPick={noop} /></Variant>
          <Variant label="describe morph"><DescribeMorphDemo /></Variant>
          <Variant label="yes details morph"><YesDetailsMorphDemo /></Variant>
        </Specimen>
        <Specimen name="PillDescribeField" path="patterns/widgets/PillDescribeField" note="Reusable pill text field + circular check (ChipPicker “Add your own” look).">
          <PillDescribeField label="Describe" placeholder="describe your situation" value="" onChange={noop} onConfirm={noop} autoFocus={false} />
        </Specimen>
        <Specimen name="MoodScale · ScaleCheck" path="patterns/widgets/MoodScale" note="One tap answers. ScaleCheck: 0–10 in one compact row.">
          <MoodScale title="How are you feeling today?" onPick={noop} />
          <ScaleCheck title="How much is sleep bothering you?" low="Not at all" high="A lot" initial={6} onDone={noop} />
        </Specimen>
        <Specimen name="BookDeborah" path="patterns/widgets/BookDeborah" note="Tile CTA → small sheet: team notified, they’ll contact you. No calendar.">
          <BookDeborah onRequest={noop} />
        </Specimen>
        <Specimen name="ConfirmCard · ReminderCard" path="patterns/widgets/ConfirmCard" note="Dark glass confirm for actions with consequences; reminder with an on/off switch.">
          <Variant label="ConfirmCard">
            <ConfirmCard eyebrow="Confirm purchase" icon="shop" title="Genesis Gold" value="$48" detail="One-time · Ships in 2 days" detailValue="Card ending 4242" confirmedText="Ordered. You’ll get a confirmation." onConfirm={noop} onCancel={noop} />
          </Variant>
          <Variant label="ReminderCard"><ReminderCard what="Evening wind-down" when="Every day · 9:00 PM" onChange={noop} /></Variant>
        </Specimen>
        <Specimen name="UploadCard" path="patterns/widgets/UploadCard" note="Dashed drop area with a simulated upload (no network).">
          <UploadCard onUploaded={noop} />
        </Specimen>
      </Grid>
    </Section>
  );
}
