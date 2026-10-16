/** On-the-fly chat widgets (also staged in context at /wid). Same patterns as V2 Conversation. */
import { useState } from 'react';
import { BookDeborah, ChoicePills, ConfirmCard, FullChoicePills, InlineChoicePills, InlineConsent, MoodScale, PillDescribeField, QuestionChoices, ReminderCard, ScaleCheck, UploadCard } from '@mobile/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

const noop = () => {};

const YES_NO = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'not-sure', label: 'Not sure' },
];
const MULTI = [
  { id: 'hot-flashes', label: 'Hot flashes' },
  { id: 'night-sweats', label: 'Night sweats' },
  { id: 'brain-fog', label: 'Brain fog' },
  { id: 'none', label: 'None of these' },
];
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
const HRT_STATUS = [
  { id: 'yes', label: 'Yes' },
  { id: 'yes-previously', label: 'Yes, Previously' },
  { id: 'no', label: 'No' },
];
const HRT_TYPE = [
  { id: 'estrogen-only', label: 'Estrogen only' },
  { id: 'combined', label: 'Combined' },
  { id: 'progesterone-only', label: 'Progesterone only' },
  { id: 'other', label: 'Other / not sure' },
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

function HrtExpandDemo() {
  const [status, setStatus] = useState<string>();
  const [type, setType] = useState<string>();
  const expanding = status === 'yes' || status === 'yes-previously';
  return (
    <div className={styles.expandStack}>
      <FullChoicePills
        label="Are you currently on hormone therapy (HRT)?"
        options={HRT_STATUS}
        selected={status}
        onPick={(id) => {
          setStatus(id);
          setType(undefined);
        }}
      />
      {expanding && (
        <FullChoicePills
          label="What type of HRT?"
          options={HRT_TYPE}
          selected={type}
          onPick={setType}
        />
      )}
    </div>
  );
}

export function WidgetPatterns() {
  return (
    <Section id="widgets" title="Chat widgets" lede={<>Small interactive cards Deborah drops into the thread. Same <code>patterns/widgets</code> as V2 chat — edit once, see it in <code>/wid?flow=v2</code> and Conversation.</>}>
      <Grid>
        <Specimen name="InlineConsent" path="patterns/widgets/InlineConsent" note="Health-data consent inline in the chat. Variant row (chosen 2026-10-14).">
          <Variant label="row"><InlineConsent onAgree={noop} onDecline={noop} /></Variant>
          <Variant label="answered"><InlineConsent onAgree={noop} onDecline={noop} answered="agreed" /></Variant>
        </Specimen>
        <Specimen name="InlineChoicePills" path="patterns/widgets/InlineChoicePills" note="Compact 34px chat pills.">
          <InlineChoicePills label="Still having periods?" options={['Yes', 'No', 'Not sure']} onPick={noop} keepAnswer />
        </Specimen>
        <Specimen name="ChoicePills" path="patterns/widgets/ChoicePills" note="Regular 44px wrapping intake pills.">
          <ChoicePills label="Any of these?" options={['Hot flashes', 'Night sweats', 'Brain fog', 'None of these']} onPick={noop} keepAnswer />
        </Specimen>
        <Specimen name="FullChoicePills" path="patterns/widgets/FullChoicePills" note="Full-width stacked intake pills. describeValue morphs that option into PillDescribeField (check inside). Field hidden until tapped. expandValues reveal a second FullChoicePills (HRT type).">
          <Variant label="stacked"><FullChoicePills label="Sex at birth" options={SEX} onPick={noop} /></Variant>
          <Variant label="describe morph"><DescribeMorphDemo /></Variant>
          <Variant label="yes details morph"><YesDetailsMorphDemo /></Variant>
          <Variant label="HRT type expand"><HrtExpandDemo /></Variant>
        </Specimen>
        <Specimen name="PillDescribeField" path="patterns/widgets/PillDescribeField" note="Reusable pill text field + circular check (ChipPicker “Add your own” look).">
          <PillDescribeField label="Describe" placeholder="describe your situation" value="" onChange={noop} onConfirm={noop} autoFocus={false} />
        </Specimen>
        <Specimen name="QuestionChoices" path="patterns/widgets/QuestionChoices" note="pills=inline (chat) vs regular (wrapping intake). Multi uses circular tick after the last pill.">
          <Variant label="inline"><QuestionChoices label="Still having periods?" options={YES_NO} onSubmit={noop} /></Variant>
          <Variant label="regular"><QuestionChoices label="Any of these?" options={MULTI} multi exclusive="none" pills="regular" onSubmit={noop} /></Variant>
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
