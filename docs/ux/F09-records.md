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
| Visit Notes (Figma 9.3) | `NoteRow`: title, kind icon (questions / saved answer / after visit), updated date, first line | "Jot down questions before your next visit" + New note | **+ New note** (→ M-9.4) |
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

**Presentation:** modal. A white A4-proportioned page preview rendered in HTML: app logo, profile name, date, "Questions for your provider", "Tests worth discussing", summary of sections, closing line, disclaimer footer. Actions: **Share** (toast) · **Print** (`window.print()` of the preview only — optional) · Done.
**Open:** Premium gating for PDF (brief lists it under Premium) — prototype allows for all and shows "Premium" as plain footnote text.
