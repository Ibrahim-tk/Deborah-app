# Plan — My Visit Notes / "For My Provider" flow (Miro Step 5)

**Date:** 2026-10-19 · **Surface:** internal (default) · **Spec:** `docs/ux/F09b-visit-brief.md`
**Constraint:** No visual redesign. Reuse existing `@mobile/ui` primitives, existing patterns and the existing `BriefDocument` styling. The dark "For My Provider" HTML mock is *content reference only* — DESIGN.md wins on visuals (no pills/tags like `PRIMARY`/`CURRENT`, weight ≤ 500, 7:1 text).

---

## 1. Status — is this flow already built?

**Mostly yes (~80%).** M-9.7 *My Visit Notes* exists and is wired.

| Miro node | Status | Where |
|---|---|---|
| Entry: Step 4 "Discuss with provider" | Partial — row exists, handler must be verified | `patterns/chat/GuidanceNextSteps` |
| Entry: Step 3 urgent case | **Unverified / likely missing** | red-flag answer path |
| Entry: My Visit Notes (reopen) | Done | `Records/parts/RecordsList.tsx:92` |
| Gate "Enough detail?" | Done (Rule A) | `engine/visitBrief.ts` `hasEnoughDetailForVisitBrief` |
| No → "Let's talk first — download turned off" → back to Ask Deborah | **Copy drift** — toast says "Download is available after your first conversation"; no composer focus | `Conversation/parts/useMessageActions.ts` |
| Header: name, DOB, priority if urgent, "What this is" | Done (no appointment/provider, per Miro) | `BriefDocument` |
| Sections 1–5 | Done | `BriefDocument`, `BriefLists` |
| Red Flags & Recommendation | Done (rendered as 6 + 7) | `BriefDocument` |
| Disclaimer (3 lines) | Done | `VISIT_BRIEF_DISCLAIMER` |
| Review and edit | Done, but scope differs: Miro sticky says **only Chief Complaint** editable; code also edits labs/questions/meds | `BriefLists` |
| Save a copy to My Visit Notes | Done (`kind: 'provider-brief'`) | `VisitBrief.tsx` |
| Download PDF | Done (M-9.6 + `window.print`) | `PdfPreview.tsx` |
| Appointment date given? Yes → day-after check-in | Done | `AppointmentFollowUp` |
| No → "Take notes to appointment" + 7-day follow-up | Done | `VisitBrief.tsx` |
| Copy brief to clipboard (from mock) | Missing | — |
| "Why I'm asking" per question | Generic placeholder string for every question | `questionsFrom` |
| Specialty as a separate field (mock sticky) | Conflicts with Miro ("Provider — we don't need this") → OPEN | — |
| Web W-9.7 | Not built (out of scope unless asked) | — |

**Conclusion:** this is a *finish and harden* job, not a new build.

---

## 2. Open questions (implement documented default + `// OPEN:`)

1. **Editability scope.** Miro: "details that can be edited — Chief Complaint". Spec F09b: labs/questions/meds also editable. *Default:* keep spec behaviour (already shipped, acceptance ticked); add `// OPEN:` in `BriefLists.tsx`. A dev toggle can switch to complaint-only.
2. **Provider / specialty fields.** Miro says not needed; mock sticky says specialty separate. *Default:* omit; `// OPEN:`.
3. **Red Flags vs Recommendation** — one section (Miro) or two (current). *Default:* keep two headings under one numbered block "6. Red Flags & Recommendation" to match Miro numbering.
4. **Gate toast copy.** Spec is explicit: "Let's talk first — download turned off". *Default:* use spec copy.

---

## 3. Build phases

Each phase is independently shippable; run `npm run lint && npm run typecheck` after each; walk the journey in `/internal` before moving on.

### Phase 0 — Audit & safety net (no code changes)
- Walk scenarios **S04, S23, S24, S24b** and the journey in `shell/journeys/extendedJourneys.ts`; screenshot current M-9.7, M-9.6, gate toast.
- Trace `GuidanceNextSteps` `provider` row → confirm it calls `openVisitBriefOrGate`.
- Trace red-flag / urgent answer (F03 safety) → does any action reach M-9.7? Record result.
- Output: checklist of confirmed gaps (update table above).

### Phase 1 — Entry points & gate (logic only)
- `useMessageActions.ts`: replace both toasts with spec copy **"Let's talk first — download turned off"**; extract to a constant in `@shared/store` beside `VISIT_NOTES_TAKE_BODY`.
- On gate fail: stay on M-2.1 and focus the composer (reuse existing composer focus hook if present; otherwise no-op + `// OPEN:`).
- Ensure **Discuss with provider** row routes through the same `openVisitBriefOrGate` (single gate function — move it to `shared/engine` or a mobile hook so Conversation, FirstConsult and GuidanceNextSteps share it).
- **Urgent entry (Step 3):** when `conv.redFlag` and the answer is provider-directed, expose "Prepare for my provider" via the existing `AnswerActions` row (no new component). Brief header shows priority flag (already supported). **Must not** alter emergency/crisis behaviour — urgent banner and emergency CTAs stay first.
- Scenarios: add **S24c "Visit Notes — urgent"** (seeded red-flag conversation) in `shared/scenarios`.

