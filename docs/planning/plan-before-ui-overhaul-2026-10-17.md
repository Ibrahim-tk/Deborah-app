# User Journey Audit and Testing Dashboard Plan

Date: 15 October 2026

## Latest planning addition — Contextual widget reuse

**Widget preference, not a requirement:** Prefer the existing `/wid` widgets wherever they naturally fit the question or action. Do not force their use, add steps to accommodate them, or change question meaning or flow just to include a widget. Keep the current control when it is the clearer or more appropriate interaction.

See [CONTEXTUAL_WIDGET_PLAN.md](CONTEXTUAL_WIDGET_PLAN.md). Reuse the existing `/wid` components wherever their input/action semantics match the current context. Preserve question wording, conditions and journey transitions. Finish verification of the choice/consent integration, then connect eligible upload, reminder and booking actions. Coordinate the ending separately through ENDING_FLOW_PLAN.md. This addition is a plan, not authorization to change the remaining implementation in this turn.

## Latest scoped request — Conversation endings only

See [ENDING_FLOW_PLAN.md](ENDING_FLOW_PLAN.md) for the focused plan requested after the screenshot review. It addresses the existing Profile saved confirmation and missing seven-section answer in the provider-review red-flag ending. No UI changes, widget changes or earlier-flow changes are in scope for that request. The broader widget/dashboard sections below remain separate work.

## Immediate priority — Reuse /wid widgets in chat

User clarification, 15 October 2026: **Keep the current question wording; change widgets only.** The existing question order, journey branches, navigation and overall consultation flow remain the behavioral contract. This is an interaction and presentation change, not a new intake flow.

Complete this work before continuing the journey dashboard build. At this stage, plan the widget integration first; do not change the chat implementation until execution of this section is requested.

### Findings from the current implementation

- `/wid` is the existing widget reference page. Its reusable components live in `src/apps/mobile/patterns/widgets/`; the lab's example questions and canned responses are demonstration content, not replacement consultation logic.
- The standard Conversation screen (`M-2.1`) uses a bottom `AnswerPanel` for active multiple-choice questions. `MessageList` suppresses the corresponding inline controls while that panel is active.
- `IntakeQuestion`, `ComposerOptions` and `AnswerPanel` contain separate choice implementations. They do not consistently reuse the widget components shown on `/wid`.
- The existing choice controls submit a single option immediately, even when question metadata supports multiple answers. The lab already demonstrates controlled multi-selection with `ChoicePills` and Continue.
- The scripted first consultation (`M-2.12`) already uses several widgets through `FirstConsult/parts/FlowWidget.tsx`. Reuse that experience without creating a second competing implementation.
- `ScaleCheck` currently assumes 0–10, and `MoodScale` has a fixed five-label vocabulary. They cannot safely replace arbitrary questions without matching the existing answer contract.

### W-1 — Capture the behavior to preserve

- [ ] Inventory current questions from `conversation/intake.json`, `conversation/chatIntake.json` and the scripted consultation flows.
- [ ] For each question, record ID, exact prompt, option IDs/labels, single/multiple selection, accepted value shape, existing default, Other/skip behavior and next-step rule.
- [ ] Record current user-bubble text, pending fact patch and confirmation behavior for representative answers.
- [ ] Capture the current question sequence for adult self, teen dependent, child fallback and adult partner journeys.
- [ ] Keep all question wording and clinical options unchanged. Do not copy the widget lab's sample questions or keyword router into the consultation engine.

**Done when:** There is a question-to-widget mapping with an explicit list of behavior that must remain identical.

### W-2 — Map each existing interaction to an existing widget

