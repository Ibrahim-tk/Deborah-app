# 06 · Data model and JSON mocks

All mock content lives in `src/shared/data` as JSON and is typed in `src/shared/types`. Screens never hard-code content strings that represent *data* (names, products, prices, clinical text, content items). UI microcopy (button labels like "Continue") may live in components until the design system/copy deck is set.

## 1. Content status

Every object that contains clinical or brand copy has:

```ts
type ContentStatus = 'placeholder' | 'handbook' | 'approved';
// placeholder: written for the prototype; handbook: taken from Deborah's Hypothalamus Handbook (legacy JSX); approved: signed off by Deborah
```

The shell's "Highlight placeholder content" toggle reads this via a `data-status` attribute that patterns must forward to the rendered text container.

## 2. Domain types (`types/domain.ts`)

```ts
type ID = string;
type ISODate = string;

type PlanTier = 'trial' | 'individual' | 'family' | 'premium';
type Relationship = 'self' | 'daughter' | 'son' | 'partner' | 'parent' | 'other';

interface Profile {
  id: ID; name: string; relationship: Relationship;
  dob?: ISODate; sexAtBirth?: 'female' | 'male';
  intake: Intake; createdAt: ISODate; guardianConsentAt?: ISODate;
}
interface Intake {
  ageBand?: 'under-40' | '40-45' | '46-50' | '51-55' | '56+' | 'teen';
  conditions: string[]; medications: string[];
  cycle?: 'regular' | 'irregular' | 'stopped' | 'unknown';
  notes?: string;
}

type MessageRole = 'user' | 'deborah' | 'system';
type MessageKind =
  | 'text' | 'intakeQuestion' | 'answer' | 'thinking' | 'error'
  | 'emergency' | 'medicationSafety' | 'crisis' | 'outOfScope' | 'escalation'
  | 'checkIn' | 'labRequest' | 'followUpPrompt';

interface Message {
  id: ID; role: MessageRole; kind: MessageKind; createdAt: ISODate;
  text?: string;                       // streamed text lands here
  intake?: { questionId: string; options: Option[]; multi: boolean; step: number; of: number; answered?: string[] };
  answer?: Answer;                     // for kind 'answer'
  suggestions?: string[];              // follow-up questions under a message
  meta?: { scriptId?: string; streaming?: boolean; counted?: boolean };
}
interface Option { id: string; label: string }

interface Answer {
  sections: AnswerSection[];           // ALWAYS 7, fixed order
  product?: ProductRef;                // rendered only inside section 6
  closingLine: string;                 // mandatory
  labsReferenced?: ID[];
  status: ContentStatus;
}
type SectionKey = 'hearing' | 'hypothalamic' | 'mayMean' | 'providerQuestions' | 'tests' | 'doNow' | 'word';
interface AnswerSection { key: SectionKey; title: string; body: string; bullets?: string[] }
interface ProductRef { productId: ID; why: string; frame90: string }

interface Conversation {
  id: ID; profileId: ID; scriptId?: string; topic?: string;
  status: 'empty' | 'intake' | 'ready' | 'generating' | 'answered' | 'error' | 'safety';
  messages: Message[]; startedAt: ISODate; countedAt?: ISODate; summary?: string;
}

interface LabReport {
  id: ID; profileId: ID; source: 'photo' | 'pdf' | 'manual'; labName?: string; collectedAt?: ISODate;
  values: LabValue[]; confirmed: boolean;
}
interface LabValue { id: ID; marker: string; value: string; unit: string; edited?: boolean }

interface Plan90 { profileId: ID; startDate: ISODate; goal: string; habits: Habit[]; productId?: ID; productStartDate?: ISODate }
interface Habit { id: ID; text: string; doneDates: ISODate[] }

interface Note { id: ID; profileId: ID; kind: 'questions' | 'saved-answer' | 'after-visit' | 'free'; title: string; body: string; updatedAt: ISODate; sourceMessageId?: ID }

interface Booking { id: ID; profileId: ID; slot: ISODate; durationMin: number; price: number; state: string; shareHistory: boolean; status: 'booked' | 'cancelled' }

interface AppNotification { id: ID; title: string; body: string; deepLink: string; deliverAt: ISODate; delivered: boolean; read: boolean }
```

## 3. JSON files

