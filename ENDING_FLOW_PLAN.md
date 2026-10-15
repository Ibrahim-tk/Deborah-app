# Focused Build Plan — Profile Saved and Seven-Section Ending

Date: 15 October 2026

## Scope

Change only the ending of the conversation shown in the screenshot. Keep the existing UI, widgets, question wording, question order, branching before the ending, navigation and profile confirmation controls. Do not resume the dashboard or redesign the chat as part of this work.

This is a plan only. No application behavior is changed by this document.

## Why the current ending happens

The screenshot shows two independent outcomes:

1. The user selected **A new breast lump**, an option in a red-flag question.
2. The user confirmed the proposed health facts, so the existing ReviewFactsCard correctly displays **Saved to your health profile…**.

In `src/shared/engine/index.ts`, `handleIntakeAnswer()` sends any non-None red-flag selection to `redFlagSteps()`.

In `src/shared/engine/plans.ts`, `redFlagSteps()` sets `redFlag: true`, `noProduct: true` and `status: answered`, then emits the provider message and the Review and Confirm card. It deliberately does not emit an answer message or seven-section framework. The conversation therefore looks finished even though the requested framework has never been generated.

The profile-saving behavior is working in this example. The missing framework is an ending policy in the engine, not a widget-layout problem.

## Intended behavior

| Ending | Intended result |
| --- | --- |
| Ordinary consultation, no red flags | Preserve the existing seven-section answer and review behavior; no reordering of otherwise working flows. |
| Screenshot branch: non-emergency concern needing a provider | Resolve the existing review choice, show the existing saved/not-saved confirmation, then deliver one provider-directed seven-section answer using the existing answer UI. |
| Review Edit | Stay in the existing editing flow. Deliver the ending only after pending facts have been resolved. |
| Review Don't save | Keep the existing not-saved confirmation. Offer the applicable answer using the current conversation context only, without writing discarded facts to the profile. |
| No pending facts | Do not claim that a profile was newly saved. Deliver the applicable ending directly. |
| Profile-only setup with no topic | Confirm completion and retain the existing prompt for a topic; do not invent a consultation or unrelated framework. |
| Emergency or crisis | Preserve the existing urgent safety intervention. Do not continue automatically into a routine framework. |

The framework for a provider-review concern must acknowledge the reported concern and support the next provider conversation. It must not present a breast lump as a hormone diagnosis, recommend a product, or suggest that general wellness guidance replaces assessment. This improves the usefulness of the ending while retaining its safety purpose.

## E-1 — Capture the current ending contract

- [ ] Reproduce the screenshot branch with synthetic data and record the selected question/option IDs.
- [ ] Record the existing seven section keys, headings and order from the answer data and renderer.
- [ ] Trace Save, Edit and Don't save from both the inline card and M-2.13 sheet.
- [ ] Record the behavior of normal answers, profile-only completion, emergency/crisis, minors, labs and reminder offers before editing.
- [ ] Identify which red-flag options require an emergency response versus a provider-review ending using existing safety rules. Do not treat every option as clinically interchangeable.

**Done when:** The change can be limited to the affected ending without altering question selection or intake.

## E-2 — Represent the ending explicitly

- [ ] Add a small serializable conversation field for a pending provider-review ending and its completion state.
- [ ] Preserve the selected safety concern IDs as conversation context so the ending can reference what was actually selected; do not silently save those concerns as new profile facts.
- [ ] Keep `redFlag` and `noProduct` effective throughout this branch.
- [ ] Do not use `status: answered` as evidence that a seven-section answer exists. Check the actual answer message/completion state.
- [ ] Give the ending a stable per-conversation identity so repeated renders, retries, reopening the chat or rapid taps cannot create duplicate answers.

**Done when:** The engine can distinguish waiting for review, generating a provider-review answer and completed ending.

## E-3 — Add a provider-directed framework variant

- [ ] Add a placeholder answer-data variant following the same seven section keys, headings and order as the existing answer.
- [ ] Populate the sections with suitable provider-directed education and preparation, acknowledging uncertainty and avoiding a diagnosis or unsupported hormone explanation.
- [ ] Keep the existing closing-line contract and source/copy-status conventions.
- [ ] Mark new clinical copy as placeholder pending Deborah's review.
- [ ] Reuse existing answer construction and streaming where possible; do not copy the entire normal answer pipeline.
- [ ] Keep products, shop suggestions and automatic supplement plans suppressed for this ending.
- [ ] Preserve the current uncounted safety-ending policy, including trial quota behavior. Generating useful safety content must not charge a consultation by accident.

**Done when:** The branch produces a real answer message with seven sections, rather than a generic refusal or a normal hormone-focused script.

## E-4 — Continue once Review and Confirm is resolved

- [ ] Route the non-emergency provider-review branch through the existing review card when there are pending facts.
- [ ] After the existing Save action, leave the existing saved confirmation visible and trigger the provider-review ending once.
- [ ] Use a guarded, shared completion handler for inline Save/Don't save and the review sheet's Save/Don't save; avoid duplicate effects in multiple components.
- [ ] Do not trigger the ending while the Edit sheet still contains unresolved facts.
- [ ] On Don't save, preserve the no-write guarantee. Use only permitted current-conversation context for the answer; do not restore discarded profile patches.
- [ ] If no facts need reviewing, continue directly to the applicable ending without a false saved message.
- [ ] Defer any existing reminder offer until review and answer streaming are finished. Preserve the once-only offer rule and existing eligibility; do not introduce a new reminder in a branch that did not qualify.