| Existing interaction | Reuse from /wid | Integration rule |
| --- | --- | --- |
| Yes/no or short single-choice answers | `ChoicePills` | Use the existing labels and return the original option ID; do not add Not sure unless the question already has it. |
| Multiple-choice symptom or history selection | Controlled `ChoicePills` plus existing Continue button | Preserve `multi` semantics and existing exclusive None behavior. Submit the selected IDs together. |
| Existing numeric 0–10 question | `ScaleCheck` | Use only when the current question already accepts that numeric range; preserve the existing default and stored value. |
| Existing five-point mood question | `MoodScale` | Use only where labels and values match; otherwise minimally parameterize the widget or retain equivalent choices. Do not reinterpret a symptom question as mood. |
| Health-data consent | `InlineConsent` | Preserve the actual consent wording, decline behavior, saved timestamp and downstream gate. Parameterize the widget if needed instead of copying lab handlers. |
| Existing file attachment interaction | `UploadCard` | Bind to the existing file/confirmation path and account gate. The lab's simulated completion must not bypass report review. |
| Existing appointment selection | `SlotPicker` | Reuse where a slot is already requested; preserve navigation, availability data and booking steps. |
| Existing confirmation action | `ConfirmCard`, only where equivalent | Preserve each action's meaning and cancel behavior. Do not replace Review and Confirm's per-fact Edit/Save/Don't save with a generic booking confirmation. |
| Existing reminder choice | `ReminderCard` | Wire into the current reminder actions and permission flow; do not add a new ask or change when it appears. |
| Existing answer, product, safety and visit-prep content | Existing answer/product/safety/prep components shown on /wid | Reuse current production handlers; preserve safety precedence, product suppression and existing destinations. |
| Birth year, date, measurements or free text | Existing dedicated field primitives | Keep the specialized field if /wid has no equivalent. Do not force unrelated widgets onto these inputs. |

The user's explicit choice of the `/wid` widgets governs this work, including `ChoicePills`; the older general design-system pill restriction must not cause those widgets to be replaced.

**Done when:** Every current question has a compatible control, with explicit exceptions where the widget catalogue has no equivalent.

### W-3 — Add a thin presentation adapter

- [ ] Create a reusable question renderer in the mobile patterns layer that imports the actual widget components, not the WidgetLab screen or its sample data.
- [ ] Pass question metadata and callbacks into the renderer; keep journey decisions in the existing engine.
- [ ] Map widget selections back to stable option IDs rather than using labels as stored values.
- [ ] Add presentation metadata only where needed to select a widget deterministically. Do not use text keyword heuristics.
- [ ] Keep selection state local until the widget's intended submit interaction. Send exactly one existing answer event per completed answer.
- [ ] Preserve Other/free-text and skip behavior for each question; do not introduce new options globally.
- [ ] Preserve answered widgets as readable history, with only the current unanswered question interactive.
- [ ] Support pending, submitting, answered, disabled and retry/reset states without double submission.
- [ ] Add only minimal compatible props to existing widgets where necessary; keep `/wid` working with its current examples.

**Done when:** The same question and answer payload reach the existing engine through the chosen widget.

### W-4 — Integrate without changing the journey

- [ ] Replace the standard chat's duplicate option controls with the shared widget renderer.
- [ ] Present the widget with its corresponding question in the conversation, following `/wid` as the interaction reference. Treat placement and composer visibility as presentation decisions; do not add screens, questions or journey steps.
- [ ] Ensure `MessageList` and the bottom answer area cannot render two active controls for the same question.
- [ ] Preserve typing, thinking, auto-scroll, emergency locking and the ability to answer Other in the existing text path.
- [ ] Reuse the renderer in the scripted consultation where appropriate while retaining its existing node-to-node transitions.
- [ ] Keep onboarding, navigation destinations, answer generation, consultation counting, minor rules, product gates and Review and Confirm timing unchanged.
- [ ] Leave existing follow-up and booking screens in their current flow; do not move an entire workflow into the transcript merely because a lab widget exists.
- [ ] Remove old choice implementations only after all consumers are checked.

**Done when:** The user follows the same journey and answers the same questions using the widgets they designed.

### W-5 — Verify interaction and behavior parity

- [ ] Compare before/after question IDs, order, option IDs, next-step decisions and resulting fact patches on the same seeded scenarios.
- [ ] Test one-tap choices, multiple selections, exclusive None, Other text, back/reopen, keyboard controls and double-tap prevention.
- [ ] Check numeric and mood widgets only on compatible existing questions; mark incompatible cases rather than inventing new questions.
- [ ] Verify only active controls accept input and older answers remain readable.
- [ ] Confirm health facts stay pending until explicit Review and Confirm; test Save, Edit and Don't save.
- [ ] Check child/teen product suppression, adult partner context, consent decline and emergency precedence.
- [ ] Check the widget lab and both conversation implementations for regressions.
- [ ] Run TypeScript, lint and build checks, plus focused answer-payload tests where necessary.
- [ ] Inspect the phone layout, keyboard, scrolling and largest text size using representative real question labels.

