/** On-the-fly chat widgets (also staged in context at /wid). Same patterns as V2 Conversation. */
import { useState } from 'react';
import { findProduct } from '@shared/data';
import {
  ChoicePills,
  HealingPlanCard,
  HomeMediaHero,
  InlineChoicePills,
  IntakeCompletionCard,
  MoodScale,
  NamedReasonList,
  PillDescribeField,
  PolicyUpdateConsent,
  QuestionChoices,
  RecommendationCard,
  ScaleCheck,
  SuggestionCarousel,
  type NamedReason,
} from '@web/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const noop = () => {};

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

export function WidgetPatterns() {
  return (
    <Section id="widgets" title="Chat widgets" lede={<>Small interactive cards the Oracle drops into the thread. Same <code>patterns/widgets</code> as V2 chat — edit once, see it in <code>/wid?flow=v2</code> and Conversation.</>}>
      <Grid>
        <Specimen name="InlineChoicePills" path="patterns/widgets/InlineChoicePills" note="Compact 34px chat pills.">
          <InlineChoicePills label="Still having periods?" options={['Yes', 'No', 'Not sure']} onPick={noop} keepAnswer />
        </Specimen>
        <Specimen name="ChoicePills" path="patterns/widgets/ChoicePills" note="Regular 44px wrapping intake pills.">
          <ChoicePills label="Any of these?" options={['Hot flashes', 'Night sweats', 'Brain fog', 'None of these']} onPick={noop} keepAnswer />
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
        <Specimen name="IntakeCompletionCard" path="patterns/widgets/IntakeCompletionCard" note="Home intake CTA — icon, copy, progress ring.">
          <Variant label="incomplete"><IntakeCompletionCard progress={0.65} onAction={noop} /></Variant>
          <Variant label="complete"><IntakeCompletionCard progress={1} complete onAction={noop} /></Variant>
        </Specimen>
        <Specimen name="HealingPlanCard" path="patterns/widgets/HealingPlanCard" note="Your Wellness Plan on Home (locked + unlocked).">
          <Variant label="locked"><HealingPlanCard locked /></Variant>
          <Variant label="unlocked"><HealingPlanCard concern="Steady sleep" done={2} total={5} onPress={noop} /></Variant>
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
          <HomeMediaHero titleId="ds-media" eyebrow="Continue your conversation" title="Thyroid and tiredness" tone="hero" artifact="violet-bloom" ctaLabel="Continue" onCta={noop} />
        </Specimen>
        <Specimen name="SuggestionCarousel" path="patterns/widgets/SuggestionCarousel" note="Next-step cards — icon · title · arrow · floral PNG.">
          <SuggestionCarousel items={[{ key: 'labs', title: 'Upload your recent labs', sub: 'She’ll read them alongside your symptoms.', tone: 'sky', artifact: 'blue-bloom', icon: 'file', onPress: noop }, { key: 'sleep', title: 'Add sleep, food, movement & stress', sub: 'Helps the Oracle tailor her guidance.', tone: 'rose', artifact: 'pink-bloom', icon: 'moon', onPress: noop }]} />
        </Specimen>
      </Grid>
    </Section>
  );
}
