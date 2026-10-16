# F02e — Personalized guidance (Miro Step 4)

**Goal:** After Ask Deborah has (or almost has) enough context, produce the 7-section guidance, then offer simple What’s next paths. Prototype simulates knowledge coverage and team handoff — no live LLM or email.

**Engine:** `beginGuidance` in `src/shared/engine` · **UI:** `AnswerSections` + `GuidanceNextSteps` on M-2.1  
**Related:** [F02-consultation.md](F02-consultation.md) · [07-ai-simulation.md](../07-ai-simulation.md)

## Constraints

- No redesign: reuse OptionRow, AnswerActions, toasts, existing sheets.
- UI and test paths stay simple: one State scenario or clear in-chat trigger per branch.

## Chevron flow (paste beside mockup)

**Happy path (enough context, in coverage)**

Ask Deborah / Tell me what you think > enough details? yes > covers concern? yes > stream 7 sections > product if allowed > disclaimer / closing > save as Guidance given > schedule follow-up (~14 days) > What’s next OptionRows

**Not enough context (early first look)**

Ask for guidance > enough details? no > early first look (what’s still missing) > answer remaining questions > ask for guidance again

**Out of coverage**

Ask for guidance > enough details? yes > covers concern? no > outside Deborah’s knowledge > Ask Deborah’s team (demo toast + summary) > optional Book > End (uncounted)

**What’s next (after Guidance given)**

Read summary > Ask a follow-up > composer  
Read summary > Discuss with provider > enough detail? → M-9.7 My Visit Notes (else “Let’s talk first”)  
Read summary > Save summary → same as Discuss with provider (M-9.7)  
Read summary > Book a consultation > M-8.2 + team toast  
Read summary > Upload labs > M-5.3 > reassess > updated summary  
Read summary > Buy product > M-2.7 (if product)  
Read summary > View 90-day plan > M-7.3 (if plan exists)

**Follow-up**

Guidance given > auto check-in in ~14 days (or M-2.8 pick) > check-in chat  
Appointment mentioned / booked > day-after check-in

## Counting

| Outcome | Counts toward 3 free? |
|---|---|
| Full 7-section guidance | Yes |
| Early first look | No |
| Out of coverage / team handoff | No |
| Same-topic lab summary refresh | No |

## 7-section order (unchanged)

1. What I'm Hearing · 2. The Hypothalamic Connection · 3. What This May Mean · 4. Questions for Your Provider · 5. Tests Worth Discussing · 6. What You Can Do Now · 7. A Word from Deborah + closing line