### `persona/deborah.json`
```json
{
  "name": "Deborah Maragopoulos",
  "credentials": "FNP",
  "title": "The Hormone Queen®",
  "yearsPractice": 30,
  "shortBio": "…", "philosophy": "…", "books": [{ "title": "The Hypothalamus Handbook", "year": 2023 }],
  "portrait": "/images/deborah/portrait-placeholder.jpg",
  "voice": { "greetingMorning": "Good morning, {name}.", "greetingEvening": "Good evening, {name}." },
  "status": "placeholder"
}
```

### `legal/consent.json`
`{ "version": "0.1-draft", "summaryBullets": ["…is / is not…"], "aiDisclosure": "…", "termsTitle": "Terms & Disclaimer", "termsBody": "…", "privacyBody": "…", "status": "placeholder" }` — OPEN: attorney copy.

### `conversation/suggestions.json`
```json
{ "default": [
  { "id": "s1", "text": "Why am I waking up at 3am every night?", "scriptId": "sleep-3am" },
  { "id": "s2", "text": "Hot flashes and brain fog — are they connected?", "scriptId": "hot-flashes-sleep" },
  { "id": "s3", "text": "Should I get my thyroid checked?", "scriptId": "thyroid-fatigue" }
], "teen": [ { "id": "t1", "text": "Are irregular periods normal at her age?", "scriptId": "teen-irregular-periods" } ],
  "status": "placeholder" }
```

