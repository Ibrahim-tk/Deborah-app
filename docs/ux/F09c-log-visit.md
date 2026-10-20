# F09c — Log your visit / After my visit (Miro Step 6)

**Goal:** after seeing a provider, the client records what happened in a minute or two — mostly by telling Deborah — and the useful parts update their Health Profile. They can then talk it through with Deborah (Step 3) or stop.
**Status:** spec (Phase 0). Build plan: [../planning/log-visit-flow-plan-2026-10-19.md](../planning/log-visit-flow-plan-2026-10-19.md)
**UI:** M-2.1 state *Visit debrief* · **M-9.8** Log your visit
**Related:** [F09b-visit-brief.md](F09b-visit-brief.md) (Step 5) · [F09-records.md](F09-records.md) · [F02b › Review and Confirm](F02b-profile-aware-chat-intake.md#review-and-confirm) · [F03-safety.md](F03-safety.md) · [F05 › Check-in](F05-followup-labs.md)

The dark "Provider Visit Summary" HTML mock is **content reference only**. DESIGN.md governs visuals: no pills/tags (the mock's `ROUTINE`/`SCHEDULE` selectors become option rows), weight ≤ 500, text ≥ 7:1. Built only from existing `@mobile/ui` primitives and patterns.

---

## Miro flow

```
(from Step 5) → Client came back from the provider visit → Record what happened
  → System extracts context (probe if not enough) → Update Health Profile
  → Discuss this with Deborah?  Yes → Step 3   ·   No → End
Sticky: the client can log a visit outcome anytime.
```

## Entry points

| Entry | Opens | Context |
|---|---|---|
| Notification the day after an appointment date set in Step 5 (deep link `visit:<briefNoteId>`) | M-2.1 Visit debrief | linked brief → reason + specialty prefilled |
| Home row **Log a provider visit**; contextual "How did your {specialty} visit go?" when a brief's appointment date has passed | M-2.1 Visit debrief | linked brief if any |
| Records › Visit Notes › **+ New note** → ActionSheet **Log a provider visit** | M-2.1 Visit debrief | none |
| M-9.7 My Visit Notes footer **Log how the visit went** (saved brief, no outcome yet; becomes **View visit outcome** once logged) | M-2.1 Visit debrief / M-9.8 read | linked brief |
| Chat intent ("I just saw my doctor", "back from my appointment") | Deborah offers the debrief in the current conversation | none |
| Reopen a saved after-visit note from Records | M-9.8 read mode | saved outcome |

The generic F05 check-in (`followup:<profileId>`) is unchanged; only brief-linked appointments use `visit:` (M-9.7 "appointment date given → yes" now schedules `visit:<briefNoteId>`). All entries built in log-visit phase 5.

- **Home:** "How did your visit go?" heads Next steps while a brief's appointment has passed and no after-visit note links to it; otherwise "Log a provider visit" sits after the profile steps.
- **Chat intent:** in an empty, answered or check-in chat, a report like "I just saw my endocrinologist…" (not a question) gets "It sounds like you've just seen a provider. Would you like to log how it went?" — **Log my visit** starts a debrief that reads that message first, then asks only for gaps; **Not now** carries on as normal. Never during intake or an answer; safety runs first.

## What is recorded

| Bucket | Fields | Capture | Required for "enough context" |
|---|---|---|---|
| Visit | date (≤ today, default today) · linked brief · reason (prefilled from brief's chief complaint) | `DateWheel`, text | — never probed |
| Provider seen | specialty · name (opt.) · practice (opt.) · follow-up (opt.) | `OptionList` + `Input` | **specialty** |
| What I took away | what they said · my understanding (opt.) · still unanswered (opt.) | `TextArea` | **what they said** |
| Tests ordered | name · status *Ordered / Done / Results back* | rows, status as `OptionRow` | asked once |
| Medication & supplement changes | name · change *Started / Stopped / Changed dose / Continue* · note | rows | asked once |
| Next steps | text · "I need to book this" (plain secondary text, not a tag) | rows | — |
| My own notes | free text | `TextArea` | — |

Specialty options (default): Primary care · Gynecology · Endocrinology · Cardiology · Functional / integrative · Other (free text).
`// OPEN:` specialty list needs Deborah's sign-off.

## M-2.1 state · Visit debrief

`Conversation.status: 'debrief'`, `debriefStage: 'opening' | 'listening' | 'probe' | 'summary' | 'saved'`.

1. **Opening** — "Welcome back, {name}. How did your visit go?" (with "your {specialty} visit" when linked). Quick replies: **Tell Deborah** (focuses the composer) · **Fill it in myself** (→ M-9.8 empty) · **Not now** (ends; nothing saved).
2. **Listening** — composer with voice. Thinking line "Reading your notes".
3. **Probe** — for each empty required bucket, then tests, then med changes: **one** question, at most **3** in total, each with **Skip**. Small answer sets use quick replies / option rows; open answers use the composer.
4. **Summary** — card "Here's what I noted from your visit": one line per filled bucket, empty buckets hidden. Actions **Review and save** (→ M-9.8 prefilled) · **Looks right, save**.
5. **Saved** — "Saved to My Visit Notes." + "{n} updates to your health profile" when confirmed. Then **documents from the visit?** ("after-visit summary, a lab order or results") — **Upload a document** (→ M-11.3) · **Nothing to add**. Then **Discuss this with Deborah?** — **Yes, let's talk** · **Not now**. (2026-10-20)
6. **Yes** → same conversation becomes a normal consultation (Step 3), topic = visit reason, memory line "After your {specialty} visit on {date}…". The conversation keeps `afterVisit` (note id, memory line, summary): her answer opens with the memory line, and a Visit Brief built from it adds "Recent provider visit (as reported by the client): …" to Clinical Context. **Not now** → end, toast "Saved to My Visit Notes".

**Copy rules:** Deborah repeats what the client reports ("You noted your provider said…"); she never states a diagnosis as fact, interprets results, or comments on doses. All copy lives in `src/shared/data/conversation/debrief.json` with `"status": "placeholder"`.

**Counting:** debrief turns are not counted (like check-in). The Step 3 consultation after **Yes** is counted normally.
`// OPEN:` confirm counting with the account team.

## M-9.8 · Log your visit

| Meta | |
|---|---|
| Presentation | Sheet, large, dismissible (unsaved-changes guard). Read mode on reopen. |
| Params | `{ conversationId?, noteId?, briefNoteId?, profileId? }` |

**States:** empty (manual) · prefilled (from debrief) · editing a row (inline, like M-2.13) · read (saved) · unsaved changes on close · delete confirm.

**Layout, in order:** Visit · Provider seen · What I took away · Tests ordered (+ Add test) · Medication & supplement changes (+ Add) · Next steps (+ Add) · My own notes · **Update my health profile** · **Your notes before the visit** (link row → M-9.7, only when linked).

- Extracted values with confidence < 0.7 show a quiet secondary line "Check this" (same rule as intake).
- **Update my health profile** (built, log-visit phase 4): one checkbox row per medication change that would alter the profile — Started and not on it → "Add {name}"; Stopped and on it → "Remove {name}". All ticked to start; only ticked rows apply, on Save, to the Health Profile with source `'visit'` (mirrored into intake for the engine's medication gate). Changed dose and Continue never edit the profile.
- In chat, the summary card lists the same updates as "Health profile updates", so **Looks right, save** applies all of them knowingly; Deborah then says how many changed.
- Footer: **Save** (primary) · **Not now**. Save is disabled only when every field is empty.
- Close with unsaved edits → alert **Save** / **Discard**.
- Read mode overflow (`ActionSheet`): **Edit** · **Share** (plain-text, toast) · **Delete** (alert, "This can't be undone.").

## Persistence

Saved as `Note` with `kind: 'after-visit'` and a structured `visit: VisitOutcome` payload. Listed in Records › Visit Notes ("After my visit", calendar icon). Notes with `visit` open M-9.8; legacy text-only after-visit notes still open M-9.4. A Step 5 brief built later reads confirmed medication changes from the Health Profile.

## Safety

All debrief text goes through `guardrails.ts` unchanged (built, log-visit phase 3). Emergency, crisis, medication and out-of-scope responses behave exactly as in F03 and pause the debrief; it can be resumed afterwards. "Should I take / stop / change…" about a logged medication change → MedicationSafetyCard.

**Known conflicts with F03 in a debrief (OPEN, F03 left exactly as specified):**
- The medication card is additive and keyed on medication *names*, so a plain report ("they ordered estradiol") also shows it, once per name per conversation. Default: keep. Question for Deborah/legal: in a debrief, show it only when she asks for advice ("should I…")?
- Out-of-scope *replaces* the reply, and words like "heart" match it, so "saw my cardiologist… my heart looks fine" gets the out-of-scope line and that message isn't read into the visit. The debrief continues on her next message. Default: keep. Question: exempt specialty words inside a debrief?
- Questions ("should I stop taking…?") are never extracted as medication changes.

## Scenarios

- **S25** visit debrief — lock screen with the `visit:` notification; tap → debrief linked to the brief; Home shows "How did your visit go?"
- **S25b** log anytime — no brief
- **S25c** visit logged — saved outcome, reopen read mode
- **S25d** debrief safety — “Should I stop taking my magnesium?” shows the medication card; nothing is logged as a change

## Open questions

1. Specialty list (above).
2. Auto-update of the medication list — default: only via confirmed **Profile updates**.
3. Tests ordered → Labs — default: stay on the note; "Results back" shows **Add results** → M-5.3; no lab report is auto-created.
4. Genesis Gold / Sacred Seven status — default: an ordinary medication-change row, only if already on the profile; no product prompt.
5. "Oracle's notes" block from the mock — default: link to the Step 5 brief, not a copy.
6. Deborah reading after-visit notes in later consultations (same OPEN as M-9.4) — default: yes for structured notes once the client picks **Discuss**.
7. Debrief counting (above).

## Acceptance

- [x] One detailed message + ≤ 3 skippable probes reaches the summary
- [x] **Fill it in myself** produces the same note as the chat path
- [x] Nothing reaches the Health Profile without Save in M-9.8 or **Looks right, save**
- [x] Saved note appears in Records › Visit Notes and reopens in read mode; edit / share / delete work
- [x] **Yes** → consultation with visit context; **Not now** → end + toast
- [x] Day-after notification from Step 5 opens the debrief for that brief
- [x] F03 safety interrupts unchanged inside the debrief
- [x] M-9.4, M-9.7 and the F05 check-in unaffected
- [ ] No pills/badges/tags, weight ≤ 500, no new animations, text ≥ 7:1 — built from existing tokens/primitives; contrast not measured

## Regression (log-visit phase 6, 2026-10-19)

- All 34 scenario seeds load. Engine: F05 check-in start, answered-chat follow-up, emergency precedence, new-chat intake and mid-intake text are unchanged; a visit report mid-intake is not intercepted.
- UI: legacy text-only Visit Notes open M-9.4 (S08); provider briefs open M-9.7; M-9.8 read / edit / save / delete-confirm / unsaved alert (S25c).
- `npm run typecheck` and `npm run build` pass; `npm run lint` errors are pre-existing in HealthBasics, CodeStep and perspective.ts.
