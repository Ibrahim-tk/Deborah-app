# Plan — Log your visit / "After my visit" (Miro Step 6)

**Date:** 2026-10-19 · **Surface:** internal (default) · **Precedes:** Step 5 plan `visit-notes-flow-plan-2026-10-19.md`
**Spec:** `docs/ux/F09c-log-visit.md` · **Status (2026-10-19):** phases 0–6 built. Open items: F09c › Open questions and › Safety conflicts.
**Constraint:** No new visual language. The dark "Provider Visit Summary" HTML form is **content reference only** — it defines *what* we capture, not *how it looks*. DESIGN.md wins: no pills/tags (`ROUTINE`/`SCHEDULE` selectors become option rows), weight ≤ 500, 7:1 text, no shadows on non-floating surfaces. Every surface below is built from existing `@mobile/ui` primitives and existing patterns.

---

## 1. The Miro flow, restated

```
Start → (from Step 5) → Client came back from the provider visit
      → Record what happened:
          · Provider seen (kind: cardiologist, etc.)
          · What I took away
          · Tests ordered + status
          · Medication / supplement changes
          · Next steps
          · Own notes
      → System extracts context   (sticky: probe if not enough context)
      → Update Health Profile
      → Discuss this with Deborah?  Yes → Step 3 (consultation)   No → End
Sticky: client can log the visit outcome ANYTIME (not only after Step 5).
```

## 2. UX stance (the important part)

The mock is a 7-section, 25-field desktop form. On a phone, after a tiring appointment, that form will not get filled in. Our product is AI-native and already has the exact machinery Miro describes ("system extracts", "probe", "update profile"). So:

1. **Talk first, form second.** The default capture is a short conversation with Deborah: *"How did it go? Tell me in your own words — who you saw, what they said, anything they ordered or changed."* Free text or voice (existing Composer + mic). One message can fill most of the record.
2. **Extract, then probe only for gaps.** The mock extractor (deterministic, `shared/engine`) fills the six Miro buckets. For each *empty required* bucket Deborah asks **one** short follow-up, with option rows where the answer space is small (specialty, test status, change type) and the composer where it isn't. Max 3 probes; every probe has **Skip**.
3. **Review, never silent-save.** Everything lands on a review sheet that reuses the **Review and Confirm** model (M-2.13 / `PendingFact` / `confirmFacts`): each item is a row, tap to edit, *Save* commits. Nothing reaches the Health Profile without confirmation — same rule as intake.
4. **Structured fallback for people who prefer a form.** "Fill it in myself" opens the same review sheet empty, section by section. Same data, same save.
5. **Close the loop.** After save: *"Want to talk this through with me?"* → Yes reopens a consultation seeded with the visit (Step 3); No → done, toast "Saved to My Visit Notes".
6. **Anytime entry.** Home, Records › Visit Notes, the day-after notification Step 5 already schedules, and a typed intent in chat ("I just saw my doctor").

### Field mapping — mock → our record

| Mock section | Our bucket | Capture | Required for "enough context" |
|---|---|---|---|
| Header: name / DOB / visit date | Visit date (profile is implicit) | Date wheel (`DateWheel`), default today; ≤ today | yes (defaults, never probed) |
| 1 Chief complaint + duration | *Reason for the visit* — prefilled from linked Step 5 brief's `chiefComplaint` | text | no (prefilled when linked) |
| 2 Provider seen: name, specialty, practice, follow-up | **Provider seen** — specialty (option list), name (optional), practice (optional) | option rows + inputs | **specialty** |
| 3 Diagnosis / my understanding / not addressed | **What I took away** — what they said · my understanding · still unanswered | text ×3 (only first probed) | **what they said** |
| 4 Labs ordered: test, ordered by, status + lab notes | **Tests ordered** — name · status (Ordered / Done / Results back) | rows, status as option rows | no — probe "Did they order any tests?" once |
| 5 Rx / supplement changes: name, change type, dose; Genesis Gold status | **Medication & supplement changes** — name · change (Started / Stopped / Changed dose / Continue) · note | rows | no — probe once |
| 6 Next steps with ROUTINE/SCHEDULE tags | **Next steps** — text · "Book something" flag rendered as plain secondary text, not a tag | rows (`OptionRow` + text) | no |
| Oracle's notes (read-only, generated) | *From your notes before the visit* — read-only block linking the Step 5 brief | link row | — |
| Own notes | **My own notes** | `TextArea` | no |
| Copy / Clear | Share (toast) · Delete in overflow (`ActionSheet` + `useAlert`) | — | — |

