# 07 · Mock AI engine ("the Deborah simulator")

The prototype must *feel* AI-native — streaming, context-aware, remembering, safe — with zero network calls. All logic lives in `src/shared/engine` as pure TypeScript; apps consume it through a hook.

## 1. Engine contract

```ts
const engine = createConversationEngine({ data, rng?, now });

engine.handleUserInput(ctx: EngineContext, input: UserInput): EnginePlan
// ctx   = { profile, conversation, subscription, labs, plan90, settings, flags }
// input = { kind: 'text', text } | { kind: 'intakeAnswer', questionId, optionIds } | { kind: 'skip' }
//       | { kind: 'requestAnswer' } | { kind: 'suggestion', id } | { kind: 'checkInReply', value }
// EnginePlan = ordered list of steps the bridge executes with timers:
type Step =
  | { type: 'delay'; ms: number }
  | { type: 'thinking'; on: boolean; label?: string }
  | { type: 'message'; message: Message }                         // instant
  | { type: 'stream'; messageId: ID; field: 'text' | `section:${SectionKey}`; text: string; cps: number }
  | { type: 'store'; action: StoreAction }                        // e.g. updateIntake, completeConsultation
  | { type: 'gate'; reason: 'freeLimit' }                         // bridge presents M-4.1 instead
  | { type: 'error'; retryable: true };
```

The **bridge** (`apps/mobile/hooks/useConversation.ts`) executes steps sequentially, honours the shell's network-speed toggle (multiplies delays), supports **Stop** (cancels remaining steps, marks the partial answer "stopped" and does not count it), and resumes if the user navigates away.

## 2. Pipeline for a text message

```
user text
  │
  ├─1 Guardrails (classifier.ts, precedence order)
  │    emergency → crisis → medication (additive) → outOfScope → escalation
  │
  ├─2 Gate: free limit
  │    if plan=trial AND freeConsultationsUsed ≥ 3 AND this would START a new consultation
  │    → { gate: freeLimit } (safety guardrails above still run first and are never gated)
  │
  ├─3 Conversation phase
  │    empty/answered + new topic → pick script (match keywords / suggestion scriptId / fallback 'generic')
  │                                → intake phase
  │    intake  → record answer → next unanswered question or 'ready'
  │    ready   → free text = clarifying follow-up (short reply from script.followUps / generic)
  │    "Tell me what you think" or user asks "what do you think" → answer phase
  │    answered → follow-up question → short reply OR new topic → new consultation
  │
  └─4 Answer phase
       thinking (1.2–2.0 s) → stream 7 sections in order → product card inside §6
       → closing line → actions → store: completeConsultation, setSummary, createFromAnswer(plan90)
       → if first ever answer and permission 'unknown' → present M-2.8 after 1.5 s
       → if this was the 3rd free answer → mark 'limitReachedPending' (M-4.1 shows when user next acts or after 4 s idle at the bottom of the answer)
```

### Intake rules
- Ask at most `maxQuestions` (3), one at a time, from the script's `intake` list, **skipping fields already known** in the profile (returning users answer fewer questions).
- Each question: Deborah text + option rows (DESIGN.md › Option rows) + "Quick question n of N · Skip". Free text is accepted as an answer (stored verbatim in `intake.notes`).
- After the last question (or skip), Deborah sends the script's `readyLine` + suggested questions + the **"Tell me what you think"** button. The user may also ask for the answer at any time during intake (button visible from question 1 onward as a secondary action).

### Answer construction (`answer.ts`)
- Start from `script.answer`; if the profile has confirmed labs and the script has `variants.withLabs`, merge it and set `labsReferenced`.
- Interpolate `{name}`, `{ageBand}`, intake values and lab values into section bodies.
- Teen/child profiles: use the teen script; **suppress product card** (ASSUMPTION pending Deborah — see F06 OPEN).
- Never output more or fewer than 7 sections; never change order; closing line always last.

