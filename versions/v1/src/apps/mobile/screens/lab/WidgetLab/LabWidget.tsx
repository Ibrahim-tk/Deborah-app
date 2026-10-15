/** One widget in the lab thread. `reply` lets the widget answer as the user and get Deborah's follow-up. */
import { useState } from 'react';
import { findProduct, firstConsultFlow } from '@flow-v1/shared/data';
import { personalise } from '@flow-v1/shared/engine';
import { Button, Panel } from '@flow-v1/apps/mobile/ui';
import { AnswerSections } from '@flow-v1/apps/mobile/patterns/chat';
import { ProductCard } from '@flow-v1/apps/mobile/patterns/commerce';
import { EmergencyInterrupt, EscalationCard } from '@flow-v1/apps/mobile/patterns/safety';
import { ChoicePills, ConfirmCard, InlineConsent, MoodScale, ReminderCard, ScaleCheck, SlotPicker, UploadCard } from '@flow-v1/apps/mobile/patterns/widgets';
import { buildAnswer, visitPrepItems } from '@flow-v1/apps/mobile/screens/consultation/FirstConsult/parts/buildAnswer';
import { VisitPrepCard } from '@flow-v1/apps/mobile/screens/consultation/FirstConsult/parts/VisitPrepCard';
import { MULTI_OPTIONS, SLOT_FORTNIGHT, type WidgetKind } from './scenarios';
import styles from './WidgetLab.module.css';

const say = (s?: string) => personalise(firstConsultFlow, s, 'Maria');
const ANSWER = buildAnswer(firstConsultFlow.nodes.answer_1, say);
const PREP = visitPrepItems(firstConsultFlow.nodes.answer_1);

export interface LabWidgetProps {
  kind: WidgetKind;
  /** The user's answer (shown as her bubble) and Deborah's short follow-up. */
  reply: (userText: string | undefined, deborah: string) => void;
}

function Multi({ reply }: Pick<LabWidgetProps, 'reply'>) {
  const [on, setOn] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const toggle = (o: string) => setOn((xs) => (o === 'None of these' ? (xs.includes(o) ? [] : [o]) : xs.includes(o) ? xs.filter((x) => x !== o) : [...xs.filter((x) => x !== 'None of these'), o]));
  return (
    <div className={styles.multi}>
      <ChoicePills label="Symptoms" options={MULTI_OPTIONS} onPick={() => {}} selected={on} onToggle={(o) => !sent && toggle(o)} />
      {!sent && <Button fullWidth disabled={!on.length} onClick={() => { setSent(true); reply(on.join(', '), 'Thank you, that helps me see the pattern.'); }}>Continue</Button>}
    </div>
  );
}

export function LabWidget({ kind, reply }: LabWidgetProps) {
  const [consent, setConsent] = useState<'agreed' | 'declined'>();
  switch (kind) {
    case 'consent':
      return <InlineConsent answered={consent} onAgree={() => { setConsent('agreed'); reply(undefined, 'Thank you. Tell me what’s on your mind.'); }} onDecline={() => setConsent('declined')} />;
    case 'yesno':
      return <ChoicePills label="Answer" options={['Yes', 'No', 'Not sure']} keepAnswer onPick={(o) => reply(o, o === 'Yes' ? 'That points me towards your hormones and temperature control.' : 'Good to know, that rules a few things out.')} />;
    case 'multi':
      return <Multi reply={reply} />;
    case 'scale':
      return <ScaleCheck title="Energy today" low="Empty" high="Full" onDone={(v) => reply(`${v} of 10`, v < 5 ? 'Low energy and broken sleep often travel together.' : 'Glad your energy is holding up.')} />;
    case 'mood':
      return <MoodScale title="This week" onPick={(m) => reply(m, 'Thank you for telling me.')} />;
    case 'answer':
      return <AnswerSections answer={ANSWER} wordSlot={<Button variant="secondary" leadingIcon="note" fullWidth onClick={() => reply(undefined, 'Saved to your Visit notes.')}>Save to Visit notes</Button>} />;
    case 'product': {
      const product = findProduct('genesis-gold');
      return product && ANSWER.product ? <ProductCard product={product} productRef={ANSWER.product} onShop={() => reply(undefined, 'Opening the shop (simulated).')} /> : null;
    }
    case 'slots':
      return <SlotPicker title="Book with Deborah" meta="30 min · Video" days={SLOT_FORTNIGHT} onPick={(day, time) => reply(`${day}, ${time}`, 'Lovely. One step left: confirm it below.')} />;
    case 'confirm':
      return <ConfirmCard eyebrow="Confirm booking" icon="calendar" title="Deborah · 30 min" value="$150" detail="Thu 16 · 3:00 pm · Video" detailValue="Card ending 4242" confirmedText="Booked. You’ll get a reminder." onConfirm={() => reply(undefined, 'You’re booked. I’ll send your notes to Deborah ahead of time.')} />;
    case 'reminder':
      return <ReminderCard what="Sleep check-in" when="Next Thursday, 8:00 pm" onChange={(on) => on && reply(undefined, 'Done. I’ll check in next Thursday.')} />;
    case 'upload':
      return <UploadCard onUploaded={(f) => reply(`Uploaded ${f}`, 'Got it. I’ll read your thyroid markers alongside your sleep.')} />;
    case 'tip':
      return <Panel tone="lilac" icon="check">Keep the bedroom cool, around 18 °C, and have a glass of water by the bed.</Panel>;
    case 'prep':
      return <VisitPrepCard title="For my next appointment" questions={PREP.questions} tests={PREP.tests} onShare={() => reply(undefined, 'PDF ready to share (simulated).')} onSave={() => reply(undefined, 'Saved to your Visit notes.')} />;
    case 'escalation':
      return <EscalationCard body="It sounds like your situation deserves a personal look. I’d like you to talk with me directly." reasons={['Broken sleep for months', 'Night sweats most nights', 'A thyroid medicine to review']} details={['30 min', 'Video or phone', 'Next opening Thu 16', 'Your notes go ahead']} onBook={() => reply('Book with Deborah', 'Let’s find a time.')} onDismiss={() => reply('I understand', 'Thank you. I’m here when you want to talk more.')} />;
    case 'emergency':
      return <EmergencyInterrupt title="Please get help now" body="If this is happening now, call emergency services." onCall={() => reply(undefined, 'Calling 911 (simulated).')} onFindER={() => reply(undefined, 'Finding care near you (simulated).')} onSafe={() => reply('I’m safe', 'Thank you. Let’s keep talking.')} />;
  }
}
