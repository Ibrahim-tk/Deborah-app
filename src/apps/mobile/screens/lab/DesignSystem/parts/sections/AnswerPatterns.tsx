/** Chat patterns, part 2: Deborah's seven-section answer and everything that closes it. */
import { AnswerActions, AnswerCTA, AnswerSections, ClosingLine, GuidanceNextSteps, SaveProfileCard } from '@mobile/patterns/chat';
import { ProductCard } from '@mobile/patterns/commerce';
import { findProduct, productList, scripts, FALLBACK_SCRIPT_ID } from '@shared/data';
import { briefFromAnswer } from '@shared/engine';
import type { Answer } from '@shared/types/domain';
import { BriefDocument } from '@mobile/screens/records/VisitBrief/parts/BriefDocument';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';

const noop = () => {};
const script = scripts[FALLBACK_SCRIPT_ID];
// Scripts carry a [name] token that the conversation engine personalises; do the same here.
const named = (t: string) => t.replace(/\[name\]/g, 'Maria');
const answer: Answer = {
  sections: script.answer.sections.map((s) => ({ ...s, body: named(s.body), bullets: s.bullets?.map(named) })),
  product: script.answer.product,
  closingLine: named(script.answer.closingLine),
  status: script.status,
};
const product = findProduct(answer.product?.productId) ?? productList[0];

/** Chevron-only Miro Step 4 note (docs/ux/F02e-guidance.md) — no diagrams on the mockup. */
const GUIDANCE_FLOW_NOTE =
  'Ask Oracle / Tell me what you think > enough details? yes > covers concern? yes > stream 7 sections > product if allowed > disclaimer / closing > Guidance given > ~14-day follow-up > What’s next. Not enough details > early first look > finish questions > ask again. Out of coverage > team handoff + Book (uncounted). What’s next rows: Ask a follow-up > Discuss with provider > Save summary > Book > Upload labs > Buy product > View 90-day plan.';

const DEMO_BRIEF = briefFromAnswer(
  {
    id: 'p-ds',
    name: 'Maria',
    relationship: 'self',
    intake: { conditions: [], medications: ['none'], genesisGold: 'yes', mainConcern: 'Night sweats for 8–12 months.' },
    createdAt: '2026-10-01T00:00:00Z',
    health: { birthYear: { value: 1978, source: 'manual', updatedAt: '2026-10-01T00:00:00Z' } },
  },
  answer,
  'Sleep and night waking',
);

export function AnswerPatterns() {
  return (
    <Section id="answer" title="The Oracle’s answer" lede="The signature seven-section framework as a calm accordion: Gold Ink numerals, headline titles, hairline dividers, no boxes. Copy shown here is placeholder script content.">
      <Specimen name="AnswerSections" path="patterns/chat/AnswerSections" note="Fixed order, always seven. The product card lives only at the end of §6; §7 is “A word from the Oracle”.">
        <div data-placeholder>
          <AnswerSections
            answer={answer}
            productSlot={answer.product && <ProductCard product={product} productRef={answer.product} onShop={noop} />}
            onAddQuestion={noop}
          />
        </div>
      </Specimen>
      <Grid>
        <Specimen name="ClosingLine · AnswerActions" path="patterns/chat/ClosingLine" note="Mandatory closing line in a Linen panel, then Copy · Save PDF · Share · Listen.">
          <Variant label="ClosingLine"><div data-placeholder><ClosingLine text={answer.closingLine} /></div></Variant>
          <Variant label="AnswerActions"><AnswerActions onSavePdf={noop} onVisitNotes={noop} onShare={noop} onCopy={noop} onListen={noop} onBook={noop} /></Variant>
        </Specimen>
        <Specimen name="AnswerCTA · SaveProfileCard" path="patterns/chat/AnswerCTA" note="“Tell me what you think” turns primary once intake is ready. Save prompt follows the first useful answer.">
          <Variant label="secondary"><AnswerCTA label="Tell me what you think" emphasis="secondary" onPress={noop} /></Variant>
          <Variant label="primary"><AnswerCTA label="Tell me what you think" emphasis="primary" onPress={noop} /></Variant>
          <Variant label="SaveProfileCard"><SaveProfileCard onProvider={noop} onNotNow={noop} /></Variant>
        </Specimen>
      </Grid>
      <Specimen name="GuidanceNextSteps" path="patterns/chat/GuidanceNextSteps" note={GUIDANCE_FLOW_NOTE}>
        <GuidanceNextSteps showProduct showPlan onSelect={noop} />
      </Specimen>
      <Specimen name="BriefDocument" path="screens/records/VisitBrief" note="Miro Step 5 · M-9.7 My Visit Notes: structured provider brief (read-only specimen).">
        <div data-placeholder>
          <BriefDocument brief={DEMO_BRIEF} />
        </div>
      </Specimen>
    </Section>
  );
}
