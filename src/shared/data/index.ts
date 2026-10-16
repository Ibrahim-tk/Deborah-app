/** Typed access to the JSON mock content (docs/06-data-model.md §3). */
import type {
  BookingInfo,
  CheckInScript,
  Consent,
  GuardrailsData,
  IntakeData,
  LabMarker,
  LabSample,
  LibraryItem,
  Persona,
  PlanOption,
  Product,
  Script,
  SuggestionsData,
  HealthBasicsData,
  ChatIntakeData,
} from '../types/content';
import deborah from './persona/deborah.json';
import consent from './legal/consent.json';
import suggestions from './conversation/suggestions.json';
import intake from './conversation/intake.json';
import chatIntake from './conversation/chatIntake.json';
import products from './commerce/products.json';
import guardrails from './conversation/guardrails.json';
import hotFlashesSleep from './conversation/scripts/hot-flashes-sleep.json';
import sleep3am from './conversation/scripts/sleep-3am.json';
import thyroidFatigue from './conversation/scripts/thyroid-fatigue.json';
import generic from './conversation/scripts/generic.json';
import labReview from './conversation/scripts/lab-review.json';
import teenIrregularPeriods from './conversation/scripts/teen-irregular-periods.json';
import library from './content/library.json';
import topicMap from './content/topic-map.json';
import slots from './booking/slots.json';
import checkin from './conversation/checkin.json';
import plans from './commerce/plans.json';
import labSamples from './labs/sample-reports.json';
import labMarkers from './labs/markers.json';
import healthKit from './intake/healthkit.json';
import intakeSuggestions from './intake/suggestions.json';
import medicines from './intake/medicines.json';
import scanSamples from './intake/scans.json';
import healthBasics from './intake/healthBasics.json';
import symptoms from './intake/symptoms.json';
import firstConsult from './conversation/flows/firstConsult.json';
import returningConsult from './conversation/flows/returningConsult.json';
import type { Flow } from '../types/flow';

export const persona = deborah as Persona;
export const consentDoc = consent as Consent;
export const suggestionsData = suggestions as SuggestionsData;
export const intakeData = intake as IntakeData;
/** Core experience bank: journeys × symptom groups → clarifiers and red flags (plan C-05). */
export const chatIntakeData = chatIntake as unknown as ChatIntakeData;
export const productList = products as Product[];
export const guardrailsData = guardrails as GuardrailsData;
export const checkInScript = checkin as CheckInScript;
export const planList = plans as PlanOption[];
export const labSampleReports = labSamples as Record<string, LabSample>;
export const labMarkerList = labMarkers as LabMarker[];
export const libraryItems = library as LibraryItem[];
/** Script id → library topics + the "Because …" reason line (For you ranking, F07). */
export const scriptTopics = topicMap as Record<string, { topics: string[]; reason: string } | undefined>;
export const bookingInfo = slots as unknown as BookingInfo;

export const scripts: Record<string, Script> = Object.fromEntries(
  ([hotFlashesSleep, sleep3am, thyroidFatigue, generic, labReview, teenIrregularPeriods] as Script[]).map((s) => [s.id, s]),
);

export const FALLBACK_SCRIPT_ID = 'generic';
export const LAB_REVIEW_SCRIPT_ID = 'lab-review';
/** Script for minor profiles (docs/ux/F06-family-profiles.md › 6.4). */
export const TEEN_SCRIPT_ID = 'teen-irregular-periods';
/** Not a topic script: the check-in conversation's scriptId (follow-ups fall back to generic). */
export const CHECKIN_SCRIPT_ID = 'checkin';

export function findProduct(id: string | undefined): Product | undefined {
  return productList.find((p) => p.id === id);
}

export function findPlan(id: string | undefined): PlanOption | undefined {
  return planList.find((p) => p.id === id);
}

export function findLibraryItem(id: string | undefined): LibraryItem | undefined {
  return libraryItems.find((i) => i.id === id);
}

/** Intake V2 mock sources (simulated Apple Health read, search suggestions, camera OCR samples). */
export const healthKitMock = healthKit;
export const intakeSuggestionData = intakeSuggestions as Record<'medications' | 'supplements' | 'allergies' | 'conditions', string[]> & { status: string };
/** Prototype medicine names for Health Basics namedReasons Name autocomplete. */
export const medicinesData = (medicines as { medicines: string[] }).medicines;
export type ScanSample = { id: string; label: string; field: 'medications' | 'allergies' | 'conditions'; ocr: string };
export const scanSampleData = scanSamples.samples as ScanSample[];
export const healthBasicsData = healthBasics as HealthBasicsData;
/** Composer symptom picker: grouped plain-language symptoms (placeholder). */
export const symptomGroups: { id?: string; title: string; items: string[] }[] = symptoms.groups;
/** Scripted first consultation after onboarding (OPEN: all copy is DRAFT, needs Deborah's sign-off). */
export const firstConsultFlow = firstConsult as unknown as Flow;
/** Demo consultation for a signed-in returning user (seed R01). OPEN: DRAFT copy, needs Deborah's sign-off. */
export const returningConsultFlow = returningConsult as unknown as Flow;
