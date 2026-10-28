/**
 * One widget in the lab thread. Uses the same `@web/patterns/widgets` as Conversation /
 * IntakeQuestion / FlowChoice so edits here and in V2 chat stay one source of truth.
 * `reply` lets the widget answer as the user and get Deborah's follow-up.
 */
import { useState } from 'react';
import { findProduct, firstConsultFlow } from '@shared/data';
import { briefFromAnswer, personalise } from '@shared/engine';
import { Button, Panel } from '@web/ui';
import { AnswerSections } from '@web/patterns/chat';
import { ProductCard } from '@web/patterns/commerce';
import { LabInsightCard, LabMetricCard } from '@web/patterns/health';
import { EmergencyInterrupt } from '@web/patterns/safety';
import {
  BookDeborah,
  ChoicePills,
  DestinationTilePair,
  FullChoicePills,
  FullChoicePillsGrid,
  GlassCareStrip,
  HealingPlanCard,
  HealingPlanSection,
  HomeMediaHero,
  InlineChoicePills,
  InlineConsent,
  IntakeCompletionCard,
  IntakeSectionHeader,
  LinkStatusCard,
  MoodScale,
  NamedReasonList,
  NextIntentList,
  PhoneField,
  PhotoDestinationPair,
  PolicyUpdateConsent,
  PrimaryIntentCard,
  PromptStarterList,
  QuestionChoices,
  RecommendationCard,
  ScaleCheck,
  SuggestionCarousel,
  TodayHabitsCard,
  UploadCard,
  type NamedReason,
  type PhoneValue,
} from '@web/patterns/widgets';
import { buildAnswer, visitPrepItems } from '@web/screens/consultation/FirstConsult/parts/buildAnswer';
import { VisitPrepCard } from '@web/screens/consultation/FirstConsult/parts/VisitPrepCard';
import { BriefDocument } from '@web/screens/records/VisitBrief/parts/BriefDocument';
import { GENDER_IDENTITY_OPTIONS, HRT_STATUS_OPTIONS, HRT_TYPE_OPTIONS, MULTI_OPTIONS, PERIODS_DESCRIBE_OPTIONS, PRONOUN_OPTIONS, PUBERTY_BLOCKERS_OPTIONS, REGULAR_PILL_LABELS, SEX_AT_BIRTH_OPTIONS, STACKED_YES_NO_OPTIONS, YES_NO_OPTIONS, type WidgetKind } from './scenarios';
import styles from './WidgetLab.module.css';

const say = (s?: string) => personalise(firstConsultFlow, s, 'Maria');
const ANSWER = buildAnswer(firstConsultFlow.nodes.answer_1, say);
const PREP = visitPrepItems(firstConsultFlow.nodes.answer_1);
const DEMO_PROFILE = {
  id: 'p-lab',
  name: 'Maria',
  relationship: 'self' as const,
  intake: { conditions: [], medications: ['none'], genesisGold: 'yes' as const },
  createdAt: '2026-10-01T00:00:00Z',
  health: { birthYear: { value: 1978, source: 'manual' as const, updatedAt: '2026-10-01T00:00:00Z' } },
};
const DEMO_BRIEF = briefFromAnswer(DEMO_PROFILE, ANSWER, 'Sleep and night waking');

export interface LabWidgetProps {
  kind: WidgetKind;
  /** The user's answer (shown as her bubble) and Deborah's short follow-up. */
  reply: (userText: string | undefined, deborah: string) => void;
}

const labelOf = (ids: string[], options: { id: string; label: string }[]) =>
  ids.map((id) => options.find((o) => o.id === id)?.label).filter(Boolean).join(', ');

const noop = () => undefined;