### Streaming (`streamer.ts`)
- Characters-per-second: text replies 45 cps; answer sections 70 cps (sections are long). Jitter ±20 % per chunk; chunk size 2–6 chars to feel token-like.
- Section headers appear instantly when their section starts; body streams under them. Sections start collapsed except §1, but **during streaming the currently-streaming section is expanded** and auto-collapses (except §1) when the next one starts — the user sees progress without a wall of text. ASSUMPTION; easy to switch.
- Auto-scroll follows the stream unless the user scrolls up (then show a round "scroll to latest" icon button above the composer).

## 3. Guardrail behaviours

| Guardrail | Engine output | UI pattern | Counts? | Gated? |
|---|---|---|---|---|
| Emergency | `message(kind:'emergency')`; conversation `status:'safety'`; composer locked until user taps "I'm safe" or "Call 911" | `EmergencyInterrupt` | No | Never |
| Crisis | `message(kind:'crisis')`; conversation continues; product suppressed for this conversation | `CrisisSupportCard` | No | Never |
| Medication | `message(kind:'medicationSafety')` **then** continue normal pipeline | `MedicationSafetyCard` | n/a | n/a |
| Out of scope | `message(kind:'outOfScope')` + escalation button + in-scope option rows | `OutOfScopeReply` | No | Never |
| Escalation | Normal reply **plus** `message(kind:'escalation')` | `EscalationCard` | n/a | n/a |

Detection is keyword/regex based (good enough for a prototype). S13 "Safety test bench" adds dev-only option rows that insert test phrases.

## 4. Free-consultation counting (`counting.ts`)

- A consultation is **counted when its 7-section answer finishes streaming** (`completeConsultation`). Not on first message, not during intake.
- Not counted: stopped/errored answers, safety replies, out-of-scope replies, short follow-up replies within an answered consultation, check-in small talk.
- Trial counter in the UI shows `3 - used` ("3 free consultations left" → "1 left" → hidden after purchase).
- Gate fires only when the user tries to **start** a new consultation with 0 left. Reading history, My Health, records, safety and Account always work.

## 5. Memory (`memory.ts`)

- On answer completion, store `conversation.summary` (from script) and topic.
- Greeting on Conversation empty state: no history → time-of-day greeting; with history → "Welcome back, {name}. Last time we talked about {topic}." + option row "Continue that conversation".
- Check-in mode (deep link from notification, or "Tell Deborah how it's going"): Deborah opens with the check-in line referencing the last topic and product/habits; quick replies Yes / Partly / Not yet → script `checkin` → offers lab upload (`labRequest` message with "Upload my labs" button).

## 6. Labs (`labs.ts`)

- Any picked file (photo/PDF) → 1.5–2.5 s "Reading your report…" → returns `sample-reports.sample-a` values → M-5.4 confirm screen.
- Manual entry starts with an empty row set + marker suggestions.
- After confirmation, the next answer uses the `withLabs` variant.

## 7. Copy rules for scripts (placeholder writing)

- Deborah's voice: warm, plain-spoken, "brilliant doctor friend". First person. Short paragraphs.
- Hedged clinical language only: *may, might, worth exploring, consider asking about*. Never "you have", never dosing, never "stop/start" medication.
- Every answer ends with the mandatory closing line.
- Mark all script JSON `status: "placeholder"` unless text is copied from the Handbook (`"handbook"`).

## 8. Error and edge states

| Case | Behaviour |
|---|---|
| "Fail next AI response" toggle | After thinking: error bubble "I couldn't finish that — tap to try again." Retry re-runs the plan. Not counted. |
| Empty input | Send disabled |
| Very long input (> 2,000 chars) | Counter appears at 1,800; send disabled above 2,000 (matches legacy prototype limit) |
| User sends while generating | Not possible (composer locked; Stop available) |
| Switch profile mid-stream | Stream continues in the original profile's conversation |
