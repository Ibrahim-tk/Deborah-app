# F09b — My Visit Notes / For My Provider (Miro Step 5)

**Goal:** After Discuss with provider (or an urgent provider-directed answer), assemble a structured note the client can review, save, and print for their clinician.
**Engine:** `assembleVisitBrief` / `hasEnoughDetailForVisitBrief` in `src/shared/engine/visitBrief.ts`  
**UI:** M-9.7 · related PDF via M-9.6  
**Related:** [F09-records.md](F09-records.md) · [F02e-guidance.md](F02e-guidance.md) · next: [F09c-log-visit.md](F09c-log-visit.md) (Miro Step 6, after the visit)

## Entry

From Step 4 What’s next **Discuss with provider**, AnswerActions **Visit Notes** / **Save PDF** (when enough detail), or urgent provider-review path.

### Gate — Enough detail from the conversation?

| Result | Behaviour |
|---|---|
| **Yes** (Rule A: `guidanceGivenAt` set, or a completed 7-section answer) | Open **M-9.7** with assembled brief |
| **No** | Toast **“Let’s talk first — download turned off”** (`VISIT_NOTES_GATE_TOAST`) → stay on Ask Deborah (M-2.1), composer focused. No PDF. One gate (`withVisitBriefGate` in `useMessageActions`) serves Visit Notes, Save PDF and Discuss with provider. |

## M-9.7 · My Visit Notes

| Meta | |
|---|---|
| Presentation | Modal |
| Params | `{ messageId?, conversationId?, noteId? }` — assemble from message/conversation, or reopen a saved `provider-brief` note |

**Header (printed):** client name · date of birth · priority flag if urgent · “What this is: note for the provider”.  
**Not in header:** appointment date, provider name/specialty (Miro).

**Sections (fixed order):**

1. Chief Complaint — client’s words / duration (editable on review)
2. Clinical Context — Deborah AI, plain language for a clinician
3. Tests to Discuss — primary + also-request, each with reason
4. Questions for My Provider — each with “why I’m asking”
5. Current Medications & Supplements — Health Profile; Genesis Gold note if taking
6. Red Flags & Recommendation — screened + Deborah AI recommendation
7. Disclaimer — not a diagnosis/prescription · Genesis Gold not a pharmaceutical · not a licensed prescriber

**Actions:** Save a copy to My Visit Notes · Download PDF (M-9.6 HTML print).

### After save / download — Appointment date given?

| Path | Behaviour |
|---|---|
| **Yes** | Capture date (scheduling only, not printed) · notification for the **day after** opens the visit debrief for this brief (`visit:<briefNoteId>`, [F09c](F09c-log-visit.md)); Home also shows “How did your visit go?” once the date has passed |
| **No** | “Take the notes to the appointment” · follow-up notification in **7 days** regardless |

## Persistence

Saved as a Visit Note with `kind: 'provider-brief'` and structured `brief` payload. Listed on M-9.1; reopen opens M-9.7.

## Scenarios

- **S04** / any answered guidance — Discuss with provider opens M-9.7  
- **S23** / **S24b** — early / mid-intake → gate fails (“Let’s talk first”)  
- **S24** — opens directly on M-9.7 with a seeded brief  
- **S24c** — urgent: provider-directed answer after a red flag; Visit Notes on the answer opens M-9.7 with the priority flag (What’s next is hidden on red-flag answers, so AnswerActions is the urgent entry)  

## Editability

- Always: chief complaint  
- Review mode: + Add / edit labs (name, tier, reason), questions (text + why), medications (name, dose); Genesis Gold callout when on profile  

## Acceptance

- [x] Enough detail → M-9.7 with all sections + disclaimer  
- [x] Not enough → toast, no download, composer/Ask Deborah  
- [x] Chief complaint editable; save creates `provider-brief` note  
- [x] PDF prints the same brief layout  
- [x] Appointment yes/no schedules the correct follow-up  
- [x] Labs / questions / meds editable with add rows 
