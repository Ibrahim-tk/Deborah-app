/** On-the-fly chat widgets (also staged in context at /wid). */
import { useState } from 'react';
import { BookDeborah, ChoicePills, ConfirmCard, InlineConsent, MoodScale, ReminderCard, ScaleCheck, UploadCard } from '@flow-v1/apps/mobile/patterns/widgets';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const noop = () => {};

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
        <Specimen name="ChoicePills" path="patterns/widgets/ChoicePills" note="OPEN: frosted short-answer pills are a widget-lab exploration outside DESIGN.md’s no-pills rule.">
          <Variant label="single"><ChoicePills label="Still having periods?" options={['Yes', 'No', 'Not sure']} onPick={noop} keepAnswer /></Variant>
          <Variant label="multi">
            <ChoicePills label="Any of these?" options={['Hot flashes', 'Night sweats', 'Brain fog']} onPick={noop} selected={picked} onToggle={toggle} />
          </Variant>
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