Practice name, "ordered by", follow-up appointment wording are kept as optional fields inside their sections; never probed.

### Clinical guardrails (non-negotiable)
- Deborah **reflects, never interprets**: no diagnosis restated as fact ("You noted the provider said…"), no dosing advice on med changes. Med changes trigger the existing **MedicationSafetyCard** rule if the user asks "should I…".
- Text typed into the debrief runs through `guardrails.ts` like any message → emergency / crisis / out-of-scope interrupts behave exactly as today.
- All Deborah copy in JSON carries `"status": "placeholder"`.
- Profile updates go through pending facts → confirm (source = `'visit'`).

---

## 3. Screens & states

| ID | Name | Presentation | Built from |
|---|---|---|---|
| **M-2.1 state** · Visit debrief | Conversation mode `status: 'debrief'` | existing Conversation | `MessageBubble`, `Composer`, `QuickReplies`, `OptionList`, `ThinkingIndicator`, `ReviewFactsCard`-style summary card |
| **M-9.8** · Log your visit | Review / edit sheet (large) | `Sheet` (like M-2.13) | `Header`, `ListRow`, `OptionRow`/`OptionList`, `Input`, `TextArea`, `DateWheel`, `Button`, `Divider`, `IntakeSectionHeader` |
| **M-9.8 read** · After-visit note | same screen, read mode, reopened from Records | `Modal` | same + `ActionSheet` overflow |
| M-9.1 Records | Visit Notes segment gains after-visit rows | existing | `NoteRow` (`after-visit` kind already has calendar icon + "After my visit") |
| M-2.0 Home | entry row | existing | `NextIntentRow` / `PromptStarterList` item "Log a provider visit" |

**No new primitives.** If something is genuinely missing, it goes in `apps/mobile/ui` as a primitive and in the Design System lab — flag it, don't inline it.

### M-2.1 · Visit debrief — states
1. **Opening** — Deborah: "Welcome back, {name}. How did your visit go?" (+ "with your {specialty}" when known from a Step 5 brief). Quick replies: *Tell Deborah* (focus composer) · *Fill it in myself* (→ M-9.8 empty) · *Not now*.
2. **Listening** — composer active, voice allowed. Thinking indicator "Reading your notes".
3. **Probe** (0–3 times) — one question each, in priority order: specialty → what they said → tests? → med changes?. Small answer spaces render `QuickReplies`/`OptionList` (e.g. Primary care · Cardiology · Endocrinology · Gynecology · Other); every probe has **Skip**.
4. **Summary card** — "Here's what I noted from your visit" — six bucket lines, collapsed empties hidden; actions **Review and save** (→ M-9.8 prefilled) · **Looks right, save**.
5. **Saved** — "Saved to My Visit Notes." + profile facts confirmed line if any + **Discuss this with Deborah?** quick replies *Yes, let's talk* / *Not now*.
6. **Yes → Step 3**: same conversation transitions to a normal consultation with the visit as context (topic = reason for visit; memory line "After your cardiology visit on {date}…"). Counted per existing counting rules.
7. **Safety interrupt** at any point → existing patterns, debrief paused, resumable.

### M-9.8 · Log your visit — states
- **empty** (manual entry) · **prefilled** (from debrief, extracted rows show a quiet "Check this" secondary line when confidence < 0.7, same as intake) · **editing a row** (inline, like ReviewFacts `editing`) · **read** (saved, reopened) · **delete confirm** · **unsaved changes on close** (`useAlert`: Save / Discard).
- Sections in order: Visit (date, provider specialty/name/practice) · What I took away · Tests ordered · Medication & supplement changes · Next steps · My own notes · *Profile updates* (list of pending facts derived from med changes / tests, each toggleable) · linked "Your notes before the visit" row (→ M-9.7) when linked.
- Footer: **Save** (primary) · **Not now** (text button). Save disabled only if *nothing at all* is filled.

