/** On-the-fly chat widgets (also staged in context at /wid). Same patterns as V2 Conversation. */
import { BookDeborah, ConfirmCard, InlineConsent, MoodScale, QuestionChoices, ReminderCard, ScaleCheck, UploadCard } from '@mobile/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

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

export function WidgetPatterns() {
  return (
    <Section id="widgets" title="Chat widgets" lede={<>Small interactive cards Deborah drops into the thread. Same <code>patterns/widgets</code> as V2 chat — edit once, see it in <code>/wid?flow=v2</code> and Conversation.</>}>
      <Grid>
        <Specimen name="InlineConsent" path="patterns/widgets/InlineConsent" note="Health-data consent inline in the chat. Variant row (chosen 2026-10-14).">
          <Variant label="row"><InlineConsent onAgree={noop} onDecline={noop} /></Variant>
          <Variant label="answered"><InlineConsent onAgree={noop} onDecline={noop} answered="agreed" /></Variant>
        </Specimen>
        <Specimen name="QuestionChoices" path="patterns/widgets/QuestionChoices" note="Shared with IntakeQuestion and FlowChoice. Multi uses Continue bar (or tick in expand lists).">
          <Variant label="single"><QuestionChoices label="Still having periods?" options={YES_NO} onSubmit={noop} /></Variant>
          <Variant label="multi"><QuestionChoices label="Any of these?" options={MULTI} multi exclusive="none" onSubmit={noop} /></Variant>
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
