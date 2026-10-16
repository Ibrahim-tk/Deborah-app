/**
 * One widget in the lab thread. Uses the same `@mobile/patterns/widgets` as Conversation /
 * IntakeQuestion / FlowChoice so edits here and in V2 chat stay one source of truth.
 * `reply` lets the widget answer as the user and get Deborah's follow-up.
 */
import { useState } from 'react';
import { findProduct, firstConsultFlow } from '@shared/data';
import { briefFromAnswer, personalise } from '@shared/engine';
import { Button, Panel } from '@mobile/ui';
import { AnswerSections } from '@mobile/patterns/chat';
import { ProductCard } from '@mobile/patterns/commerce';
import { EmergencyInterrupt } from '@mobile/patterns/safety';
import { BookDeborah, InlineConsent, MoodScale, QuestionChoices, ScaleCheck, UploadCard } from '@mobile/patterns/widgets';
import { buildAnswer, visitPrepItems } from '@mobile/screens/consultation/FirstConsult/parts/buildAnswer';
import { VisitPrepCard } from '@mobile/screens/consultation/FirstConsult/parts/VisitPrepCard';
import { BriefDocument } from '@mobile/screens/records/VisitBrief/parts/BriefDocument';
import { MULTI_OPTIONS, YES_NO_OPTIONS, type WidgetKind } from './scenarios';

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

export function LabWidget({ kind, reply }: LabWidgetProps) {
  const [consent, setConsent] = useState<'agreed' | 'declined'>();
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
          confirm="bar"
          onSubmit={(ids) => reply(labelOf(ids, MULTI_OPTIONS), 'Thank you, that helps me see the pattern.')}
        />
      );
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
  }
}
