/** On-the-fly chat widgets (also staged in context at /wid). Same patterns as V2 Conversation. */
import { useState } from 'react';
import { findProduct } from '@shared/data';
import {
  ChoicePills,
  ConfirmCard,
  FullChoicePills,
  FullChoicePillsGrid,
  HealingPlanCard,
  HomeMediaHero,
  InlineChoicePills,
  InlineConsent,
  IntakeCompletionCard,
  IntakeSectionHeader,
  MoodScale,
  NamedReasonList,
  PhoneField,
  PillDescribeField,
  PolicyUpdateConsent,
  QuestionChoices,
  RecommendationCard,
  ReminderCard,
  ScaleCheck,
  SuggestionCarousel,
  UploadCard,
  type NamedReason,
  type PhoneValue,
} from '@web/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

const noop = () => {};

function PhoneFieldDemo() {
  const [value, setValue] = useState<PhoneValue>({ countryCode: '+1', number: '' });
  return <PhoneField value={value} onChange={setValue} />;
}

function NamedReasonsDemo() {
  const [entries, setEntries] = useState<NamedReason[]>([]);
  const [none, setNone] = useState(false);
  return (
    <NamedReasonList
      label="Are you currently taking any medications (Rx or OTC)?"
      entries={entries}
      addLabel="Add medicine"
      noneSelected={none}
      namePlaceholder="e.g. Metformin"
      reasonPlaceholder="What is it for?"
      onChange={(next) => {
        setEntries(next);
        setNone(false);
      }}
      onNone={() => {
        setEntries([]);
        setNone(true);
      }}
    />
  );
}

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
  { id: 'trans-man', label: 'Trans man' },
  { id: 'trans-woman', label: 'Trans woman' },
  { id: 'intersex', label: 'Intersex' },
  { id: 'prefer-not', label: 'Prefer not to say' },
];
const GENDER = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'trans-man', label: 'Trans man' },
  { id: 'trans-woman', label: 'Trans woman' },
  { id: 'intersex', label: 'Intersex' },
  { id: 'non-binary', label: 'Non-binary' },
  { id: 'prefer-not', label: 'Prefer not to say' },
  { id: 'other', label: 'Other' },
];
const PRONOUNS = [
  { id: 'she-her', label: 'She/Her' },
  { id: 'he-him', label: 'He/Him' },
  { id: 'they-them', label: 'They/Them' },
  { id: 'she-they', label: 'She/They' },
  { id: 'he-they', label: 'He/They' },
  { id: 'any', label: 'Any pronouns' },
  { id: 'describe', label: 'Other' },
];
const STACKED = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'not-sure', label: 'Not sure' },
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

function GridOtherMorphDemo() {
  const [selected, setSelected] = useState<string>();
  const [text, setText] = useState('');
  return (
    <FullChoicePillsGrid
      label="How do you identify yourself?"
      options={GENDER}
      selected={selected}
      describeValue="other"
      describeLabel="Other"
      describePlaceholder="describe how you identify"
      describeText={text}
      onDescribeChange={setText}
      onDescribeConfirm={noop}
      onPick={setSelected}
    />
  );
}