### `conversation/intake.json`
Question bank. Each question has `id`, `prompt` (Deborah's voice, may use `{name}`), `options`, `multi`, `profileField` (where the answer is stored), `skipIf` (field already known).
```json
{ "questions": [
  { "id": "age", "prompt": "I hear you, {name}. A few quick questions so I can understand what's going on. How old are you?", "options": ["Under 40","40–45","46–50","51–55","56+"], "multi": false, "profileField": "intake.ageBand", "skipIfKnown": true },
  { "id": "meds", "prompt": "Thank you. Are you taking any medications, or do you have any diagnosed conditions?", "options": ["None","Thyroid","Blood pressure","HRT / hormones","Other…"], "multi": true, "profileField": "intake.conditions", "skipIfKnown": true },
  { "id": "cycle", "prompt": "And how would you describe your cycle right now?", "options": ["Regular","Irregular","Stopped","Not sure"], "multi": false, "profileField": "intake.cycle", "skipIfKnown": true }
], "maxQuestions": 3, "status": "placeholder" }
```

### `conversation/guardrails.json`
```json
{
  "emergency":  { "patterns": ["chest pain", "can't breathe", "cannot breathe", "numb.*arm", "face droop", "slurred", "fainted", "heavy bleeding", "seizure", "suicid.*plan"], "title": "This could be an emergency.", "body": "Please call 911 now or go to the nearest emergency room. Don't wait.", "status": "placeholder" },
  "crisis":     { "patterns": ["don't see the point", "want to die", "kill myself", "hurt myself", "end it all"], "body": "You're not alone. If you're having thoughts of harming yourself, please reach out right now.", "lifeline": { "label": "Call or text 988", "tel": "988" }, "status": "placeholder" },
  "medication": { "patterns": ["medication", "meds", "prescri", "dose", "dosage", "levothyroxine", "metformin", "hrt", "estradiol", "progesterone cream", "blood pressure pill", "stop taking", "start taking"], "body": "I can't prescribe or tell you to start or stop a medication. Please check with your prescriber or pharmacist first.", "interactionLink": { "label": "Check interactions on drugs.com", "url": "https://www.drugs.com/drug_interactions.html" }, "status": "placeholder" },
  "outOfScope": { "patterns": ["mri", "x-ray", "broken bone", "my car", "legal advice", "tax"], "body": "That's outside what I can help with — I focus on hormonal and whole-body health from my clinical work. Your provider is the right person for this.", "status": "placeholder" },
  "escalation": { "triggers": { "unresolvedConsultations": 3, "phrases": ["tried everything", "nothing is working", "nothing is changing"] }, "body": "It sounds like your situation deserves a personal look. I'd like you to talk with me directly.", "status": "placeholder" }
}
```
Patterns are case-insensitive regex fragments. **Precedence: emergency > crisis > medication > outOfScope > escalation > topic.** Medication is *additive* (card + normal flow); the others replace the normal flow.

### `conversation/scripts/<id>.json`
A topic script = everything the engine needs to simulate one consultation.
```jsonc
{
  "id": "hot-flashes-sleep",
  "topic": "Hot flashes & sleep",
  "match": ["hot flash", "night sweat", "can't sleep", "insomnia", "exhausted", "brain fog"],
  "intake": ["age", "meds", "cycle"],
  "readyLine": "Thank you, {name}. I have a good picture now — tap below when you'd like to hear what I think, or ask me anything else first.",
  "suggestedQuestions": ["Could this be perimenopause?", "Which labs should I ask for?"],
  "answer": {
    "sections": [
      { "key": "hearing", "title": "What I'm Hearing", "body": "…2–3 sentences reflecting Maria's situation, uses {name} and intake…" },
      { "key": "hypothalamic", "title": "The Hypothalamic Connection", "body": "…" },
      { "key": "mayMean", "title": "What This May Mean", "body": "…hedged: may, might, worth exploring…" },
      { "key": "providerQuestions", "title": "Questions for Your Provider", "body": "", "bullets": ["…","…","…","…"] },
      { "key": "tests", "title": "Tests Worth Discussing", "body": "", "bullets": ["fT3 (not just TSH) — …", "…"] },
      { "key": "doNow", "title": "What You Can Do Now", "body": "…Five Pillars…", "bullets": ["…habit…","…habit…","…habit…"] },
      { "key": "word", "title": "A Word from Deborah", "body": "…warm closing…" }
    ],
    "product": { "productId": "genesis-gold", "why": "…", "frame90": "Give your hypothalamus 90 days…" },
    "closingLine": "Bring this to your provider. I help you ask better questions — your provider makes clinical decisions.",
    "habitsForPlan": ["…","…","…"],
    "summary": "Hot flashes, night waking and fatigue; 46–50; no meds."
  },
  "variants": { "withLabs": { "sections": [ /* overrides that reference lab values */ ] } },
  "followUps": [ { "match": ["perimenopause"], "reply": "…short text reply…" } ],
  "status": "placeholder"
}
```
Required scripts for v1: `hot-flashes-sleep`, `sleep-3am`, `thyroid-fatigue`, `teen-irregular-periods`, `lab-review` (uses `withLabs`), `checkin` (follow-up conversation), `generic` (fallback when nothing matches — still 7 sections, more general).

### `commerce/products.json`
`[{ "id": "genesis-gold", "name": "Genesis Gold®", "tagline": "…", "image": "/images/products/genesis-gold.png", "url": "https://genesisgold.com/…?ref=app", "disclosure": "Formulated by Deborah", "status": "placeholder" }, { "id": "sacred-seven" … }, { "id": "gen-pro" … }]`

### `commerce/plans.json`
```json
[ { "id": "individual", "name": "Individual", "monthly": 19, "annual": 190, "features": ["Unlimited consultations","Resource library","Personal 90-day plan"], "profiles": 1 },
  { "id": "family", "name": "Family", "monthly": 39, "annual": 390, "features": ["Up to 5 profiles","Each with private history"], "profiles": 5, "recommended": true },
  { "id": "premium", "name": "Premium", "monthly": 49, "annual": 490, "features": ["Voice input","Printable summaries","Deeper protocol guidance"], "profiles": 1 } ]
```
Prices from the brief (≈); annual values are placeholders. OPEN: recommended plan; whether Premium includes family profiles.

### `content/library.json`
`[{ "id": "v-001", "type": "video" | "article" | "lesson", "title": "…", "summary": "…", "topics": ["sleep","hot-flashes"], "durationMin": 12, "publishedAt": "…", "thumbnail": "/images/content/…", "status": "placeholder" }]` — "For you" ranking = topic overlap with the active profile's conversation topics, then recency.

### `content/best-tips.json`
`[{ "id": "tip-1", "text": "Open your visit with: 'I have three questions.'", "status": "placeholder" }]`

### `labs/sample-reports.json`
Values returned by the simulated extractor; any uploaded file maps to `sample-a`.
`{ "sample-a": { "labName": "Sample Lab", "values": [ { "marker": "TSH", "value": "3.8", "unit": "mIU/L" }, { "marker": "Free T3", "value": "2.4", "unit": "pg/mL" }, { "marker": "Estradiol", "value": "45", "unit": "pg/mL" } ] } }` — demo values, not clinical guidance.

### `booking/slots.json`
`{ "durationMin": 50, "price": null, "statesLicensed": [], "slots": ["2026-10-28T10:00:00-07:00", "…"] }` — OPEN: price and licensed states (empty list = show the state picker but accept every state in the prototype).
