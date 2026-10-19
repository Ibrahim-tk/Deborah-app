# F09 — My Health records: history, Visit Notes & labs

**Goal:** everything saved for the active profile, ready to bring to a provider. Reached from the hub's quick links.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598
**Scenarios:** S08, S09

---

## M-9.1 · Records

| Meta | |
|---|---|
| Presentation | Push from M-7.2 (tab bar visible) |
| Params | `{ segment: 'consultations' | 'notes' | 'labs' }` |

**Layout:** header "My Health records" (back) · **Segmented** Consultations | Visit Notes | Labs · list for the segment · tab bar.

| Segment | Row | Empty state | Primary action |
|---|---|---|---|
| Consultations | `ConsultationRow`: topic, date, status as plain subtitle text ("Answered" / "In progress" · "With labs") | "No consultations yet" + Ask Deborah | — |
| Visit Notes (Figma 9.3) | `NoteRow`: title, kind icon (questions / saved answer / after visit), updated date, first line. After-visit notes with visit details open **M-9.8**; text-only notes open M-9.4; provider briefs open M-9.7 | "Jot down questions before your next visit" + New note | **+ New note** → ActionSheet: Write a note (→ M-9.4) · Log a provider visit (→ visit debrief, [F09c](F09c-log-visit.md)) |
| Labs | report row: lab name, date, n values | "No lab results yet" + Add labs | **+ Add** (→ M-5.3) |

Search (OPEN) not in v1. Newest first.

## M-9.2 · Consultation detail

**Presentation:** push. **Layout:** header topic + date · read-only transcript (user + Deborah bubbles, collapsed intake as a summary line "Intake: 46–50 · no meds · irregular cycle" expandable) · full **AnswerSections** · actions row **Download PDF** (→ M-9.6) · **Share** · **Continue chat** (→ Ask tab, reopens this conversation with memory).

## M-9.4 · Note editor (NOT IN WIREFRAMES)

**Presentation:** modal. **Layout:** title field · kind Segmented control (Questions for my visit · After my visit · Other) · body text area (auto-grow; for "questions" kind, each line renders as a checklist item) · source link if saved from an answer ("From Deborah's answer on {date}").
**Behaviour:** autosave on change (debounced, toast on close "Saved"); × with empty note discards silently; delete in overflow menu → SystemAlert.
**Open:** may Deborah read these notes in later consultations (consent)?

## M-9.5 · Lab report (NOT IN WIREFRAMES)

Read mode of the M-5.4 layout: metadata + values; overflow menu: Edit (→ M-5.4 edit mode), Delete (SystemAlert). Button **Ask Deborah about these labs** → Ask tab, starts lab-review consultation.

## M-9.6 · PDF preview (NOT IN WIREFRAMES)

**Presentation:** modal. When the conversation has enough detail for Miro Step 5 (or `briefNoteId` is passed), prints the structured **My Visit Notes** brief (same layout as M-9.7). Otherwise a shorter A4 page: logo, profile name, date, "Questions for your provider", "Tests worth discussing", summary of sections, closing line, disclaimer footer. Actions: **Download PDF** (toast "PDF downloaded"; F11 Saved Reports) · **Share** (toast) · **Print** (`window.print()` of the preview only — optional) · Done.
**Open:** Premium gating for PDF (brief lists it under Premium) — prototype allows for all and shows "Premium" as plain footnote text.

## M-9.7 · My Visit Notes (Miro Step 5)

See **[F09b-visit-brief.md](F09b-visit-brief.md)**. Structured provider brief: header (name, DOB, priority, what-this-is) · chief complaint (editable) · clinical context · tests · questions · meds · red flags & recommendation · disclaimer. Save to Visit Notes (`provider-brief`) · Download PDF → M-9.6 · then appointment-date follow-up.

## M-9.8 · Log your visit (Miro Step 6)

See **[F09c-log-visit.md](F09c-log-visit.md)**. What happened at a provider visit, usually told to Deborah in a short debrief (M-2.1) and reviewed here: visit, provider seen, what I took away, tests ordered, medication changes, next steps, own notes, and ticked health-profile updates. Saved as an `after-visit` note with a `visit` payload; reopens in read mode (Edit · Share · Delete).