function GridPronounsMorphDemo() {
  const [selected, setSelected] = useState<string>();
  const [text, setText] = useState('');
  return (
    <FullChoicePillsGrid
      label="What are your preferred pronouns?"
      options={PRONOUNS}
      selected={selected}
      describeValue="describe"
      describeLabel="Pronouns"
      describePlaceholder="e.g. xe/xem"
      describeText={text}
      onDescribeChange={setText}
      onDescribeConfirm={noop}
      onPick={setSelected}
    />
  );
}

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
  const typeLabel = HRT_TYPE.find((x) => x.id === type)?.label;
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
        <div className={styles.expandFollowUp}>
          <p className={styles.expandPrompt}>Please specify</p>
          <InlineChoicePills
            label="Please specify"
            options={HRT_TYPE.map((x) => x.label)}
            optionIds={HRT_TYPE.map((x) => x.id)}
            keepAnswer
            selected={typeLabel ? [typeLabel] : undefined}
            onPick={(_label, index) => {
              const opt = HRT_TYPE[index];
              if (opt) setType(opt.id);
            }}
          />
        </div>
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
        <Specimen name="FullChoicePillsGrid" path="patterns/widgets/FullChoicePillsGrid" note="Two-column intake pills for sex at birth / pronouns / gender identity. Prefer not to say always in-grid. describeValue (Other / I want to describe) sits in its grid cell until selected, then that slot spans both columns and morphs into PillDescribeField.">
          <Variant label="sex at birth"><FullChoicePillsGrid label="Sex at birth" options={SEX} onPick={noop} /></Variant>
          <Variant label="pronouns + describe morph"><GridPronounsMorphDemo /></Variant>
          <Variant label="gender + Other morph"><GridOtherMorphDemo /></Variant>
        </Specimen>
        <Specimen name="FullChoicePills" path="patterns/widgets/FullChoicePills" note="Full-width stacked intake pills. describeValue morphs that option into PillDescribeField (check inside). Field hidden until tapped. expandValues reveal “Please specify” + InlineChoicePills (HRT type).">
          <Variant label="stacked"><FullChoicePills label="Quick yes or no" options={STACKED} onPick={noop} /></Variant>
          <Variant label="describe morph"><DescribeMorphDemo /></Variant>
          <Variant label="yes details morph"><YesDetailsMorphDemo /></Variant>
          <Variant label="HRT type expand"><HrtExpandDemo /></Variant>
        </Specimen>
        <Specimen name="PillDescribeField" path="patterns/widgets/PillDescribeField" note="Reusable pill text field + circular check (ChipPicker “Add your own” look).">
          <PillDescribeField label="Describe" placeholder="describe your situation" value="" onChange={noop} onConfirm={noop} autoFocus={false} />
        </Specimen>
        <Specimen name="NamedReasonList" path="patterns/widgets/NamedReasonList" note="Meds / supplements: add pill → Sheet (Name + Reason + Add) → tiles on the main surface. NameSuggest uses medicines.json. Also staged at /wid.">
          <NamedReasonsDemo />
        </Specimen>
        <Specimen name="QuestionChoices" path="patterns/widgets/QuestionChoices" note="pills=inline (chat) vs regular (wrapping intake). Multi uses circular tick after the last pill.">
          <Variant label="inline"><QuestionChoices label="Still having periods?" options={YES_NO} onSubmit={noop} /></Variant>
          <Variant label="regular"><QuestionChoices label="Any of these?" options={MULTI} multi exclusive="none" pills="regular" onSubmit={noop} /></Variant>
        </Specimen>
        <Specimen name="MoodScale · ScaleCheck" path="patterns/widgets/MoodScale" note="One tap answers. ScaleCheck: a bare five-stop slider; release answers.">
          <MoodScale title="How are you feeling today?" onPick={noop} />
          <ScaleCheck title="How much is sleep bothering you?" low="Not at all" high="A lot" initial={4} onDone={noop} />
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
        <Specimen name="PhoneField" path="patterns/widgets/PhoneField" note="Label “Phone number (optional)”. Fixed +1; flag opens a searchable country-code bottom sheet. No OTP/SMS.">
          <PhoneFieldDemo />
        </Specimen>
        <Specimen name="IntakeCompletionCard" path="patterns/widgets/IntakeCompletionCard" note="Home intake CTA — icon, copy, progress ring.">
          <Variant label="incomplete"><IntakeCompletionCard progress={0.65} onAction={noop} /></Variant>
          <Variant label="complete"><IntakeCompletionCard progress={1} complete onAction={noop} /></Variant>
        </Specimen>
        <Specimen name="HealingPlanCard" path="patterns/widgets/HealingPlanCard" note="My Healing Plan on Home (locked + unlocked).">
          <Variant label="locked"><HealingPlanCard locked /></Variant>
          <Variant label="unlocked"><HealingPlanCard concern="Steady sleep" done={2} total={5} onPress={noop} /></Variant>
        </Specimen>
        <Specimen name="IntakeSectionHeader" path="patterns/widgets/IntakeSectionHeader" note="Section chrome for Complete Intake (M-2.14).">
          <IntakeSectionHeader title="Family history" lede="Placeholder until Dropbox questionnaires arrive." />
        </Specimen>
        <Specimen name="PolicyUpdateConsent" path="patterns/widgets/PolicyUpdateConsent" note="Returning-user re-consent when legal version bumps.">
          <PolicyUpdateConsent version="0.2-draft" onReviewTerms={noop} onReviewPrivacy={noop} onAccept={noop} />
        </Specimen>
        <Specimen name="RecommendationCard" path="patterns/widgets/RecommendationCard" note="Personalised product rail on Home.">
          {findProduct('genesis-gold') && (
            <RecommendationCard items={[{ product: findProduct('genesis-gold')!, reason: 'Fits your sleep focus' }]} onShop={noop} />
          )}
        </Specimen>
        <Specimen name="HomeMediaHero" path="patterns/widgets/HomeMediaHero" note="Compact continue hero — mauve gradient + violet bloom.">
          <HomeMediaHero titleId="ds-media" title="Ongoing tiredness and a question about thyroid function" when="4 days ago" tone="hero" artifact="violet-bloom" ctaLabel="Continue" onCta={noop} />
        </Specimen>
        <Specimen name="SuggestionCarousel" path="patterns/widgets/SuggestionCarousel" note="Next-step cards — icon · title · arrow · floral PNG.">
          <SuggestionCarousel items={[{ key: 'labs', title: 'Upload your recent labs', sub: 'She’ll read them alongside your symptoms.', tone: 'sky', artifact: 'blue-bloom', icon: 'file', onPress: noop }, { key: 'sleep', title: 'Add sleep, food, movement & stress', sub: 'Helps Deborah tailor her guidance.', tone: 'rose', artifact: 'pink-bloom', icon: 'moon', onPress: noop }]} />
        </Specimen>
      </Grid>
    </Section>
  );
}