**Acceptance:** Existing wording and question sequence are unchanged; the same selections produce the same routing and profile changes; supported questions use the actual `/wid` widgets; no duplicate answer controls or new journey steps appear.

### W-6 — Resume the journey testing plan

After widget parity is verified, continue the audit/dashboard phases below. Update manual test instructions and automatic playback to recognize the widget interactions rather than depending on the retired option-panel markup. Keep widget integration and dashboard work separate so each can be reviewed independently.

### Proposed code touchpoints

| Responsibility | Files or area |
| --- | --- |
| Canonical widget implementations | `src/apps/mobile/patterns/widgets/` |
| Widget reference and regression check | `src/apps/mobile/screens/lab/WidgetLab/` |
| Standard conversation integration | `src/apps/mobile/screens/consultation/Conversation/Conversation.tsx`, `parts/MessageList.tsx` |
| Existing duplicate choice renderers | `src/apps/mobile/patterns/chat/IntakeQuestion/`, `ComposerOptions/` |
| Scripted flow integration | `src/apps/mobile/screens/consultation/FirstConsult/parts/FlowWidget.tsx` and its choice renderer |
| Presentation metadata, only if required | `src/shared/types/content.ts`, `src/shared/types/domain.ts`, existing question data |
| Behavior checks | Existing question engine, fact confirmation and seeded journeys |

### Execution checkpoint

The earlier journey-dashboard execution has been paused for this widget plan. Dedicated S20/S21 seeds, shared family-consent changes, consent metadata, runner reset cancellation and draft journey catalogue files were started before the pause. They are not a completed or verified dashboard. Preserve and review those working-tree changes when the dashboard work resumes.

## Objective

Establish what the existing prototype supports, identify what remains, and build a development-only journey dashboard so each available user experience can be tested manually from beginning to end.

Reuse existing screens, navigation, scenario seeds and design-system components. Keep simulated behavior clearly identified. This plan does not authorize implementing every missing product feature.

## Current baseline

These findings come from code inspection; they are not a claim that every journey has passed browser testing.

| Area | Current evidence | Remaining work |
| --- | --- | --- |
| Onboarding | Welcome opens sign-up; self and dependent branches, birth year, sex, age gate and consent are present | Verify every branch in the browser |
| Dependent onboarding | Profile creation and profile switch before chat are present | Verify third-person conversation, minor rules and profile isolation |
| Health profile | Chat intake and Review and Confirm are present | Verify save, edit, discard, repeated questions and later updates |
| Guest prompts | Removed from main chat and Home; retired card remains in the design system | Verify no prompts reappear in supported journeys |
| Journey tooling | Automatic Journeys menu and scenario loader exist | Add guided manual testing, expected results and reliable reset |
| Scenario catalogue | S01–S19 and R01 exist; dependent journey runs reuse S03 | Add dedicated teen and adult-partner seeds |
| Family consent | Onboarding reads shared consent data | Add Family Member still uses hardcoded wording |
| Consent record | Path and timestamp are stored | Resolve the planned attestedBy field |
| Documentation | UX specs and screen cross-reference exist | Onboarding descriptions still contain the previous flow |
| Labs | Lab screens and simulated upload exist; selected file contents are not read | Audit confirmation and downstream behavior; label simulation |
| Invitations and permissions | Not established by the inspection so far | Audit before claiming support or creating role-switch demos |

TypeScript checks passed for the app and Vite configuration. Lint passed with zero errors and 12 warnings. Full browser regression testing remains outstanding.

There is no BUILD.md in the repository. Use docs/11-build-plan.md and the relevant docs/ux specifications as the available build references. If BUILD.md is later supplied, compare it separately and record discrepancies.

## Phase 1 — Audit implementation and establish status

- [ ] Read the build plan, architecture, navigation, state/scenario and relevant UX specifications.
- [ ] Inventory registered screens, reachable routes, sheets, modals and interactions.
- [ ] Trace navigation and state mutations for each journey.
- [ ] Inspect scenario seeds, account simulation, profile ownership and engine decisions.
- [ ] Manually follow reachable journeys in the browser.
- [ ] Record entry requirements, actions, decision branches, success states, errors and exits.
- [ ] Record evidence for missing or broken behavior without assuming a screen proves the whole flow works.