**Done when:** The screenshot branch ends with its actual save result followed by the applicable seven-section answer, without additional screens or controls.

## E-5 — Protect all answer entry points

- [ ] Apply the ending policy in a shared engine resolver so requestAnswer, retry, typed requests such as “what do you think”, and resumed conversations cannot bypass it.
- [ ] Keep emergency/crisis handling ahead of ordinary answer generation and subscription gates.
- [ ] Keep normal answer generation unchanged for conversations without the targeted provider-review state.
- [ ] Keep profile-only setup, scripted first consultation and lab-review paths unchanged unless a test demonstrates a direct dependency.
- [ ] Ensure resetting a scenario cancels an in-flight ending before it can write into the new scenario.

**Done when:** Every way of requesting an answer obeys the same ending rules, with no duplicate output or safety bypass.

## Exact code touchpoints

| File / area | Planned change |
| --- | --- |
| `src/shared/engine/index.ts` | Target the red-flag answer branch and route answer/retry requests through the shared ending resolver. Preserve normal intake planning. |
| `src/shared/engine/plans.ts` | Replace the terminal provider-review refusal policy with a pending/resolved ending plan; reuse streaming while preserving no-product and uncounted behavior. |
| `src/shared/engine/answer.ts` | Build the provider-directed variant with the existing seven-section contract, if a variant selector is needed. |
| `src/shared/data/conversation/` | Add placeholder provider-review answer content in the established data structure. Retain existing question wording and options. |
| `src/shared/types/domain.ts` | Add the minimal ending state and selected-concern context to Conversation. |
| `src/shared/types/engine.ts` | Add an explicit ending-continuation input only if required to support a single shared engine entry point. |
| `src/shared/bridge/context.ts` and `conversationRunner.ts` | Execute the ending through the existing runner; ensure reset/retry cancellation and once-only generation. |
| `src/apps/mobile/screens/consultation/Conversation/Conversation.tsx` | Minimal orchestration only if needed to observe resolved review and request the ending. No markup, styling, widget or navigation changes. |
| `src/apps/mobile/screens/consultation/Conversation/parts/MessageList.tsx` | Inspect Save/Don't save bindings for the shared completion handler; retain existing rendering. Preserve product suppression for the targeted ending. |
| `src/apps/mobile/screens/consultation/ReviewFacts/ReviewFacts.tsx` | Wire sheet completion into the same handler if needed; retain its fields, actions and layout. |
| `src/apps/mobile/patterns/chat/ReviewFactsCard/ReviewFactsCard.tsx` | Existing saved/not-saved copy is already correct. Preserve the component and its visual behavior; change only if a shared callback contract requires it. |
| `src/shared/scenarios/` and journey test documents | Add a reproducible ending case and record expected results, including the protected safety branches. |

Do not change CSS, `/wid`, widget geometry, onboarding screens or the existing AnswerSections layout. Any changed bindings are logic changes only.

## Verification matrix

| Case | Action | Expected |
| --- | --- | --- |
| Screenshot reproduction | Select A new breast lump, then Save | Saved confirmation, then exactly one provider-directed seven-section answer; no product, shop suggestions or trial charge. |
| Ordinary happy path | Select None of these | Existing seven-section answer and review sequence remain as before. |
| Edit first | Edit a pending fact, return, then Save | No answer while editing; revised facts save; ending occurs once. |
| Don't save | Discard pending facts | No profile write; not-saved confirmation remains truthful; applicable ending still available. |
| Partial selection | Save only some proposed facts | Confirmation lists only saved facts; ending does not silently save the rest. |
| No pending facts | Reach ending with everything already known | No false Profile saved claim; ending appears once. |
| Retry / reopen / double tap | Retry, reopen conversation or tap quickly | No duplicate answer, quota count or reminder. |
| Explicit answer request | Send “what do you think” or use requestAnswer | Same policy; provider-review state never produces the ordinary hormone-focused variant. |
| Emergency / crisis | Trigger an existing urgent safety case | Existing urgent intervention remains; routine answer does not automatically follow. |
| Minor / pregnancy | Run existing relevant scenarios | Existing restrictions and no-product behavior remain. |
| Profile-only completion | Complete basics without a concern | Completion message and invitation to ask; no fabricated answer. |
| Labs / returning / scripted first consult | Run their seeded paths | Existing endpoints and answer formats remain unchanged. |
| Reset during generation | Reset while ending streams | Old generation cannot mutate the freshly loaded scenario. |

Run focused engine/state tests for these ending policies, then TypeScript, lint and build checks. Manually verify the screenshot path plus a normal, emergency and review-edit path. Record untested cases explicitly.

## Acceptance criteria

- The existing Profile saved confirmation is retained and remains truthful.
- The targeted non-emergency branch provides the existing seven-section answer format with appropriate provider-directed content.
- Normal consultation endings retain their current sequence and behavior.
- Emergency/crisis protections, no-product rules, profile confirmation and consultation counting remain intact.
- Only ending logic and necessary ending copy/state change; no UI, widget, question or earlier-flow changes.

## Execution record — 15 October 2026

The non-emergency provider-review ending is implemented and available as scenario S22. Save/Don't save resolves the existing review, then a provider-directed seven-section answer follows once. Emergency selections remain protected; this ending is uncounted and has no product, automatic wellness plan or reminder offer. Clinical copy is placeholder. See WIDGET_INTEGRATION_STATUS.md for tested paths and limits.
