# Build Plan — Contextual Reuse of Existing Chat Widgets

Date: 15 October 2026

## Goal and scope

Use the widgets already demonstrated on `/wid` wherever they fit an existing question or action, so conversations feel more varied and easier to answer. Choose the widget because it fits the information being collected or the action being offered.

Preserve current question wording, conditions, question order, answer values, navigation destinations and overall journey. Do not add questions, clinical interpretations, reminder offers or booking steps merely to display more widgets. Reuse the existing widget designs; do not redesign the app.

This is a planning-only update. The conversation-ending change is specified separately in ENDING_FLOW_PLAN.md and must remain compatible with this work.

## Current position

- `ChoicePills` through `QuestionChoices` and `InlineConsent` have been connected to the standard chat in the working tree. This integration is not yet fully regression verified.
- The scripted consultation already uses `MoodScale`, `ScaleCheck`, `UploadCard`, `SlotPicker`, `ConfirmCard` and `ReminderCard` through `FirstConsult/parts/FlowWidget.tsx`.
- Standard check-ins and lab requests still render through `QuickReplies`; they need a context-by-context mapping review.
- `UploadCard` currently simulates a fixed sample filename and announces completion locally. It must not be connected to real app state as though a report has actually been confirmed.
- `ReminderCard` and `ConfirmCard` currently keep local state. Their resolved appearance must follow the underlying app action, rather than falsely announcing success before completion.
- The standard question bank currently contains categorical choices and year/measurement fields, not numeric 0–10 or fixed five-face mood questions. Existing numeric-looking categories, such as sleep-hour ranges, must retain their exact meaning.

## 1. Inventory interaction contexts before changing them

- [ ] List every question/action in standard chat, the scripted first consultation, check-ins and the post-answer ending.
- [ ] Record its existing trigger condition, exact copy, input/output values, handler, next step and stored result.
- [ ] Identify where each widget is already used, where an equivalent control can be replaced, and where no compatible context exists.
- [ ] Record baseline traces for adult self, child/teen dependent, adult partner, normal answer, provider-review ending, emergency, labs and returning-user flows.

Deliverable: a context-to-widget mapping with original handler and expected result for every proposed replacement.

## 2. Apply this contextual mapping

| Existing context | Existing widget | Required behavior |
| --- | --- | --- |
| Consent to health-data processing | InlineConsent | Preserve exact question/choice wording, Yes/No IDs, decline path and consent recording. |
| Single-choice answers | ChoicePills / QuestionChoices | One completed selection emits the original option ID once. |
| Multiple symptoms, medications, allergies or safety selections | Controlled ChoicePills / QuestionChoices | Preserve multi-select, exclusive None, Other text and a single final submission. Never interpret None as an additional symptom. |
| A numeric intensity question already accepting 0–10 | ScaleCheck | Preserve range, default, units and stored value. Current categorical intake questions are not eligible. |
| A mood check-in already matching the mood scale | MoodScale | Preserve the original response meanings. Use only when all required options are represented; do not turn progress choices such as Better/Same/Worse into a different mood question. |
| Existing request to attach labs | UploadCard | Its action opens the existing attachment/confirmation flow and account gate. Show completion only after actual local confirmation. Keep Not now and other existing branches. |
| Existing appointment-slot selection | SlotPicker | Use existing availability and pass the original selected-slot value to the existing booking path. Keep later review/payment steps. |
| Existing final action confirmation | ConfirmCard | Show the actual title/details/value; Confirm and Cancel call the existing actions. Show success only when that action completes. |
| Existing eligible reminder offer | ReminderCard | Read current reminder state and schedule; preserve permission checks, opt-out and timing. Never imply a schedule has been saved just because a local toggle changed. |
| Seven-section answer | Existing AnswerSections | Keep the seven headings/order and reading controls; use supporting widgets only where the answer already offers that action. |
| Product recommendation | Existing ProductCard | Render only if existing eligibility permits it. Keep all minor, pregnancy and safety suppression rules. |
| Provider escalation, emergency or crisis | Existing safety components | Preserve precedence and original actions. No engagement widget may distract from or bypass the intervention. |
| Questions for a provider / visit preparation | Existing VisitPrepCard where compatible | Bind existing Save/Share actions and preserve profile ownership; no new export or storage claim. |
| Date, birth year, measurements or unrestricted text | Existing dedicated controls | Keep them when no `/wid` widget expresses the same input faithfully. |

A widget that does not fit any current question should stay available in `/wid` rather than be forced into the conversation. The scripted consultation can continue using its existing compatible scale/mood nodes.

## 3. Make reuse consistent and state-driven