Use separate classifications:

| Classification | Values |
| --- | --- |
| Implementation | IMPLEMENTED, PARTIALLY IMPLEMENTED, NOT IMPLEMENTED |
| Verification | UNTESTED, PASSED, FAILED |
| Behavior | Local prototype behavior, simulated processing, unavailable |

### Required journey inventory

1. First-time onboarding, including all self/dependent age branches.
2. Conversational health profile creation.
3. Returning-user consultation and sign-in.
4. Health profile updates through chat and Review and Confirm.
5. Adding and switching family profiles.
6. Teen invitation, consent and sharing, if supported or specified.
7. Adult dependent invitation and consent, if supported or specified.
8. Medical document/lab attachment paths.
9. Document analysis, confirmation and profile updates, where supported.
10. Doctor-visit notes and any actual recording functionality.
11. Medication updates and any implemented conflict resolution.
12. Conversation history and management.
13. Account, subscription, notifications and privacy management.

Extend the inventory to other implemented journeys, including follow-up, safety, trial limits and booking. Clearly distinguish a visit-note editor from audio recording, a dependent profile from a separate user account, and a file picker from document analysis.

**Exit criterion:** Every requested journey has a documented status, evidence and a known supported endpoint.

## Phase 2 — Write journey maps and test cases

- [ ] Create JOURNEY_MAP.md with Mermaid flowcharts for supported and specified journeys.
- [ ] Include entry points, actions, decisions, exits and relevant errors.
- [ ] Label missing steps explicitly rather than drawing them as completed functionality.
- [ ] Create JOURNEY_TEST_CASES.md with personas, seed IDs, inputs, actions, per-step expected results and final outcomes.
- [ ] Create JOURNEY_GAPS.md with missing screens, incomplete interactions, broken connections and specification differences.
- [ ] Link findings to source files and screen IDs.

Use Sarah for first-time onboarding and chat, Emily for managing a teenage dependent, and Helen for adult-dependent invitation/access testing only if that capability is established. Otherwise, mark Helen's invitation journey unavailable and explain the missing pieces.

Prioritize onboarding and chat, returning users, family profiles, labs/records, then account/privacy. Cover safety branches alongside the journeys they affect.

**Exit criterion:** A tester can follow each supported journey without reading source code or guessing inputs.

## Phase 3 — Resolve confirmed gaps in existing flows

- [ ] Share consent copy between onboarding and Add Family Member while preserving the documented difference in under-13 handling.
- [ ] Resolve consent-record metadata, including attestedBy.
- [ ] Add dedicated teen and adult-partner seeds, following the intended S20/S21 naming if available.
- [ ] Update F01 onboarding, F06 family consent and screen cross-references to match the final implementation.
- [ ] Verify the follow-up opt-in appears once after the answer/review sequence.
- [ ] Check automatic journey completion signals and remove brittle assumptions where necessary.
- [ ] Fix confirmed navigation, profile-isolation and reset defects.

Keep larger missing product capabilities in JOURNEY_GAPS.md as separately scoped work. Do not create invitation, sharing, recording or conflict-resolution features merely to make a dashboard row appear complete.

**Exit criterion:** Existing supported journeys have consistent starting data and no known blocking connection defects.

## Phase 4 — Build the Journey Testing Dashboard

- [ ] Add /demo/journeys through the existing React router.
- [ ] Enable it in development and optionally through an explicit hosted-demo build flag; exclude it from ordinary product access.
- [ ] Build within the prototype shell using existing UI and design-system conventions.
- [ ] Show journey name, persona, goal, step count, implementation status and verification status.
- [ ] Provide Start, Resume, View Flowchart and Reset actions.
- [ ] Show known gaps and simulated behavior before starting.
- [ ] Open existing application screens instead of recreating them as mock screens.
- [ ] Keep the automatic Journeys player as optional playback alongside manual testing.

### Guided manual experience

Display a testing panel beside the prototype with the current step, suggested input, expected result, available branches and progress. Let the tester interact with the application directly. Provide controls to mark a step passed, failed or blocked, with a short session note.

Choose a lightweight flowchart rendering approach after checking existing dependencies. Avoid adding a dependency unless it materially improves the dashboard and cannot be handled adequately with existing tooling.

**Exit criterion:** A tester can choose a journey and follow the real prototype with visible guidance.