export function LabWidget({ kind, reply }: LabWidgetProps) {
  const [consent, setConsent] = useState<'agreed' | 'declined'>();
  const [sexAtBirth, setSexAtBirth] = useState<string>();
  const [genderId, setGenderId] = useState<string>();
  const [genderOther, setGenderOther] = useState('');
  const [pronounId, setPronounId] = useState<string>();
  const [pronounOther, setPronounOther] = useState('');
  const [stackedPick, setStackedPick] = useState<string>();
  const [periodsPick, setPeriodsPick] = useState<string>();
  const [periodsNotes, setPeriodsNotes] = useState('');
  const [blockersPick, setBlockersPick] = useState<string>();
  const [blockersDetails, setBlockersDetails] = useState('');
  const [hrtStatus, setHrtStatus] = useState<string>();
  const [hrtType, setHrtType] = useState<string>();
  const [meds, setMeds] = useState<NamedReason[]>([]);
  const [medsNone, setMedsNone] = useState(false);
  const [supps, setSupps] = useState<NamedReason[]>([]);
  const [suppsNone, setSuppsNone] = useState(false);
  const [phone, setPhone] = useState<PhoneValue>({ countryCode: '+1', number: '' });
  switch (kind) {
    case 'consent':
      return <InlineConsent answered={consent} onAgree={() => { setConsent('agreed'); reply(undefined, 'Thank you. Tell me what’s on your mind.'); }} onDecline={() => setConsent('declined')} />;
    case 'yesno':
      return (
        <QuestionChoices
          label="Answer"
          options={YES_NO_OPTIONS}
          onSubmit={(ids) => {
            const o = labelOf(ids, YES_NO_OPTIONS);
            reply(o, o === 'Yes' ? 'That points me towards your hormones and temperature control.' : 'Good to know, that rules a few things out.');
          }}
        />
      );
    case 'multi':
      return (
        <QuestionChoices
          label="Symptoms"
          options={MULTI_OPTIONS}
          multi
          exclusive="none"
          confirm="tick"
          onSubmit={(ids) => reply(labelOf(ids, MULTI_OPTIONS), 'Thank you, that helps me see the pattern.')}
        />
      );
    case 'pillsInline':
      return (
        <InlineChoicePills
          label="Answer"
          options={YES_NO_OPTIONS.map((o) => o.label)}
          keepAnswer
          onPick={(o) => reply(o, o === 'Yes' ? 'That points me towards your hormones and temperature control.' : 'Good to know, that rules a few things out.')}
        />
      );
    case 'pillsRegular':
      return (
        <ChoicePills
          label="Symptoms"
          options={REGULAR_PILL_LABELS}
          keepAnswer
          onPick={(o) => reply(o, 'Thank you — these are the regular intake pills.')}
        />
      );
    case 'pillsFullGrid':
      return (
        <FullChoicePillsGrid
          label="Sex at birth"
          options={SEX_AT_BIRTH_OPTIONS}
          selected={sexAtBirth}
          onPick={(id) => {
            setSexAtBirth(id);
            const o = SEX_AT_BIRTH_OPTIONS.find((x) => x.id === id)?.label ?? id;
            reply(o, 'Got it — 2-col grid; Prefer not to say stays in the grid.');
          }}
        />
      );
    case 'pillsFullGridOther':
      return (
        <FullChoicePillsGrid
          label="How do you identify yourself?"
          options={GENDER_IDENTITY_OPTIONS}
          selected={genderId}
          describeValue="other"
          describeLabel="Other"
          describePlaceholder="describe how you identify"
          describeText={genderOther}
          onDescribeChange={setGenderOther}
          onDescribeConfirm={() => {
            const note = genderOther.trim();
            reply(note || 'Other', 'Got it — Other spanned full-width while describing; pick another option to collapse it back.');
          }}
          onPick={(id) => {
            setGenderId(id);
            if (id === 'other') return;
            const o = GENDER_IDENTITY_OPTIONS.find((x) => x.id === id)?.label ?? id;
            reply(o, 'Got it — Other sits in-grid until tapped; then spans both columns.');
          }}
        />
      );
    case 'pillsFullGridPronouns':
      return (
        <FullChoicePillsGrid
          label="What are your preferred pronouns?"
          options={PRONOUN_OPTIONS}
          selected={pronounId}
          describeValue="describe"
          describeLabel="Pronouns"
          describePlaceholder="e.g. xe/xem"
          describeText={pronounOther}
          onDescribeChange={setPronounOther}
          onDescribeConfirm={() => {
            const note = pronounOther.trim();
            reply(note || 'Other', 'Got it — describe spanned full-width; pick another option to collapse it back.');
          }}
          onPick={(id) => {
            setPronounId(id);
            if (id === 'describe') return;
            const o = PRONOUN_OPTIONS.find((x) => x.id === id)?.label ?? id;
            reply(o, 'Got it — “Other” sits in-grid until tapped; then spans both columns.');
          }}
        />
      );
    case 'pillsFull':
      return (
        <FullChoicePills
          label="Quick yes or no"
          options={STACKED_YES_NO_OPTIONS}
          selected={stackedPick}
          onPick={(id) => {
            setStackedPick(id);
            const o = STACKED_YES_NO_OPTIONS.find((x) => x.id === id)?.label ?? id;
            reply(o, 'Got it — full-width stacked options for short lists.');
          }}
        />
      );
    case 'pillsFullDescribe':
      return (
        <FullChoicePills
          label="Have your periods started?"
          options={PERIODS_DESCRIBE_OPTIONS}
          selected={periodsPick}
          describeValue="describe"
          describeLabel="Describe"
          describePlaceholder="describe your situation"
          describeText={periodsNotes}
          onDescribeChange={setPeriodsNotes}
          onDescribeConfirm={() => {
            const note = periodsNotes.trim();
            reply(note || 'I’m not sure / I want to describe', 'Got it — describe morph with ChipPicker-style check.');
          }}
          onPick={(id) => {
            setPeriodsPick(id);
            if (id === 'describe') return;
            const o = PERIODS_DESCRIBE_OPTIONS.find((x) => x.id === id)?.label ?? id;
            reply(o, 'Got it — Yes/No advance; “I’m not sure” becomes a field with check.');
          }}
        />
      );
    case 'pillsFullYesDetails':
      return (
        <FullChoicePills
          label="Using any puberty blockers?"
          options={PUBERTY_BLOCKERS_OPTIONS}
          selected={blockersPick}
          describeValue="yes"
          describeLabel="Details"
          describePlaceholder="details of puberty blocker"
          describeText={blockersDetails}
          onDescribeChange={setBlockersDetails}
          onDescribeConfirm={() => {
            const note = blockersDetails.trim();
            reply(note || 'Yes', 'Got it — Yes opens details + check; No advances.');
          }}
          onPick={(id) => {
            setBlockersPick(id);
            if (id === 'yes') return;
            reply('No', 'Got it — No advances; Yes morphs into a details field.');
          }}
        />
      );
    case 'pillsFullExpand': {
      const expanding = hrtStatus === 'yes' || hrtStatus === 'yes-previously';
      const typeLabel = HRT_TYPE_OPTIONS.find((x) => x.id === hrtType)?.label;
      return (
        <div className={styles.expandStack}>
          <FullChoicePills
            label="Are you currently on hormone therapy (HRT)?"
            options={HRT_STATUS_OPTIONS}
            selected={hrtStatus}
            onPick={(id) => {
              setHrtStatus(id);
              setHrtType(undefined);
              if (id === 'no') reply('No', 'Got it — No skips HRT type and goes on to meds.');
            }}
          />
          {expanding && (
            <div className={styles.expandFollowUp}>
              <p className={styles.expandPrompt}>Please specify</p>
              <InlineChoicePills
                label="Please specify"
                options={HRT_TYPE_OPTIONS.map((x) => x.label)}
                optionIds={HRT_TYPE_OPTIONS.map((x) => x.id)}
                keepAnswer
                selected={typeLabel ? [typeLabel] : undefined}
                onPick={(_label, index) => {
                  const opt = HRT_TYPE_OPTIONS[index];
                  if (!opt) return;
                  setHrtType(opt.id);
                  const status = HRT_STATUS_OPTIONS.find((x) => x.id === hrtStatus)?.label ?? hrtStatus;
                  reply(`${status} · ${opt.label}`, 'Got it — Yes / Yes Previously expand inline type pills.');
                }}
              />
            </div>
          )}
        </div>
      );
    }
    case 'namedReasons':
      return (
        <NamedReasonList
          label="Are you currently taking any medications (Rx or OTC)?"
          entries={meds}
          addLabel="Add medicine"
          noneSelected={medsNone}
          namePlaceholder="e.g. Metformin"
          reasonPlaceholder="What is it for?"
          onChange={(entries) => {
            const added = entries.length > meds.length;
            setMeds(entries);
            setMedsNone(false);
            if (added) {
              const last = entries[entries.length - 1];
              reply(
                last ? (last.reason ? `${last.name} (${last.reason})` : last.name) : 'Added',
                'Got it — add pill opens a sheet; tiles land on the main surface.',
              );
            }
          }}
          onNone={() => {
            setMeds([]);
            setMedsNone(true);
            reply("I don't take any", 'Okay — quiet escape still advances without a sheet.');
          }}
        />
      );
    case 'namedReasonsSupplements':
      return (
        <NamedReasonList
          label="Are you currently taking any supplements?"
          entries={supps}
          addLabel="Add supplement"
          noneSelected={suppsNone}
          namePlaceholder="e.g. Magnesium"
          reasonPlaceholder="What is it for?"
          onChange={(entries) => {
            const added = entries.length > supps.length;
            setSupps(entries);
            setSuppsNone(false);
            if (added) {
              const last = entries[entries.length - 1];
              reply(
                last ? (last.reason ? `${last.name} (${last.reason})` : last.name) : 'Added',
                'Same NamedReasonList widget — supplements use Add supplement.',
              );
            }
          }}
          onNone={() => {
            setSupps([]);
            setSuppsNone(true);
            reply("I don't take any", 'Okay — no supplements noted.');
          }}
        />
      );
    case 'scale':
      return <ScaleCheck title="Energy today" low="Empty" high="Full" words={['Empty', 'Low', 'Okay', 'Good', 'Full']} onDone={(v, word) => reply(word, v < 3 ? 'Low energy and broken sleep often travel together.' : 'Glad your energy is holding up.')} />;
    case 'mood':
      return <MoodScale title="This week" onPick={(m) => reply(m, 'Thank you for telling me.')} />;
    case 'answer':
      return <AnswerSections answer={ANSWER} wordSlot={<Button variant="secondary" leadingIcon="note" fullWidth onClick={() => reply(undefined, 'Saved to your Visit notes.')}>Save to Visit notes</Button>} />;
    case 'product': {
      const product = findProduct('genesis-gold');
      return product && ANSWER.product ? <ProductCard product={product} productRef={ANSWER.product} onShop={() => reply(undefined, 'Opening the shop (simulated).')} /> : null;
    }
    case 'slots':
      return <BookDeborah onRequest={() => reply(undefined, 'I’ve let the team know. They’ll be in touch soon to set up a time.')} />;
    case 'upload':
      return <UploadCard onUploaded={(f) => reply(`Uploaded ${f}`, 'Got it. I’ll read your thyroid markers alongside your sleep.')} />;
    case 'tip':
      return <Panel tone="lilac" icon="check">Keep the bedroom cool, around 18 °C, and have a glass of water by the bed.</Panel>;
    case 'prep':
      return <VisitPrepCard title="For my next appointment" questions={PREP.questions} tests={PREP.tests} onShare={() => reply(undefined, 'PDF ready to share (simulated).')} onSave={() => reply(undefined, 'Saved to My Visit Notes (opens M-9.7 in the app).')} />;
    case 'brief':
      return <BriefDocument brief={DEMO_BRIEF} />;
    case 'emergency':
      return <EmergencyInterrupt title="Please get help now" body="If this is happening now, call emergency services." onCall={() => reply(undefined, 'Calling 911 (simulated).')} onFindER={() => reply(undefined, 'Finding care near you (simulated).')} onSafe={() => reply('I’m safe', 'Thank you. Let’s keep talking.')} />;
    case 'phone':
      return <PhoneField value={phone} onChange={(v) => { setPhone(v); if (v.number.length > 6) reply(`${v.countryCode} ${v.number}`, 'Thanks — optional contact only.'); }} />;
    case 'intakeCompletion':
      return <IntakeCompletionCard progress={0.65} onAction={() => reply(undefined, 'Opening Complete Intake (M-2.14).')} />;
    case 'healingPlanLocked':
      return <HealingPlanCard locked />;
    case 'healingPlan':
      return <HealingPlanCard concern="Steady sleep and calmer evenings" done={2} total={5} onPress={() => reply(undefined, 'Opening Your Wellness Plan (M-7.3).')} />;
    case 'intakeSection':
      return <IntakeSectionHeader title="Family history" lede="Placeholder until Dropbox questionnaires arrive." />;
    case 'healingSection':
      return <HealingPlanSection title="Immediate priorities"><p>Wind down 30 minutes earlier tonight.</p></HealingPlanSection>;
    case 'policyUpdate':
      return <PolicyUpdateConsent version="0.2-draft" onReviewTerms={noop} onReviewPrivacy={noop} onAccept={() => reply(undefined, 'Terms accepted.')} />;
    case 'primaryIntent':
      return (
        <PrimaryIntentCard titleId="lab-intent" title="Sleep and night waking" body="Last chat · 3 days ago" kicker="Continue with the Oracle" kickerIcon="chat">
          <Button fullWidth onClick={() => reply(undefined, 'Opening chat…')}>Continue</Button>
        </PrimaryIntentCard>
      );
    case 'promptStarters':
      return (
        <PromptStarterList
          items={[
            { label: 'I’ve been feeling tired', prefill: 'I’ve been feeling tired.' },
            { label: 'Help me with sleep', prefill: 'Help me with sleep.' },
            { label: 'Review my supplements', prefill: 'Review my supplements.' },
          ]}
          onPrompt={(t) => reply(t, 'Let’s talk about that.')}
        />
      );
    case 'nextIntents':
      return (
        <NextIntentList
          items={[
            { key: 'checkin', icon: 'bell', title: 'Check in with the Oracle', sub: 'Tell her how things are going', onPress: () => reply(undefined, 'Opening check-in…') },
            { key: 'labs', icon: 'upload', title: 'Upload your recent labs', sub: 'She’ll read them alongside your symptoms', onPress: () => reply(undefined, 'Opening labs…') },
          ]}
        />
      );
    case 'todayHabits':
      return (
        <TodayHabitsCard
          day={18}
          habits={[
            { id: 'h1', text: 'Cool bedroom tonight', done: true },
            { id: 'h2', text: 'Magnesium with dinner', done: false },
          ]}
          onToggle={() => reply(undefined, 'Habit toggled (lab).')}
        />
      );
    case 'linkStatus':
      return <LinkStatusCard tone="lilac" lead="labs" title="Reports" meta="2 lab reports" onPress={() => reply(undefined, 'Opening Records…')} />;
    case 'destinationTiles':
      return (
        <DestinationTilePair
          tiles={[
            { tone: 'linen', lead: 'health', title: 'My Health', meta: 'Profile 80%', progress: 0.8, onPress: () => reply(undefined, 'My Health') },
            { tone: 'rose', lead: 'family', title: 'Family', meta: '2 profiles', onPress: () => reply(undefined, 'Family') },
          ]}
        />
      );
    case 'recommendation': {
      const product = findProduct('genesis-gold');
      return product ? (
        <RecommendationCard
          items={[{ product, reason: 'Fits your sleep focus' }]}
          onShop={(id) => reply(undefined, `Shop ${id}`)}
        />
      ) : null;
    }
    case 'mediaHero':
      return (
        <HomeMediaHero
          titleId="lab-media-hero"
          title="Ongoing tiredness and a question about thyroid function"
          when="4 days ago"
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Continue"
          onCta={() => reply(undefined, 'Opening chat…')}
        />
      );
    case 'suggestCarousel':
      return (
        <SuggestionCarousel
          items={[
            { key: 'labs', title: 'Upload your recent labs', sub: 'She’ll read them alongside your symptoms.', tone: 'sky', artifact: 'blue-bloom', icon: 'file', onPress: () => reply(undefined, 'Opening labs…') },
            { key: 'sleep', title: 'Add sleep, food, movement & stress', sub: 'Helps the Oracle tailor her guidance.', tone: 'rose', artifact: 'pink-bloom', icon: 'moon', onPress: () => reply('Help me with sleep.', 'Tell me more.') },
          ]}
        />
      );
    case 'photoDestinations':
      return (
        <PhotoDestinationPair
          tiles={[
            { title: 'My Health', meta: 'Profile 80%', tone: 'mint', artifact: 'dest-health-art', action: 'chevron', onPress: () => reply(undefined, 'My Health') },
            { title: 'Family', meta: '2 profiles', tone: 'rose', artifact: 'dest-family-art', action: 'plus', onPress: () => reply(undefined, 'Family') },
          ]}
        />
      );
    case 'labInsight':
      return (
        <LabInsightCard
          headline="Paula, your tests show that your immune system is functioning very well!"
          body="Blood tests, such as leukocytes (defense cells) and other components, are within expected values for this panel. This is educational context only — not a diagnosis."
        />
      );
    case 'labMetric':
      return (
        <div className={styles.expandStack}>
          <LabMetricCard value={{ id: 'n1', marker: 'Neutrophils', value: '4487.0', unit: 'µL', statusLabel: 'Normal', statusTone: 'normal' }} onPress={() => reply(undefined, 'Metric')} />
          <LabMetricCard value={{ id: 'a1', marker: 'AST', value: '38.0', unit: 'U/L', statusLabel: 'Excellent', statusTone: 'excellent' }} onPress={() => reply(undefined, 'Metric')} />
          <LabMetricCard value={{ id: 'v1', marker: 'VDRL', value: 'Non-Reactive', unit: '', statusTone: 'excellent' }} onPress={() => reply(undefined, 'Metric')} />
        </div>
      );
    case 'glassCare':
      return (
        <GlassCareStrip
          items={[
            { key: 'intake', label: 'Complete intake', meta: '65%', onPress: () => reply(undefined, 'Intake') },
            { key: 'plan', label: 'Healing plan', meta: 'Day 18', onPress: () => reply(undefined, 'Plan') },
            { key: 'reports', label: 'Reports', meta: '2', onPress: () => reply(undefined, 'Reports') },
          ]}
        />
      );
  }
}