- [ ] Use one thin renderer/adapter per interaction type, importing the existing widget component directly.
- [ ] Choose renderers using explicit question/action metadata and existing message kind, never keyword guesses in display text.
- [ ] Map display labels to stable option/action IDs without changing the engine payload.
- [ ] Parameterize only what is needed: controlled value, disabled state, pending state, resolved state and existing action callbacks.
- [ ] Keep lab demonstration defaults working while allowing real conversation consumers to supply their current state.
- [ ] Ensure only the latest eligible widget accepts input; resolved widgets remain readable and keyboard-inactive.
- [ ] Prevent repeated submission during streaming, retries and rapid taps.
- [ ] Preserve selected IDs when Other is combined with multiple choices, rather than dropping earlier selections on text entry.
- [ ] Keep draft selection separate from confirmed profile facts. Widget interaction alone must not silently save health information.
- [ ] Preserve active widget state across unrelated rerenders; scenario reset must clear it.

## 4. Integrate in small, reviewable batches

### Batch A — Question interactions

Finish and verify the existing choice/consent integration. Resolve multi-select, Other, disabled-history and duplicate-answer-control issues first. Verify specialized fields and scripted choice transitions.

### Batch B — Existing contextual actions

Connect lab-request, reminder and booking/confirmation widgets only at their current eligible points. Reuse the existing handlers and destinations. Do not duplicate an inline offer and a sheet for the same action.

If an existing permission/settings screen is still required, retain it. Reusing a widget must not remove an essential step or introduce a second consent request.

### Batch C — Endings and supporting content

Keep the truthful Profile saved result and use the existing seven-section answer renderer under ENDING_FLOW_PLAN.md. Include provider preparation or follow-up widgets only when the original branch calls for those actions. Keep products and routine reminders absent where the safety policy excludes them.

## 5. Expected code touchpoints

| Area | Responsibility |
| --- | --- |
| `src/apps/mobile/patterns/widgets/` | Reuse components and add minimal controlled/pending/disabled props where necessary. |
| `src/apps/mobile/patterns/chat/IntakeQuestion/` | Bind question metadata to existing widgets; retain value semantics and specialized fields. |
| `src/apps/mobile/patterns/widgets/QuestionChoices/` | Shared single/multi selection and stable IDs. |
| `src/apps/mobile/screens/consultation/Conversation/parts/MessageList.tsx` | Select the matching renderer for existing intake/check-in/lab/action message contexts. |
| `src/apps/mobile/screens/consultation/Conversation/Conversation.tsx` | Keep composer, streaming, auto-scroll and review/follow-up orchestration consistent. |
| `src/apps/mobile/screens/consultation/FirstConsult/parts/FlowWidget.tsx` and `FlowChoice/` | Reuse the same adapters without changing scripted node transitions. |
| `src/apps/mobile/screens/followup/` and `screens/booking/` | Bind contextual actions to current attachment, reminder and booking paths where needed. |
| `src/shared/types/` and message data | Add presentation-only metadata if necessary; no question wording or condition changes. |
| `src/shared/engine/` and `src/shared/bridge/` | Inspect and test existing handler contracts. Restrict behavior changes to separately planned ending fixes or confirmed integration defects. |
| `src/apps/mobile/screens/lab/WidgetLab/` | Regression reference; preserve examples and component designs. |

## 6. Verification and protection against regressions

- [ ] For identical inputs, compare before/after question IDs, order, next-step conditions, answer payloads, fact patches and final profile.
- [ ] Verify multi-select, exclusive None, Other combined with selected choices, text entry and keyboard use.
- [ ] Verify old widgets cannot submit again; current widgets submit exactly once.
- [ ] Verify upload cancellation, report review and confirmed-report ownership; no fixed sample upload is falsely saved.
- [ ] Verify reminder permission denied, opt-out and repeat visits; no duplicate scheduling or permission bypass.
- [ ] Verify booking Confirm, Cancel and action failure; no premature success or changed destination.
- [ ] Verify Save, Edit, partial Save and Don't save keep their current profile-write rules.
- [ ] Run adult-self, child/teen, adult-partner, pregnancy, returning, labs and safety scenarios.
- [ ] Verify seven-section normal and provider-review endings separately; preserve emergency/crisis interventions.
- [ ] Reset during streaming or widget action and check that previous timers cannot change the fresh scenario.
- [ ] Check scrolling, keyboard, largest text size and long option labels in the phone frame.
- [ ] Run TypeScript, lint and build checks plus focused tests of answer/action contracts.
- [ ] Update manual journey charts and test cases to match the actual widget interactions.

## Acceptance

The appropriate existing widget appears when its existing context is reached. The same answers and actions produce the same journey transitions and stored results. No question or new step is added for variety alone. The existing component designs remain recognizable. Every success message reflects the completed action, and all safety, consent, product and profile-isolation rules remain effective.

## Execution record — 15 October 2026

The scoped integration has been implemented. See WIDGET_INTEGRATION_STATUS.md for delivered behavior, passing checks, manual browser evidence and remaining validation limits. Widgets are preferred where compatible; reminder/booking screens and specialized fields remain when more appropriate. The separate dashboard has not been resumed.