## Phase 5 — Make guidance, branching and reset reliable

### Shared journey definitions

Create a typed catalogue owned by the demo/shell layer. Each definition should include:

- Stable journey ID, title, persona and goal.
- Implementation status and behavior limitations.
- Starting scenario and navigation entry point.
- Ordered steps, inputs and expected results.
- Branches, supported role changes and completion conditions.
- Flowchart content and known gap references.

Reuse this catalogue across the dashboard, guidance panel and automatic playback where practical to prevent conflicting definitions.

### Progress and reset

- [ ] Observe screen/navigation and application state to recognize objective step completion.
- [ ] Use manual confirmation for subjective expectations or checks that cannot be reliably detected.
- [ ] Avoid relying solely on visible copy or DOM selectors for progress.
- [ ] Cancel pending playback and demo timers before resetting.
- [ ] Restore the scenario's store, navigation, pending facts, sheets and demo progress.
- [ ] Isolate persona state and verify conversations and health facts remain assigned to their profiles.
- [ ] Treat switching family profiles and switching simulated accounts as distinct operations.
- [ ] Stop at unsupported steps with an explanation of what is missing.
- [ ] Keep demo controls and test-session state isolated from product behavior.

**Exit criterion:** Every supported journey can be restarted repeatedly with predictable state and no cross-persona leakage.

## Phase 6 — Verify and hand over

- [ ] Run every supported journey manually from its dashboard entry point.
- [ ] Test all five onboarding branches: adult self, under-18 self, child dependent, teen dependent and adult dependent.
- [ ] Test review save, edit and discard, then verify resulting profile data.
- [ ] Test returning sign-in, repeat consultation and conversation history.
- [ ] Check product suppression and existing safety branches for relevant personas.
- [ ] Verify attachment and analysis paths accurately describe simulation.
- [ ] Test back, cancel, alternate branches, reset and repeated runs.
- [ ] Verify intended account/privacy actions against local mock data.
- [ ] Run TypeScript, lint and production build checks.
- [ ] Verify the explicitly enabled hosted demo route and confirm ordinary builds do not expose it.
- [ ] Update journey verification statuses and gap documentation with actual results.

Add focused automated checks for meaningful state isolation, reset and branch logic as needed. Do not add tests that merely repeat static journey definitions.

**Exit criterion:** Every available journey has a recorded result, unsupported sections are explicit, and the dashboard works in the intended testing environment.

## Implementation starting points

| Responsibility | Existing location |
| --- | --- |
| Top-level route | src/App.tsx |
| Prototype shell | src/shell/Shell/ |
| Automatic journey catalogue and player | src/shell/nav/JourneyRunner/ |
| Scenario catalogue and seeds | src/shared/scenarios/ |
| Scenario state loading | src/shared/store/loadScenario.ts |
| Mobile screen registry and navigation | src/apps/mobile/navigation/ |
| Conversation engine | src/shared/engine/ |
| Onboarding | src/apps/mobile/screens/onboarding/ |
| Family profiles | src/apps/mobile/screens/profiles/ |
| UX specifications | docs/ux/ |

## Working constraints

- Inspect before implementing; preserve unrelated working-tree changes.
- Reuse existing screens and primitives; do not redesign the app.
- Keep the project frontend-only with local mock data and no real service integrations.
- Do not present simulated behavior as real authentication, AI analysis, invitation delivery or permission enforcement.
- Do not silently expand scope to missing product features.
- Make every supported demo resettable.
- Document actual results, including failures and untested behavior.

## Final deliverables

1. JOURNEY_MAP.md.
2. JOURNEY_TEST_CASES.md.
3. JOURNEY_GAPS.md.
4. Development/explicit-demo dashboard at /demo/journeys.
5. Shared journey definitions, isolated scenario starts and reset behavior.
6. A verification record showing passed, failed, blocked and untested journeys.

The work is complete when the tester can select a persona and journey, see its flowchart, click through the existing prototype with clear expectations, explore supported branches, reset, and understand exactly where functionality is missing.

## Scoped execution update — 15 October 2026

Contextual widget integration and the provider-review ending are implemented. See WIDGET_INTEGRATION_STATUS.md for exact scope and verification. Existing question data and preceding branches were preserved; controls are reused where compatible rather than forced. The separate journey dashboard and full manual regression matrix remain outstanding.