### Phase 2 — Content quality of the assembled brief (engine only)
- `questionsFrom`: derive per-question "why" — if the bullet contains " — " / "because", split it; otherwise fall back to the existing placeholder. Add optional `why` to answer JSON bullets (`providerQuestions`) in scripts; mark `"status": "placeholder"`.
- `labsFrom`: keep `parseLabBullet`; let JSON specify tier explicitly (`tier` field) instead of index<3 heuristic, with heuristic as fallback.
- Chief complaint: append duration if intake has it ("Duration: …" line, as in mock).
- Red flags text: keep placeholder wording; never generate diagnosis language.
- Unit-style sanity: add a tiny dev assertion or WidgetLab scenario rendering the brief from each script (`generic`, `family-fatigue`, `lab-review`).

### Phase 3 — Review & edit polish (existing UI only)
- Renumber headings to Miro order: 1 Chief Complaint · 2 Clinical Context · 3 Tests to Discuss · 4 Questions · 5 Meds & Supplements · 6 Red Flags & Recommendation · Disclaimer.
- Editable question "why" field (second `input` in the existing `editRow` pattern).
- Genesis Gold row: show existing `gold` callout in edit mode too (currently only read mode) with an editable "starting dose / notes" field.
- Dirty-state guard: if edits unsaved and user taps **Done**, reuse existing confirm `Sheet`/`Dialog` primitive ("Save changes?"). If no primitive exists, autosave on Done instead (pattern from `NoteEditor/useNoteAutosave`).
- Empty rows: strip blank labs/questions/meds on save.
- Optional dev toggle `visitNotesEditScope: 'full' | 'complaintOnly'` in shell dev toggles (resolves OPEN #1 for demos).

### Phase 4 — Save, PDF, copy
- **Copy brief to clipboard:** add a third `Button variant="secondary" leadingIcon="copy"` in the M-9.7 footer (or in M-9.6 next to Share). Plain-text serializer `visitBriefToText(brief)` in `engine/visitBrief.ts` (mirror `answerToText`).
- Ensure Save and Download both funnel through `persist()` once (already true) and trigger the appointment question only once per session of the modal.
- M-9.6: when opened with `briefNoteId`, print **the edited** brief (verify; currently reads saved note — correct).
- Print CSS check: `BriefDocument.module.css` `@media print` hides shell chrome; verify page breaks between sections.

### Phase 5 — Appointment follow-up
- Already correct; harden:
  - Reject past dates (min = simulated today via `nowFrom`).
  - Yes path: saves `appointmentDate` to the note (not printed) — verify reopening shows it in the modal meta only.
  - No path: copy "Take the notes to the appointment" — keep; 7-day notification uses `FOLLOW_UP_TITLE`.
  - Avoid duplicate notifications if user saves twice: dedupe by `noteId` in `scheduleNotification` call (pass deterministic id `visit-${noteId}`).
  - Notification deep link `followup:${profileId}` → confirm it lands on the follow-up check-in (F05).

### Phase 6 — Docs, xref, QA
- Update `docs/ux/F09b-visit-brief.md`: entry list (urgent), copy, OPENs, new scenario S24c, clipboard action.
- `docs/xref.md`: confirm M-9.7 row; W-9.7 "not built".
- Update journey steps in `shell/journeys/extendedJourneys.ts` + `journeyPilot.ts`.
- `screen-notes.json` note for M-9.7.
- Full regression (below), then `npm run lint`, `npm run typecheck`, `npm run build`.

---

## 4. Do-not-break checklist (regression)

- [ ] S04 → Discuss with provider → M-9.7 with all sections
- [ ] S23 / S24b → gate toast, no M-9.7, no M-9.6
- [ ] S24 → opens seeded brief
- [ ] AnswerActions **Save PDF** / **Visit Notes** still work for non-brief answers (saved-answer notes unaffected)
- [ ] `addQuestion` → "Questions for my next visit" note unchanged
- [ ] Records list: provider-brief rows reopen M-9.7; other note kinds still open M-9.4
- [ ] FirstConsult §7 save still lands on M-9.7
- [ ] Emergency / crisis / medication / out-of-scope safety flows unchanged (F03)
- [ ] Free-limit / Premium gating on PDF unchanged
- [ ] Mobile ↔ web isolation: no cross-imports; `@xref` headers updated
- [ ] No new pills/badges, no weight > 500, no new animations

## 5. Files touched (expected)

`src/shared/engine/visitBrief.ts` · `src/shared/store` (copy constants) · `src/shared/scenarios/index.ts` · `src/shared/data/conversation/scripts/*.json` · `src/apps/mobile/screens/consultation/Conversation/parts/useMessageActions.ts` · `src/apps/mobile/patterns/chat/GuidanceNextSteps` · `src/apps/mobile/screens/records/VisitBrief/**` · `src/apps/mobile/screens/records/PdfPreview/PdfPreview.tsx` · `src/shell/journeys/*` · `docs/ux/F09b-visit-brief.md` · `docs/xref.md`

No new screens, no new primitives, no registry changes (except none expected).