---

## 4. Data & engine (shared, non-visual)

**Types** (`shared/types/domain.ts`):
```ts
export interface VisitOutcome {
  visitDate: ISODate;
  briefNoteId?: ID;            // link to Step 5 provider-brief
  reason?: string;
  provider: { specialty?: Specialty; name?: string; practice?: string; followUp?: string };
  takeaway: { said?: string; understanding?: string; unanswered?: string };
  tests: { name: string; status: 'ordered' | 'done' | 'results' }[];
  medChanges: { name: string; change: 'started' | 'stopped' | 'dose' | 'continue'; note?: string }[];
  nextSteps: { text: string; book?: boolean }[];
  ownNotes?: string;
  status: ContentStatus;
}
// Note gains: visit?: VisitOutcome  (kind === 'after-visit')
// Conversation.status gains 'debrief'; debriefStage: 'opening'|'listening'|'probe'|'summary'|'saved'
```
`FieldSource` gains `'visit'`.

**Engine** (`shared/engine/visitOutcome.ts`, mirrors `checkin.ts` + `extract.ts`):
- `startDebriefSteps(ctx, { briefNoteId? })`
- `extractVisitOutcome(text, prev) → { outcome, confidence }` — keyword rules (specialty lexicon, "ordered/drew/results", "started/stopped/increased/switched", dates "in 6 weeks").
- `nextProbe(outcome, asked) → ProbeId | undefined` — priority list, cap 3.
- `visitOutcomeFacts(outcome) → PendingFact[]` — med started/stopped → `medications`; tests → labs pending; specialty → care team (OPEN).
- `debriefToConsultSeed(outcome)` — topic + memory line for Step 3.
- `visitOutcomeToText(outcome)` for Share.

**Data:** `shared/data/conversation/debrief.json` (opening, probes, option sets, summary copy, all `"status": "placeholder"`); `shared/data/visit/specialties.json`.

**Store:** `notes` slice — `saveVisitOutcome(profileId, outcome, noteId?)`; reuse `confirmFacts`; notification handler: if the delivered `followup:` notification came from a Step 5 brief with an appointment date in the past → open **debrief** instead of the generic check-in (new deep link `visit:<briefNoteId>` to keep them distinct).

**Scenarios:** `S25-visit-debrief` (brief saved, appointment yesterday, notification delivered) · `S25b-visit-log-anytime` (no brief) · `S25c-visit-logged` (saved outcome, reopen read mode) · `S25d-visit-safety` (debrief text triggers medication safety).

---

## 5. Build phases

Each phase is shippable; after each run `npm run lint && npm run typecheck` and walk the journey in `/internal`.

### Phase 0 — Spec & decisions (docs only)
- Write `docs/ux/F09c-log-visit.md` from sections 1–4 (entries, states, acceptance).
- Add rows to `docs/xref.md`: M-9.8 (planned), M-2.1 debrief state.
- Register M-9.8 as `planned` in `navigation/registry.ts` (placeholder renders).
- Record OPENs (§6).

### Phase 1 — Data model & engine (no UI)
- Types, `debrief.json`, specialties, `visitOutcome.ts` (extract, probe, facts, text).
- Store action `saveVisitOutcome`; `after-visit` notes carry `visit`.
- Scenarios S25–S25d seeded.
- Sanity: WidgetLab scenario that runs `extractVisitOutcome` over 5 sample paragraphs and prints buckets.

### Phase 2 — M-9.8 review sheet (manual path first)
- Build sheet from existing primitives; every section, add/remove rows, date ≤ today, unsaved-changes alert, delete.
- Records › Visit Notes: after-visit notes with `visit` open M-9.8 read mode; legacy text-only after-visit notes still open M-9.4.
- Entry: Records "+ New note" ActionSheet gains "Log a provider visit".
- *Done when:* a user can log a full visit by hand and reopen it.

