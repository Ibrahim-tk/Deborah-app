/** Safety patterns. Copy comes from guardrails JSON (placeholder until Deborah approves); behaviour lives in the engine. */
import { CrisisSupportCard, EmergencyInterrupt, EscalationCard, MedicationSafetyCard, OutOfScopeReply } from '@mobile/patterns/safety';
import { guardrailsData, suggestionsData } from '@shared/data';
import { Section } from '../Section';
import { Grid, Specimen } from '../Specimen';

const noop = () => {};
const g = guardrailsData;

export function SafetyPatterns() {
  return (
    <Section
      id="safety"
      title="Safety"
      lede="The strongest emphasis in the system, used only when it matters. Emergency is the one place red fills a button; crisis stays calm, never alarm red."
    >
      <Grid>
        <Specimen name="EmergencyInterrupt" path="patterns/safety/EmergencyInterrupt" note="2 px danger border, Call 911 as the largest button, Find nearest ER, “I’m safe”. Nothing else competes.">
          <div data-placeholder><EmergencyInterrupt title={g.emergency.title} body={g.emergency.body} onCall={noop} onFindER={noop} onSafe={noop} /></div>
        </Specimen>
        <Specimen name="CrisisSupportCard" path="patterns/safety/CrisisSupportCard" note="Hairline card, calm tone, 988 first. Tap the row to open the sheet (closed on load so the lab page stays clear).">
          <div data-placeholder>
            <CrisisSupportCard body={g.crisis.body} lifelineLabel={g.crisis.lifeline.label} moreSupport={g.crisis.moreSupport} onCall={noop} onKeepTalking={noop} defaultOpen={false} />
          </div>
        </Specimen>
        <Specimen name="MedicationSafetyCard" path="patterns/safety/MedicationSafetyCard" note="Additive Linen panel. Never contains dosing.">
          <div data-placeholder><MedicationSafetyCard body={g.medication.body} linkLabel={g.medication.interactionLink.label} onCheckInteractions={noop} /></div>
        </Specimen>
        <Specimen name="EscalationCard · OutOfScopeReply" path="patterns/safety/EscalationCard" note="The human path: book a consultation with Deborah. Shown inline here (sheet={false}).">
          <div data-placeholder>
            <EscalationCard body={g.escalation.body} sheet={false} onBook={noop} onDismiss={noop} details={['30 min', 'Video or phone']} />
          </div>
          <OutOfScopeReply suggestions={suggestionsData.default.slice(0, 2)} onBook={noop} onSelect={noop} />
        </Specimen>
      </Grid>
    </Section>
  );
}
