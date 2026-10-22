/** Typed access to the JSON mock content (docs/06-data-model.md §3). */
import type {
  BookingInfo,
  CheckInScript,
  DebriefScript,
  VisitSpecialtyOption,
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
import attachments from './attachments.json';
import suggestions from './conversation/suggestions.json';
import intake from './conversation/intake.json';
import chatIntake from './conversation/chatIntake.json';
import products from './commerce/products.json';
import guardrails from './conversation/guardrails.json';
import hotFlashesSleep from './conversation/scripts/hot-flashes-sleep.json';
import sleep3am from './conversation/scripts/sleep-3am.json';
import sleepNight from './conversation/scripts/sleep-night.json';
import gasBloating from './conversation/scripts/gas-bloating.json';
import pmsGenPro from './conversation/scripts/pms-gen-pro.json';
import afterProvider from './conversation/scripts/after-provider.json';
import anxiousParent from './conversation/scripts/anxious-parent.json';
import endoDaughter from './conversation/scripts/endo-daughter.json';
import outOfScopeAnkle from './conversation/scripts/out-of-scope-ankle.json';
import thyroidFatigue from './conversation/scripts/thyroid-fatigue.json';
import generic from './conversation/scripts/generic.json';
import labReview from './conversation/scripts/lab-review.json';
import teenIrregularPeriods from './conversation/scripts/teen-irregular-periods.json';
import familyFatigue from './conversation/scripts/family-fatigue.json';
import library from './content/library.json';
import topicMap from './content/topic-map.json';
import slots from './booking/slots.json';
import checkin from './conversation/checkin.json';
import debrief from './conversation/debrief.json';
import specialties from './visit/specialties.json';
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
import sandraConsult from './conversation/flows/sandraConsult.json';
import proxyConsult from './conversation/flows/proxyConsult.json';
import documentTypes from './documents/types.json';
import extractionsByType from './documents/extractions.json';
import documentReviewJson from './documents/review.json';
import healingPlanDocumentJson from './health/healing-plan-document.json';
import type { Flow, FlowNode } from '../types/flow';
import type { DocumentExtraction, DocumentFormat, DocumentType } from '../types/domain';

export const persona = deborah as Persona;
export const consentDoc = consent as Consent;
/** Seed photos for Records › Attachments (prototype). */
export const seedAttachments: { id: string; src: string; alt: string; date: string }[] = attachments.items;
export const suggestionsData = suggestions as SuggestionsData;
export const intakeData = intake as IntakeData;
/** Core experience bank: journeys × symptom groups → clarifiers and red flags (plan C-05). */
export const chatIntakeData = chatIntake as unknown as ChatIntakeData;
export const productList = products as Product[];
export const guardrailsData = guardrails as GuardrailsData;
export const checkInScript = checkin as CheckInScript;
export const debriefScript = debrief as DebriefScript;
export const visitSpecialties = specialties.options as VisitSpecialtyOption[];
export const planList = plans as PlanOption[];
export const labSampleReports = labSamples as Record<string, LabSample>;
export const labMarkerList = labMarkers as LabMarker[];
export const libraryItems = library as LibraryItem[];
/** Script id → library topics + the "Because …" reason line (For you ranking, F07). */
export const scriptTopics = topicMap as Record<string, { topics: string[]; reason: string } | undefined>;
export const bookingInfo = slots as unknown as BookingInfo;

/** F11 Documents: accepted formats, the 20 MB limit, type labels (docs/ux/F11-documents.md). */
export interface DocumentConfig {
  maxBytes: number;
  formats: { format: DocumentFormat; label: string; mime: string[]; extensions: string[] }[];
  types: { id: DocumentType; label: string }[];
}
export const documentConfig = documentTypes as DocumentConfig;
/** Simulated "Reading key details" output by type — placeholder, never read from the file. */
export const documentExtractions = extractionsByType as Record<DocumentType, DocumentExtraction>;

export const scripts: Record<string, Script> = Object.fromEntries(
  ([
    hotFlashesSleep,
    sleep3am,
    sleepNight,
    gasBloating,
    pmsGenPro,
    afterProvider,
    anxiousParent,
    endoDaughter,
    outOfScopeAnkle,
    thyroidFatigue,
    generic,
    labReview,
    teenIrregularPeriods,
    familyFatigue,
  ] as Script[]).map((s) => [s.id, s]),
);

export const FALLBACK_SCRIPT_ID = 'generic';
export const LAB_REVIEW_SCRIPT_ID = 'lab-review';
/** Script for minor profiles (docs/ux/F06-family-profiles.md › 6.4). */
export const TEEN_SCRIPT_ID = 'teen-irregular-periods';
/** Not a topic script: the check-in conversation's scriptId (follow-ups fall back to generic). */
export const CHECKIN_SCRIPT_ID = 'checkin';
/** Not a topic script: the visit debrief conversation's scriptId (F09c). */
export const DEBRIEF_SCRIPT_ID = 'debrief';

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
/** Composer one-tap symptom shortcuts (placeholder). */
export const quickSymptoms: string[] = symptoms.quick;
/**
 * Create visit notes in chat: appointment yes/no, then the small provider form, then the notes card.
 * Sandra already defines these nodes; other scripts get the same path so the pill can start it.
 */
const visitNotesAsk: Record<string, FlowNode> = {
  appointment: {
    type: 'question',
    bot: 'Do you have an appointment?',
    widget: {
      type: 'quick_replies',
      options: [
        { label: 'Yes', value: 'yes', reply: 'Yes.', next: 'appointment_form' },
        { label: 'No', value: 'no', reply: 'No.', next: 'visit_notes' },
      ],
    },
    saveAs: 'appointment',
    next: 'visit_notes',
  },
  appointment_form: {
    type: 'question',
    bot: 'Add who you’re seeing and when, and I’ll put it on your notes.',
    widget: { type: 'appointment_form' },
    next: 'visit_notes',
  },
  visit_notes: {
    type: 'message',
    bot: 'Done. Here are your visit notes, ready to take with you.',
    widget: { type: 'visit_notes_card', title: 'Your visit notes' },
  },
};

function withVisitNotesAsk(flow: Flow): Flow {
  const nodes = { ...flow.nodes };
  for (const [id, node] of Object.entries(visitNotesAsk)) {
    if (!nodes[id]) nodes[id] = node;
  }
  return { ...flow, nodes };
}

/** Scripted first consultation after onboarding (OPEN: all copy is DRAFT, needs Deborah's sign-off). */
export const firstConsultFlow = withVisitNotesAsk(firstConsult as unknown as Flow);
/** Demo consultation for a signed-in returning user (seed R01). OPEN: DRAFT copy, needs Deborah's sign-off. */
export const returningConsultFlow = withVisitNotesAsk(returningConsult as unknown as Flow);
/** Premade first chat for a new sign-up (Sandra, 46, perimenopause happy path). Placeholder copy. */
export const sandraConsultFlow = withVisitNotesAsk(sandraConsult as unknown as Flow);
/** Premade proxy chat (Pathway C, elderly): a daughter asking about her mother. Placeholder copy. */
export const proxyConsultFlow = withVisitNotesAsk(proxyConsult as unknown as Flow);

/** F11 Deborah's replies to a shared document and the one-time upload offer (placeholder copy). */
export interface DocumentReviewCopy {
  status: 'placeholder' | 'approved';
  offer: string;
  offerOptions: { id: 'doc-discuss' | 'doc-later'; label: string }[];
  later: string;
  bubble: string;
  replies: Record<Exclude<DocumentType, 'lab'>, string>;
  suggestions: Record<Exclude<DocumentType, 'lab'>, string[]>;
}
export const documentReview = documentReviewJson as DocumentReviewCopy;

/** Clinical healing-plan document shown on M-7.3 (placeholder copy until Deborah approves). */
export interface HealingPlanDocument {
  status: 'placeholder' | 'approved';
  brand: string;
  preparedBy: string;
  dateLabel: string;
  clinical: { title: string; items: { label: string; value: string }[] };
  callout: { title: string; body: string };
  conditions: {
    id: string;
    title: string;
    icon: string;
    items: string[];
    note?: string;
  }[];
  pillarsIntro: { eyebrow: string; title: string };
  pillars: {
    id: string;
    roman: string;
    name: string;
    tag: string;
    lede?: string;
    products?: { productId: string; name: string; dose: string }[];
    items: string[];
  }[];
  resources: { label: string; href: string; external?: boolean }[];
  signature: { name: string; title: string };
}
export const healingPlanDocument = healingPlanDocumentJson as HealingPlanDocument;