### Phase 3 — Visit debrief in chat
- Conversation `debrief` mode: opening, listening, probes (with Skip), summary card, save.
- Guardrails pass-through verified (S25d).
- Summary → "Review and save" opens M-9.8 prefilled; low-confidence rows show "Check this".

### Phase 4 — Profile update
- Pending facts from med changes / tests shown in M-9.8 "Profile updates"; confirm via `confirmFacts` with source `'visit'`.
- Health Profile (M-2.10) reflects confirmed changes; Step 5 brief built later picks up new meds automatically.

### Phase 5 — Entries & loop closure
- Home row "Log a provider visit" (and contextual variant "How did your {specialty} visit go?" when a brief's appointment date has passed).
- Step 5 day-after notification → debrief (`visit:<briefNoteId>`).
- Chat intent: classifier recognises "I saw my doctor / just got back from my appointment" → offers debrief.
- **Discuss with Deborah?** Yes → consultation seeded via `debriefToConsultSeed` (Step 3); No → end + toast.

### Phase 6 — Docs, journeys, QA
- Journey in `shell/journeys/extendedJourneys.ts` (Step 5 → appointment → notification → debrief → save → discuss).
- `screen-notes.json`, `@xref` headers, F09/F09b cross-links.
- Regression list (§7), then `npm run build`.

---

## 6. Open questions (implement default + `// OPEN:`)

1. **Specialty list** — default: Primary care, Gynecology, Endocrinology, Cardiology, Functional/integrative, Other (free text). Needs Deborah sign-off.
2. **Does a med change update the profile medication list automatically?** Default: only after confirm in "Profile updates"; "Changed dose" never edits dose (we don't store doses as clinical truth).
3. **Tests ordered → Labs?** Default: tests stay on the visit note; when results come back, "Add results" row links to M-5.3. No auto-created lab report.
4. **Genesis Gold / Sacred Seven status** (mock field) — default: appears as an ordinary med-change row only if already on profile; no product prompt in a clinical record.
5. **"Oracle's notes" read-only block** — default: link to the Step 5 brief rather than duplicating it.
6. **Can Deborah read after-visit notes in later consultations?** (same OPEN as M-9.4) — default yes for structured `visit` notes, since the user chose "Discuss".
7. **Counting** — debrief turns not counted (like check-in); the Step 3 consultation after "Yes" is counted.

## 7. Acceptance / regression

- [ ] Log via chat in ≤ 3 Deborah turns from one rich message; probes only for empty buckets, each skippable
- [ ] Manual "Fill it in myself" produces the identical note
- [ ] Nothing reaches Health Profile without confirm
- [ ] Saved note appears in Records › Visit Notes ("After my visit"), reopens read mode, editable, deletable
- [ ] Yes → consultation with visit context; No → end, toast
- [ ] Day-after notification from Step 5 opens debrief for that brief
- [ ] Emergency / crisis / medication / out-of-scope interrupts unchanged inside debrief
- [ ] Existing M-9.4 after-visit text notes, M-9.7 brief, check-in (F05) unaffected
- [ ] No pills/badges/tags, no weight > 500, no new animations, text ≥ 7:1
- [ ] Mobile/web isolation; W-9.8 listed "not built"

## 8. Files (expected)

**New:** `docs/ux/F09c-log-visit.md` · `shared/engine/visitOutcome.ts` · `shared/data/conversation/debrief.json` · `shared/data/visit/specialties.json` · `shared/scenarios/S25*.json` · `apps/mobile/screens/records/LogVisit/**` (M-9.8, with `parts/` per section to stay < 200 lines).
**Changed:** `shared/types/domain.ts`, `types/health.ts` · `store/slices/notes|notifications|conversations` · `engine/index.ts`, `classifier.ts` · `Conversation` (debrief mode + parts) · `Records/parts/RecordsList.tsx` · `Home` entry · `navigation/registry.ts` · `docs/xref.md` · `shell/journeys/*`.
