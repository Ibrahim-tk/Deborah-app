# Oracle Clinician — Post-intake UI Overhaul Plan

**Date:** 17 October 2026 · **Status:** proposal for review · **Implementation in this chat:** none  
**Primary surface:** Version 2 mobile prototype, reviewed at `/internal/mobile?flow=v2`  
**Companion documents:** [program.md](program.md) · [research catalogue](docs/planning/ui-overhaul-references.md) · [previous plan, preserved verbatim](docs/planning/plan-before-ui-overhaul-2026-10-17.md)

**Workspace freshness note:** Source files changed concurrently while this document was being written. The source audit below describes the inspected baseline, not a guarantee of the final working tree. This chat changed planning documents only. Before implementation, refresh the component/action inventory against the current tree and reconcile any overlapping work; do not re-create components already added elsewhere. See §2.4.

## Contents

1. [Intent and non-negotiables](#1-intent-and-non-negotiables)
2. [Current app findings](#2-current-app-findings)
3. [Research and experience direction](#3-research-and-experience-direction)
4. [Information architecture](#4-information-architecture)
5. [Home](#5-home)
6. [Chat: locked baseline and optional presentation study](#6-chat-locked-baseline-and-optional-presentation-study)
7. [My Health and Healing Plan](#7-my-health-and-healing-plan)
8. [Family](#8-family)
9. [Records and history](#9-records-and-history)
10. [Visit Notes](#10-visit-notes)
11. [Labs and supporting screens](#11-labs-and-supporting-screens)
12. [Visual language and tokens](#12-visual-language-and-tokens)
13. [Blur, motion and feedback](#13-blur-motion-and-feedback)
14. [Reusable component architecture](#14-reusable-component-architecture)
15. [Widget Library](#15-widget-library)
16. [Behavior preservation](#16-behavior-preservation)
17. [States and content ranges](#17-states-and-content-ranges)
18. [Accessibility and responsiveness](#18-accessibility-and-responsiveness)
19. [Performance and failure handling](#19-performance-and-failure-handling)
20. [Phased build backlog](#20-phased-build-backlog)
21. [Verification and acceptance](#21-verification-and-acceptance)
22. [Risks and deferred decisions](#22-risks-and-deferred-decisions)
23. [Review checklist](#23-review-checklist)

## 1. Intent and non-negotiables

### 1.1 Desired outcome

Make the post-intake experience feel as direct, readable and conversational as the leading AI apps, while remaining recognizably Oracle Clinician. Improve layout, organization, interaction affordances and component quality. Keep the existing care journey underneath the screen.

Modernity should come from a clear hierarchy, subtle tonal surfaces, excellent spacing, purposeful icons and a small amount of progressive blur where it has a spatial purpose. It should not depend on filling the screen with translucent panels or animated decoration.

`PRODUCT.md` describes people often tired or anxious, roughly 40–65, reading in short sessions and sometimes with increased text size. That makes comfortable targets, good contrast and a low decision burden essential. Preserve Deborah’s voice, the educational purpose and the seven-section guidance framework.

### 1.2 Locked regions

| Locked area | Exact meaning |
|---|---|
| Sign-in/sign-up | Same appearance, fields, validation, account actions, terms handling and destinations |
| Intake | Same forms, question wording/order, controls, consent, branching, values and completion; includes Complete Intake and chat intake |
| Chat experience | Preserve the approved chat in the base scope; §6 documents a separate optional presentation study |
| Composer | No JSX/CSS/token, dimensions, placement, focus, keyboard, draft, send/stop, attachment or voice changes |
| Home launcher | Treat `ChatLauncher` as part of the composer lock, despite being a different component |
| Headers/navbar | Keep Home/chat/other screen headers, sidebar and navigation chrome and their current actions |
| Greeting/time | Preserve date, time-of-day greeting, name, contextual line, styling and device-clock behavior |
| Product logic | Keep clinical answers, gates, safety, profile ownership, counting, reminders, save/export and eligibility |

The request both locks chat and asks for a plan covering chat. The conservative interpretation is to give chat detailed compatibility and future-design coverage without assuming permission to restyle it. Approving the base program does not silently unlock chat. A later explicit chat presentation phase still cannot touch the composer or clinical flow.

The preference for no strokes/shadows governs decorative card treatment. It does not remove keyboard focus, required control affordances, safety emphasis or anything inside a locked component.

### 1.3 Current deliverable

Only Markdown planning files change. No application code, dependencies, token values, tests, clinical content, navigation, Version 1 files or client chrome change. Existing unrelated working-tree edits remain intact.

The future build is internal-first under `AGENTS.md`. `/internal` and `/` currently share Version 2 product code: internal verification is not deployment isolation. See §16.6 before any merge or release.

## 2. Current app findings

### 2.1 Evidence reviewed

This plan uses `PRODUCT.md`, `DESIGN.md`, `VERSIONS.md`, the current route registry, Home renderers/view models, My Health, Family profiles, Records, Visit Brief, shared widgets, loaded styles, icons, scroll-edge blur and package scripts. Returning Home R01 was inspected in the running internal preview. Other screen findings come from source inspection; this is not an exhaustive visual regression audit.

| Area | Existing implementation | Consequence |
|---|---|---|
| Home | `Home`, `StateNew`, `StateReturning`, `StateEstablished`, `HomeKit` | Recompose bodies; keep handlers and state classification |
| Home classification | New with no history/active messages; established from plan day 14 when not mid-intake; otherwise returning | No new ranking or AI priority model |
| Home data | Topic, summary, pending question, completion, reports, habits, recommendations | No invented daily health summary |
| Chat | `Conversation`, `FirstConsult`, shared chat patterns and engine | Both consultation paths remain protected |
| My Health | `MyHealthHub`, `HubEmpty`, `HubPopulated`, `useHubData` | Existing focus, plan, check-in, counts and content support better hierarchy |
| Family | `ManageProfiles`, `ProfileDetails`, switcher, `useAddMember` | Preserve details versus switching and existing limits |
| Records | `Records`, `RecordsList` | Keep Consultations / Visit Notes / Labs, profile and segment parameters |
| Visit Notes | `VisitBrief`, `BriefDocument`, `AppointmentFollowUp` | Existing document/edit/save/PDF/follow-up logic is authoritative |
| Widgets | `patterns/widgets`, `patterns/health`, `HomeKit` | Extend/reuse first; extract genuinely new cards |
| Widget Library | `WidgetLab`, `LabWidget`, `scenarios.ts` | Extend the chat-oriented showcase to screen cards |
| Icons | `ui/Icon/Icon.tsx`, free Hugeicons Stroke Rounded | Keep one adapter and family |
| Blur | `ui/ScrollEdge` already has masked strong/soft blur and reduced transparency | Reuse the existing approach selectively |

### 2.2 Design findings

Returning Home currently stacks continuation, next steps, intake completion, plan, destinations and recommendations. Similar card structures compete for attention. The opportunity is to distinguish “continue,” “do something today,” and “find my information” through composition and scale.

Home-specific helpers and inline markup are not yet a complete shared widget catalogue. Extract meaningful components, not just a universal rounded rectangle with many unrelated flags.

The R01 preview showed “Your Health Profile — 100% Complete” with “Complete Intake.” The source uses different predicates for basic completion and extended intake. The overhaul must not alter that calculation or misrepresent the percentage. Record a UI-copy clarification opportunity that distinguishes the two concepts, rather than quietly fixing product logic.

The requested visual material already exists in part: cream/plum colors, tonal cards, generous corners, Hugeicons and progressive blur. The plan should improve the system’s application instead of replacing the brand.

### 2.3 Resolve design authority without accidental redesign

`DESIGN.md` describes Cormorant + SF Pro and an earlier parchment palette. `MobileApp.tsx` loads semantic tokens, refresh/base styles, DM Sans, and finally `mobile.skin.deborah.css`. The skin overrides fonts, colors, controls and radii, while its comment still describes an exploration.

Recommendation: preserve the effective current token skin for continuity and make its canonical status an explicit P0/P1 decision. Do not silently revert to SF Pro because an older document says so. Do not change token values simply to reconcile documentation. No `DESIGN.md` change is part of this planning task.

### 2.4 Concurrent changes detected at final review

A hash comparison detected external changes to Home renderers/styles, shared tokens, several health/profile/record styles, ScrollEdge, DESIGN.md and widget catalogue files during drafting. No attempt was made to revert or validate that implementation. A concurrent `docs/ui-overhaul-plan.md` was also present at final review; this document does not claim to supersede or approve its implementation scope.

The current tree had begun introducing `PrimaryIntentCard`, `PromptStarterList`, `NextIntentList` (under `NextIntentRow`), `TodayHabitsCard`, `DestinationTilePair`, `LinkStatusCard`, `RecommendationCard` and `HomeSectionLabel`. P0 must evaluate these first. Proposed names such as `ContinueConversationCard`, `StartConversationCard` and `HealthDestinationCard` describe required responsibilities, not a requirement to build duplicates. Map them onto those existing components where contracts match.

Reconfirm the design-document mismatch, token values, consumer list and source locations before coding. The lock boundaries and behavior-preservation requirements remain the review criteria even if another implementation is already underway. The archived earlier plan preserves the bytes present when this planning task prepared the replacement; comparison with a later Git HEAD is not a valid archive-integrity check if concurrent work commits files.

## 3. Research and experience direction

### 3.1 What to borrow

| Reference | Documented pattern | Oracle adaptation |
|---|---|---|
| Grok | Direct conversation entry and follow-up | One clear Home continuation surface |
| ChatGPT | Natural iteration and grouped chats/context | Recognizable continuity and organized records |
| Perplexity | Visible sources, files and contextual follow-up | Honest metadata and clear existing next actions |
| Claude | Reusable outputs separate from conversation | Document-like Visit Notes and retrievable health material |

Sources: [Grok overview](https://x.ai/grok), [Use ChatGPT](https://learn.chatgpt.com/docs/use-chatgpt), [Perplexity Pro Search](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search), [Claude artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them).

The [20-entry annotated catalogue](docs/planning/ui-overhaul-references.md) is part of the plan. It separates current documentation, historical examples, visual reference destinations and our proposed adaptations. Public docs were reviewed; no claim is made to have audited every signed-in native app version.

### 3.2 A distinct job for each surface

- **Home:** reorient me and help me continue.
- **Chat:** listen, clarify and provide the existing guidance.
- **My Health:** organize what I am working on and have saved.
- **Family:** make whose information I am managing unmistakable.
- **Records:** retrieve a consultation, note or lab report.
- **Visit Notes:** review and take existing information to my provider.

This is AI-native through context and continuity. It does not require a model to rearrange the screen, write new summaries or invent next steps. Deterministic existing state is sufficient. Essential actions should stay predictable across visits.

### 3.3 Recommended composition

Use a continuation-first Home with three visual scales: one spacious primary module, compact supporting action rows, and a restrained destination group. Keep commerce lower in the hierarchy while preserving eligibility. Avoid turning every three-line item into a large poster.

| Alternative considered | Benefit | Why it is not recommended as the lead |
|---|---|---|
| Everything as chat | Strong conversational identity | Weak record/family retrieval and conflicts with chat lock |
| Equal dashboard tiles | Familiar navigation | Too many equal choices on a small phone |
| Health timeline | Useful historical story | Requires new aggregation and careful cross-type semantics |
| Daily AI briefing | Personalized entry | Requires new generation and ranking logic |
| Continuation-first | Clear next task using current state | Sparse data needs deliberate handling; best fit for scope |

P1 should compare concrete layouts, not reopen the entire brand. The reference apps supply hierarchy/interaction lessons; Oracle supplies tokens, content, identity and behavior.

## 4. Information architecture

### 4.1 Preserve existing destinations

| Destination | Current route | Contract |
|---|---|---|
| Home | M-2.0 | Existing root/navigation |
| Conversation / scripted consultation | M-2.1 / M-2.12 | Exact current entry/resume distinction |
| Health profile / Complete Intake | M-2.10 / M-2.14 | Modal/form and intake behavior locked |
| Family overview | M-6.6 | Existing push |
| Profile details / switcher | M-6.5 / M-6.1 | Viewing details is distinct from switching |
| My Health / Healing Plan | M-7.2 / M-7.3 | Preserve gates and root/pushed back behavior |
| Content / library / about | M-7.4 / M-7.5 / M-7.6 | Existing content IDs and destinations |
| Records | M-9.1 | Preserve segment and optional profileId |
| Consultation detail | M-9.2 | Preserve conversationId and read/resume distinction |
| Note editor / lab report | M-9.4 / M-9.5 | Preserve noteId/reportId and ownership |
| PDF preview / Visit Notes | M-9.6 / M-9.7 | Preserve source IDs, modal, save/export semantics |
| Lab upload / confirmation | M-5.3 / M-5.4 | Same upload/review/confirmation |
| Booking | M-8.2 / M-8.3 / M-8.4 | Same sequence and data |

No new bottom navigation, sidebar or top-level taxonomy. Existing body shortcuts can be clearer. A new visual shortcut is eligible only when it uses an already working destination, the same navigation API, parameters and permission gates. Otherwise defer it.

### 4.2 Content movement ledger

Before implementation, record each existing element’s old/new location, visibility condition, callback and result. Every currently available action stays reachable. Combining repeated headings and changing wrappers is acceptable; dropping an action to shorten the screen is not.

Do not make essential actions dependent on horizontal swiping, hover, long press or a new hidden disclosure. Safety content and required errors never go behind “more.” Existing gating remains, but no new gate is introduced to support the design.

## 5. Home

### 5.1 Fixed frame and reading order

The region above and including the greeting remains unchanged. The launcher retains its current position and appearance. Design the scroll content between those boundaries.

1. Existing header.
2. Existing date, greeting and contextual line.
3. Primary module for the existing Home state.
4. Supporting actions using current eligibility.
5. Existing health/family destinations in a coherent group.
6. Plan, reports and recommendations where currently available.
7. Scroll clearance for the final action above the fixed launcher.

This is a hierarchy proposal, not a new state algorithm. The state-specific versions below retain the current data predicates and current action set.

### 5.2 New user after intake

**User need:** “What can I do with Deborah now?”

Use an open start module with the current introduction and existing starter prompts. Prefer clear full-width action rows, with a familiar icon and trailing affordance, over multiple equally dominant buttons. Preserve prompt wording and prefill behavior. A tap must prepare the same conversation as today; it must not submit a different prompt automatically.

If incomplete intake is still eligible, keep the completion action without introducing a compulsory checkpoint. The existing locked Healing Plan preview and Add Family path stay secondary. No fabricated health progress, fake diagnosis, sample report or “daily AI insight” fills empty space.

**Proposed components:** `StartConversationCard`, existing `IntakeCompletionCard`, existing locked `HealingPlanCard`, shared family entry row. These are future component names, not completed work.

**Acceptance:** all existing prompts and actions remain; zero-history layout is useful; no new onboarding, no new modal and no launcher change.

### 5.3 Returning after a conversation

**User need:** “Where did we leave off?”

Lead with a `ContinueConversationCard`: existing topic, relative date, summary when present and one Continue action. Put metadata in quiet readable text, not colored badges. A subtle lilac surface establishes priority without a border or shadow. Keep the content short by using the existing summary, not by generating a new one or clipping important text.

For mid-intake, show the existing pending question and retain the meaning of “Pick up your answers.” Do not invent a completion percentage. The current resume handler may unarchive and activate a conversation; the component receives that handler rather than reimplementing it.

Next steps form a compact group. Preserve the current supplied order and `steps.slice(0, 3)` limit. Keep existing medication, labs, deferred-profile and follow-up eligibility. No AI ranking, new recommendation engine or changed action parameters.

Intake status, Healing Plan and reports remain reachable. Give My Health and Family a consistent title/metadata/action arrangement. A Visit Notes shortcut is a P1 option: if adopted, it opens the existing records notes segment with the correct context; it must not generate or save a note on tap.

**Acceptance:** Continue reaches the same conversation/question; absent summaries leave a smaller component; all supporting actions remain; count, ordering and gates stay unchanged.

### 5.4 Established user

**User need:** “What am I already working on today?”

Keep the existing habits-for-today lead. Use comfortable checkbox rows and the current done/total representation. No streak, wellness score, celebration or implied medical progress. Preserve exact habit text and IDs.

Below it, present the existing Continue/check-in action, intake status, Healing Plan, reports, destinations and recommendations with the shared visual rhythm. The current due label and callback remain coupled. Zero habits must not display a fabricated achievement or positive health assessment.

**Acceptance:** toggling uses the same profile, habit ID and simulated date; current progress math and day-14 threshold remain; check-in opens the same mode; no state mutation occurs merely on card mount.

### 5.5 Commerce and recommendations

Keep current product eligibility and reason strings; place recommendations after care continuity. Preserve product IDs and suppression rules. Do not add generic promotional material, rating stars, verification seals or new endorsements. If a reason is marked placeholder, keep that status visible in internal review.

A compact tonal row with current image, name and reason is sufficient. Do not restyle a shared chat `ProductCard` globally to achieve the Home treatment. Use an isolated presentation variant or an appropriate existing Home wrapper if implementation is approved.

### 5.6 Home edge cases

| Case | Required treatment |
|---|---|
| Long name / expanded greeting | New body must not assume a fixed intro height |
| Long topic or prompt | Wrap; do not hide meaning in a two-line clamp |
| No summary | Omit its slot, no invented prose |
| Partial intake | Same resume/completion path, no restart |
| Basics at 100%, extended intake incomplete | Preserve truthful values; review labels separately |
| No reports | Current omission/action behavior, no fake report card |
| Due check-in | Current state/action; no invented severity |
| Other profile active | Existing profile-scoped selectors and callbacks |
| Exhausted trial | Existing consultation gate remains |
| Keyboard / small viewport | Last action stays reachable above unchanged input surface |

References: [catalogue R01–R06, R09 and R14](docs/planning/ui-overhaul-references.md). The three-state model is Oracle’s existing behavior; the new hierarchy is our proposal.

## 6. Chat: locked baseline and optional presentation study

### 6.1 Base scope: preserve and verify

The existing chat is a protected destination, not a blank canvas. Home can make it easier to enter or resume, but the resulting chat must be the same. Protect both `Conversation` and `FirstConsult`, including their different entry paths, active question handling and completion behavior.

The compatibility checklist covers:

- Same user and assistant turn sequence, text, question labels and option IDs.
- Same intake control behavior, multi/single selection, skip/Other handling, consent and fact confirmation.
- Same early-guidance versus completed-guidance distinction and counting.
- Same seven answer sections in their existing order, product placement and closing content.
- Same safety precedence, interruption and escalation behavior.
- Same draft retention, sending, stopping, retrying, attachment/voice and keyboard behavior.
- Same scroll anchoring and scroll-to-latest control; new Home styles must not leak into chat.
- Same Visit Notes, PDF, provider-question and next-step actions.

`AnswerSections` currently opens the first section by default, uses the active streaming section while streaming, and provides Expand all / Collapse all after streaming. Preserve these mechanics. Do not turn the answer into a carousel, reorder sections or collapse additional content simply because another app’s answer looks shorter.

### 6.2 Optional future visual direction — requires separate inclusion

If the user later wants chat presentation included, explore the following without touching the composer:

1. **Reading rhythm:** clearer spacing between turns and within long answers, using existing type roles. Keep assistant prose readable on the canvas and the existing user bubble distinction.
2. **Answer navigation:** make current section headings and expand affordances more legible; preserve the same defaults and expanded content. No new generated summary above the seven sections.
3. **Action grouping:** organize existing answer utilities consistently. Keep tap targets and accessible names; do not add copy/share/export actions that are not already supported.
4. **Embedded widgets:** align existing non-intake output cards with the approved tonal vocabulary through explicit variants. Intake widgets stay frozen even if they share primitives.
5. **Provenance:** show only existing lab/source data. A visual source capsule must not suggest web retrieval or clinician verification that did not occur.
6. **Status feedback:** preserve actual stream/error/completion flags. No invented “reviewing your hormones” stage, simulated confidence percentage or exposed chain-of-thought narrative.

This study should produce an annotated comparison before implementation. It is not necessary for the Home, My Health, Family or Notes redesign to proceed.

### 6.3 Why these references fit

[ChatGPT’s follow-up guidance](https://learn.chatgpt.com/docs/use-chatgpt) supports continuity, [Perplexity’s session description](https://www.perplexity.ai/help-center/en/articles/10354769-what-is-a-thread) supports coherent conversation context, and [Claude’s artifact model](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them) supports keeping a reusable document distinct from its conversation. These are interaction lessons, not authorization to add those products’ capabilities.

### 6.4 Explicitly excluded chat ideas

No model selector, DeepSearch mode, regenerate-with-another-model control, branching conversations, new memory panel, live web sources, autonomous care task, new voice mode, automatic note generation, prompt marketplace or new composer accessory row. Each would require product logic or changes to locked controls.

## 7. My Health and Healing Plan

### 7.1 My Health’s purpose

My Health should feel like the organized place for the person’s existing care material. It should complement Home: Home answers “what now?”, while My Health answers “where is my plan and information?” Keep the current header and navigation behavior.

Proposed body sequence, using existing values:

1. Existing focus/last consultation, if present.
2. Current Healing Plan overview, if present.
3. Current check-in/reminder state.
4. Record destinations: History, Visit Notes and Labs with existing counts.
5. Existing “For you from Deborah” items and the full library link.

This retains the current `HubPopulated` content set. The change is visual grouping: current activity in the upper region, records as a consistent compact collection, educational content below. Avoid a large card around every section plus another card around every item.

### 7.2 Focus and plan

Reuse or extend `FocusCard` and `PlanProgressCard`. A focus card shows the existing topic, date and summary. Its action keeps the current unarchive/set-active/openAsk behavior. It is not a new medical assessment and should not be labeled “health insight.”

Plan progress shows the current day and existing habit counts. The title should consistently use the app’s current “My Healing Plan” wording. The code’s 90-day model does not authorize a new completion calculation or a clinical improvement chart. When the plan’s existing day is beyond 90, preserve the current check-in action rather than opening a different screen for visual consistency.

The `HealingPlanCard` used on Home and `PlanProgressCard` in My Health have different responsibilities today. Reuse their underlying visual roles if helpful, but do not merge their behavior just because both display a plan.

### 7.3 Records collection

Use existing `QuickLinks` semantics or a narrow presentational extension. The three destinations remain History, Visit Notes and Labs. Each can have a small icon, label and accurate count; color supports grouping but never substitutes for the label.

A destination with zero records remains honest. Do not use “Ready” or “Updated” without supporting data. Counts must come from the current profile-scoped hook; no aggregate across all family members.

### 7.4 Empty My Health

Keep the current empty-state actions. Make the explanation short and the first action clear, using the existing approved text where possible. Do not show empty charts, multiple disabled tiles or a progress ring at a fabricated starting value. Layout should remain spacious without looking unfinished.

A useful empty state explains what will appear after the existing activity. It does not force intake completion, a purchase or a new data upload unless the current behavior already requires that path.

### 7.5 Healing Plan detail

Preserve the current plan sections, habit checks, dates, day calculations and any existing gates. Use one strong section hierarchy, comfortable rows and restrained separators formed by spacing/tonal grouping. Progress graphics represent adherence or plan position only when that is the existing metric; never describe them as recovery, risk reduction or health improvement.

Completion feedback should be immediate and quiet. Preserve reversibility if the current habit toggle supports it. Do not add confetti, streak pressure, new reminder scheduling, celebratory health claims or a new “finish day” transaction.

### 7.6 Acceptance

- Empty/populated/due/completed/other-profile states are covered.
- Existing pull-to-refresh and loading behavior remains; no new wait is introduced for a visual reveal.
- Focus and plan controls invoke identical actions.
- Record counts and destinations match the current profile.
- Library recommendations use the same items, reasons and eligibility.
- Shared chat or intake patterns are unaffected.

References: [ChatGPT Projects](https://learn.chatgpt.com/docs/projects), [Perplexity Projects](https://www.perplexity.ai/help-center/en/articles/10352961-what-are-projects), and [Claude’s historical project/artifact examples](https://www.anthropic.com/news/projects). The adaptation concerns organization, not new memory or collaboration.

## 8. Family

### 8.1 Family overview

Make the person’s name and relationship the primary information. A `FamilyProfileCard` or reusable profile row should contain the existing avatar/initials, name, relationship and the existing open-details action. Prefer a vertical list to a horizontal avatar carousel, which hides members and becomes awkward with large text.

Use a consistent neutral or lilac treatment rather than a new color for every person. Color must not imply medical risk, age category, permission level or “favorite” status. An active-profile marker is acceptable only where the current selector provides that fact and where its meaning is clear; it is not a reason to change row behavior.

### 8.2 Preserve important distinctions

`ManageProfiles` currently opens a profile’s details using `profileId`. A redesign must not make tapping that row silently switch the active profile. Switching belongs to the current switcher/handler, with its existing effects on conversations and navigation.

Viewing another person’s information and acting on the active profile are different capabilities. Preserve the current hide/disable rules for Ask/Add Labs in other-profile records. A more attractive card must not accidentally make an unavailable action active.

### 8.3 Add-member states

Keep the count and `MAX_PROFILES` limit from the existing code. Preserve the current available, locked and full states, including the existing upgrade path and disabled behavior. Do not introduce invitations, new accounts, shared access, a separate teen login, a new consent screen or a new family plan purchase step.

The Add Member form and dependent/adult intake are locked. Only the entry presentation and non-form profile overview can be included in the base overhaul. Any shared widget used by these forms must retain its default appearance.

### 8.4 Profile details

Organize existing information into clearly titled groups with readable values and current Edit actions. Missing values should retain their existing honest empty representation; never render missing medication data as “None” unless that is the stored meaning.

No new health summary should be synthesized from the profile. Avoid turning identity details into a decorative dashboard. Keep fields, validation and saving behavior unchanged wherever an edit form is entered.

### 8.5 States and acceptance

Review self-only, multiple profiles, maximum profiles, locked add, long names, custom relationship labels, teen/dependent context and adult partner context. Tapping a profile opens the same destination with the same ID. Active-profile switching still uses the current path. No cross-profile record, habit, note or chat leakage is acceptable.

Workspace organization in [ChatGPT](https://learn.chatgpt.com/docs/projects) and [Perplexity](https://www.perplexity.ai/help-center/en/articles/10352961-what-are-projects) is only a hierarchy reference. Neither is evidence for family consent or health-data permissions. Oracle’s existing rules remain authoritative.

## 9. Records and history

### 9.1 Preserve the current record model

Keep Consultations, Visit Notes and Labs as the existing three segments. Retain initial `segment`, optional `profileId`, current sort order and selected state. Do not replace the segments with a mixed timeline or add global search, filters, favorites or pinning without separate scope.

The redesign should make scanning easier through row alignment, title emphasis, useful metadata and consistent item spacing. Dense lists usually benefit from a single grouped surface with generous row rhythm, not a large rounded card around every row.

### 9.2 Consultation row

Reuse `ConsultationRow` and display current topic, date, answered/in-progress state and lab-informed flag. Keep status as readable words with an icon where useful. No new severity color or “verified” mark.

The whole row can remain the existing activation target. Avoid a separate tiny arrow button inside a row that is already clickable. Preserve opening `M-9.2` with the conversation ID. Opening history must not implicitly resume or unarchive a conversation unless the existing handler already does so.

### 9.3 Note row

Reuse `NoteRow` with current title, kind, date and body preview. Distinguish provider briefs from other notes using their actual kind. Existing provider briefs open `M-9.7`; ordinary notes open `M-9.4`. Do not route everything through the prettier document screen.

An absent title remains the current fallback. A preview may be visually shortened only if the full title and the accessible destination remain clear and the body is available on opening. Do not truncate clinical warnings that form the action’s meaning.

### 9.4 Lab row

Use existing name, collection date and value count. If a label is missing, retain the current fallback. A row should look like a report, not a health verdict. No new classification, comparison with previous values or automatic trend arrow.

### 9.5 Empty and large collections

Each segment keeps its existing empty-state action. Retain active-profile restrictions on asking and uploading. Use a short explanation, one appropriate existing action and a restrained icon.

For many records, keep a single scroll container and stable row keys. Do not change sorting or pagination behavior under the guise of performance. Evaluate the current realistic dataset before adding virtualization; it is not a default dependency for this redesign.

References: [Perplexity Sessions](https://www.perplexity.ai/help-center/en/articles/10354769-what-is-a-thread) for coherent history, [file identity](https://www.perplexity.ai/help-center/en/articles/10354807-file-uploads) for recognizable source material, and [ChatGPT organization](https://learn.chatgpt.com/docs/projects). Existing Oracle selectors determine actual content.

## 10. Visit Notes

### 10.1 Experience thesis

Visit Notes should feel like a calm document the person can inspect and use. Keep the current modal/header and existing actions. The body should have a clear document title, patient context, ordered sections and quiet editable controls. Avoid stacking every paragraph into a separate colored card.

The [Claude artifact reference](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them) supports this distinction between conversation and reusable output. Oracle already has the document behavior; this plan improves its presentation.

### 10.2 Preserve the seven document sections

`BriefDocument` currently renders:

1. Chief Complaint.
2. Clinical Context — What Deborah AI Identified.
3. Tests to Discuss.
4. Questions for My Provider.
5. Current Medications & Supplements.
6. Red Flags — Screened by Deborah AI.
7. Deborah AI’s Recommendation.

Keep their content, order and existing editable/read-only distinction, followed by the current disclaimer. These document sections are separate from the seven-section conversational answer; do not assume the models are interchangeable.

The existing patient name, optional date of birth, purpose and priority must remain legible. Urgent/provider-review information may not be reduced to an unlabelled colored dot or hidden in a collapsed panel. Do not imply a real clinician signed or verified an AI-generated brief.

### 10.3 Reading and editing

Use one comfortable document surface. Establish hierarchy with existing type roles, spacing, aligned labels and subtle group fills only where helpful. Keep editable areas visibly editable; removing every control boundary is not worth making a text field look like static prose.

Preserve the current editable chief complaint, tests, questions and medications. Keep exact patch shapes and list semantics. Do not add AI rewrite buttons, version history, autosave, collaborative presence, rich-text formatting or new fields.

### 10.4 Save, export and follow-up

The current Visit Brief code has important side effects: save creates or updates a note, PDF persists a note before opening the existing preview, and both lead to appointment follow-up. Keep that sequence and the same IDs. Do not replace explicit saving with an automatic save on open or blur.

Preserve appointment-date scheduling and the existing no-date seven-day path. Reformatting the follow-up panel must not change notification content, deliverAt calculation, profile deep link or dismissal behavior.

`BriefDocument` is also used in PDF preview. Keep the print/export appearance stable by default. A screen-only visual improvement must not accidentally change printable content, page flow, backgrounds or edit controls. If the document stylesheet is shared, use an explicit screen context; do not assume a UI CSS change cannot affect exports.

### 10.5 Insufficient information

Retain the existing gate/empty state when full guidance is unavailable. The design may make the explanation easier to read but cannot enable PDF or create a brief from incomplete data. Do not present a fake document preview to fill the screen.

### 10.6 Acceptance

Test unsaved review, edited review, saved note reopened, PDF entry, existing urgent priority, no source answer, long lists and follow-up with/without a date. Save must update rather than duplicate where the current code does. The same sourceMessageId, conversationId, noteId and profileId relationships must survive.

## 11. Labs and supporting screens

### 11.1 Labs

Improve report overview/rows and the reading hierarchy of lab details. Keep values, units, reference ranges, collection dates, confirmed state and existing flags exactly as supplied. Do not infer missing units, calculate trends, add normal/abnormal judgments or invent source confidence.

Preserve upload, camera/file permission, extraction, confirmation and editing behavior. The current uploader and confirmation form are not replaced with an AI-app attachment model. A report-looking card must distinguish available metadata from a result’s interpretation.

Use [Perplexity’s file context](https://www.perplexity.ai/help-center/en/articles/10354807-file-uploads) and [source transparency](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search) as clarity references. Source metadata is evidence only when it actually exists in Oracle’s data.

### 11.2 Library and content detail

Use the existing content title, type, image and reason. Make the title the main entry, with one concise metadata line and current action. Keep `useForYou` selection and existing library filtering behavior. No infinite discovery feed, popularity score, new tags or invented reading-time estimate.

Content detail should prioritize the actual reading/media experience. Avoid decorative cards around every paragraph. Preserve media controls, source attribution and current destinations. A content card reused in the hub and library must use the same component with a deliberate presentation variant if needed.

### 11.3 Booking

Align non-form body cards with the tonal system, preserving the current booking path and its simulated nature. Keep location/eligibility, available slots, booking confirmation and reminder behavior. No new urgency badge, fabricated remaining-slot count, payment path or promise of appointment availability.

Any booking widget used inside locked chat must keep its current default appearance. Styling the booking screen is not permission to change `BookDeborah` everywhere.

### 11.4 Settings and account bodies

A later consistency pass may improve section spacing and grouped rows without changing the header, text-size settings, subscriptions, sign-out, privacy controls or data actions. Sign-in/sign-up forms, payment and legal/consent surfaces stay locked.

Keep destructive actions visually distinct and their existing confirmations intact. Do not use the no-stroke preference to make destructive and ordinary actions indistinguishable.

### 11.5 Notifications and About Deborah

If included in P7, use current notification state, timestamps and deep links; no new filters or unread logic. About Deborah can adopt the approved body spacing while preserving biography, claims and assets. Neither screen is a prerequisite for reviewing the main Home slice.

## 12. Visual language and tokens

### 12.1 Tonal hierarchy

The design should use a small set of existing tonal roles consistently. Color is a tool for grouping, not a different theme for every card. Reserve the strongest accent for the clearest action. Make titles readable through ink, scale and placement rather than heavy weight or outlines.

| Role | Existing token candidates | Proposed usage |
|---|---|---|
| Main canvas | `--color-canvas`, `--surface-canvas` | Keep effective background; do not modify locked upper region |
| Quiet reading surface | `--color-surface`, `--card-tone-paper` | Notes, grouped records, secondary material after compositing checks |
| Continuation emphasis | `--card-tone-lilac`, `--color-accent-tint` | Primary contextual care module |
| Plan/warm grouping | `--card-tone-linen`, `--color-surface-tonal` | Existing plan or related grouping |
| Occasional soft accent | `--card-tone-rose` | Existing suitable secondary roles; not a new health status |
| Action | `--color-accent`, `--color-accent-pressed` | Existing primary action vocabulary |
| Text | `--color-ink`, `--color-ink-body`, `--color-ink-secondary` | Title, prose and metadata with verified contrast |
| Focus | `--color-focus` | Visible keyboard focus remains mandatory |
| Safety/status | Existing danger/success/warning tokens | Only where current state gives those meanings |

Use semantic token names, not new hex values in individual cards. If a genuinely missing role emerges, propose a semantic alias to existing tokens with a clear use case. No new palette, font family or parallel design system is needed. Do not copy ChatGPT black/white, Claude orange/beige, Perplexity teal or Grok branding.

The currently loaded paper token may be translucent. It is not automatically safe on every background. Measure the final composite; prefer an existing opaque semantic surface where blur/backdrop would undermine reading. A named token is not proof of accessibility.

### 12.2 Borderless cards without weak affordances

Use flat filled surfaces, spacing between groups and consistent alignment. Avoid decorative card strokes, inset highlights, hover shadows, floating card shadows and nested glass rims. Keep a clear heading and recognizable action so a tonal tile does not resemble an inert illustration.

Static information does not need an arrow. Navigating rows do. Checkable habits need a checkbox state. A button inside a card needs a clear label. Do not place a button inside an already interactive button-shaped card. If a module has several actions, its outer container is non-interactive and each control has its own hit target.

Preserve necessary control boundaries, selection indicators, focus outlines and safety distinctions. If an accessible field requires a stroke, that is a functional boundary, not decorative card chrome. Locked controls keep their current treatment.

### 12.3 Type and spacing

Use current semantic text roles and `--type-scale`, not fixed arbitrary sizes. Preserve the 400/500 weight vocabulary. Display typography belongs at genuine display moments; use body/headline roles for most row titles and card controls. The locked Home greeting retains its current type treatment.

Use existing spacing primitives and screen margin. Establish one consistent rhythm: tight metadata groups, comfortable item spacing, larger section gaps. Give a heading more space above than below. Avoid equal large padding on every module, which makes a phone feel like a long stack of posters.

Do not shrink text to fit a two-column layout. Destination pairs can become a single column at narrow widths or large text. Card height follows content. Preserve the intent of the project’s 13px caption floor; P0 should measure actual small text-size settings because multiplying a 13px token by 0.9 may fall below that floor. Do not globally change locked text to resolve it within this overhaul.

### 12.4 Geometry

Reuse effective `--radius-card` and smaller radius roles deliberately. One major card radius, one compact row/control radius and the existing round button/avatar vocabulary are enough. Avoid introducing a unique corner shape for each card.

The effective skin currently sets a larger card radius than old DESIGN.md. Retain that as the initial visual baseline; do not turn every list row into a 30px pill. Existing pill-based intake widgets remain locked and are not removed because an older design document bans pills.

### 12.5 Iconography

Keep the `Icon` adapter and the installed free Hugeicons family. Use existing names such as `chat`, `health`, `family`, `note`, `labs`, `calendar`, `upload`, `bell`, `check`, `chevron` and `lock` where supported by the adapter. Verify names before implementation; do not invent a package export or add direct library imports in screens.

Prefer consistent icon size, optical alignment and stroke weight. Flat UI can use stroke icons; it does not require a paid solid/duotone set. Small tonal icon backgrounds can distinguish actions, but avoid colored icon boxes on every single text row. Never use an unlabeled sparkle to mean both AI guidance, recommendations and status.

Icon-only controls retain accessible names and comfortable hit areas. Decorative icons are hidden from assistive technology. Status always includes words. The [Hugeicons reference](https://hugeicons.com/docs/faqs/license-questions) confirms the free Stroke Rounded package is separately MIT licensed; retain its notices and avoid paid families.

## 13. Blur, motion and feedback

### 13.1 Progressive blur: narrow purpose

Progressive blur should indicate a scroll boundary or an existing overlay relationship. It is not a material applied to every card. `ScrollEdge` already contains layered masked blur; keep the locked header’s current behavior in the base phase. Do not retune that shared primitive globally.

For a future in-scope scroll boundary, use a bounded decorative layer outside text/control content. It must not intercept pointer events, obscure the last line, or create a new scroll container. Keep essential text on stable readable surfaces. Avoid blurring medical content directly.

An implementation proposal may reuse the existing strong/soft structure with tokenized effect roles. Exact blur radii and fade depth are a P1/P2 visual decision, not values copied from a competitor. Avoid full-height backdrop filters, many overlapping layers and scroll-driven JavaScript that updates styles every frame.

### 13.2 Fallbacks

Provide an opaque or quietly fading token-based edge when backdrop-filter is unavailable or reduced transparency is requested. Do not assume every target browser exposes the preference. The default layout must remain usable without blur.

See [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) and [reduced transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency). They explain browser behavior, not a guarantee about any specific target device’s performance.

### 13.3 Motion vocabulary

Use the existing duration/easing tokens and Motion adapter. Apply feedback to the changed element: a pressed fill, a check state, an existing modal transition. Do not cascade a long entrance animation through Home each visit.

No new shimmer, bounce, parallax, orbiting AI symbols, looping glow, confetti or animated health gauge. Avoid movement that makes the user wait to tap or read. For reduced motion, feedback should remain understandable through instant state and color/text changes.

Existing navigation transitions and loading timing remain unchanged. A visual improvement cannot add a new delay to mask an expensive component. Avoid remounting components for a pleasant animation when that would reset focus, selection or local edits.

### 13.4 Interaction feedback contract

| Interaction | Proposed feedback | Preserve |
|---|---|---|
| Tap a destination | Existing pressed/transition response | Same route and parameters |
| Toggle a habit | Existing checked state, quiet fill | Same ID/date mutation and reversibility |
| Save a note | Existing toast and follow-up panel | Same persistence timing |
| Choose record segment | Clear selected state | Same segment model and list contents |
| Disabled/gated action | Existing reason/state visible | Same eligibility and upgrade/gate path |
| Loading | Existing static skeleton/spinner | Same source of truth and timing |
| Error/retry | Readable current message and action | Same retry behavior; never hide the failure |

## 14. Reusable component architecture

### 14.1 Layer responsibilities

**Primitives (`ui/`):** generic typography, buttons, icons, avatar, layout and accessible controls. Do not add health logic here. Do not globally restyle a primitive when locked consumers use it.

**Patterns (`patterns/health`, `patterns/profile`, `patterns/widgets`, appropriate domain folders):** reusable meaningful card/row compositions. Prefer existing modules; extract Home-specific patterns only when needed. A component’s home follows its domain, not the fact it has rounded corners.

**Screens:** own route context, current selectors, orchestration and handlers. They pass explicit data and callbacks into patterns. Existing hooks keep deriving eligibility/state.

**Widget Library:** imports those same modules and provides explicit fixtures. Its local demonstration state must not mutate real consultation data or replace production handlers.

No generic schema-driven dashboard, new component framework, state management library or UI dependency is required. Do not add a universal `Card` with dozens of boolean props to conceal unrelated domain semantics.

### 14.2 Component inventory

“Extend” means a narrowly scoped approved variant; existing locked consumers keep their current default. “New/extract” means proposed work, not code already created.

| Pattern | Strategy | Production use | Required library variants |
|---|---|---|---|
| `StartConversationCard` | Extract current Home intro/prompt composition | New Home | 1/3 prompts, long prompt, completion context |
| `ContinueConversationCard` | Extract current returning hero; evaluate shared layout with FocusCard | Returning Home | Summary/no summary, pending question, long topic |
| `NextStepsList` and `NextStepRow` | Extract current Home action list | Returning Home | 0/1/3 items, long labels, existing disabled state if supported |
| `TodayHabitsCard` | Extract `StateEstablished` habit composition | Established Home | 0/1/many habits, some/all complete |
| `IntakeCompletionCard` | Reuse; avoid changing intake UI | Home | Existing complete/incomplete states, truthful mixed completion example |
| `HealingPlanCard` | Reuse or explicit body-only variant | Home | Locked, day 1, active, long focus |
| `HealthDestinationCard` | Extract/extend HomeKit tile composition | Home | My Health/Family, count/no metadata, narrow layout |
| `ReportSummaryCard` | Extract Home reports link if distinct enough | Home | Available metadata, missing name/date, long name |
| Recommendation item/group | Reuse `HomeKit`/commerce pattern where safe | Home | 0/1/multiple existing eligible products, long reason |
| `FocusCard` | Reuse/extend | My Health | With/without summary, placeholder flag |
| `PlanProgressCard` | Reuse/extend | My Health | Active, complete, zero habits |
| `CheckInCard` | Reuse/extend | My Health | Every actual state from current props |
| `QuickLinks` | Reuse/extend | My Health records collection | Zero/large counts, large text |
| `FamilyProfileCard` or profile row | Extract meaningful overview composition | Family | Self/dependent/partner/custom relationship/long name |
| Add-family entry | Extract or reuse current action composition | Family/Home where semantics match | Available/locked/full |
| `ProfileBanner` / `ProfileSwitcherList` | Preserve by default; demonstrate context | Existing profile surfaces | Self/other/active; no changed switching |
| `ConsultationRow` | Reuse/extend | Records | Answered/in-progress, lab-informed, long title |
| `NoteRow` | Reuse/extend | Records | Provider brief/ordinary note/untitled/long preview |
| `LabReportRow` | Extract current ListRow composition if reused | Records | Missing metadata, many values, long name |
| `BriefDocument` | Reuse with screen-safe presentation | Visit Notes | Editable/read-only, sparse/long/urgent; print remains protected |
| Document section/layout primitive | Extract only if useful in BriefDocument | Visit Notes | Heading/body/list, editable field, missing section data |
| `AppointmentFollowUp` | Keep logic, scoped presentation only | Visit Notes | With/without date, current actions |
| `ContentCard` | Reuse/extend | Hub/library | Content types, reason/no reason, long title |
| `EmptyState` | Reuse with approved presentation | Health/records/notes | Each real empty reason/action, no invented capability |
| Scroll boundary treatment | Reuse concept; scoped variant only if needed | New in-scope bodies | Active/inactive/reduced transparency/unsupported fallback |

Do not build every proposed abstraction automatically. First compare current props and usage. If `FocusCard` already expresses the required behavior, extend it narrowly instead of creating a second equivalent card. Conversely, a visual resemblance alone is not enough to combine components with different actions.

### 14.3 Pattern contract

Each reusable card/row has:

- A typed data contract using current values, IDs and enums.
- Explicit event callbacks; no label-to-action keyword routing.
- A meaningful accessible name and heading relationship.
- Documented empty/optional slots, minimum/long content and disabled semantics.
- Clear controlled versus local presentation state.
- Stable identity so rerenders do not reset fields, selection or focus.
- A CSS Module using semantic tokens and locally scoped selectors.
- A barrel export where consistent with the current folder conventions.
- A Widget Library entry importing the production component.

Keep pure formatting local where appropriate, but do not derive new clinical priority or completion. No card should call the store on mount to create notes, mark reports read, advance intake or schedule a reminder.

### 14.4 Shared-consumer protection

Before editing a reused pattern, list every consumer. If chat, intake, headers or onboarding use it, keep the default unchanged and prefer a deliberate context variant for the approved body. Do not spread an “overhaul” CSS selector across `.phone-root` or override every `button`/`section` globally.

If isolation would require invasive branching, leave that shared pattern as-is for this phase. An imperfectly matched existing control is safer than breaking a locked journey. Record the mismatch for later review rather than hiding a broad change inside a component refactor.

## 15. Widget Library

### 15.1 Required role

The existing library at `/internal/wid?flow=v2` remains the place to inspect shared components. Every new card must appear there using the actual production module. A screenshot or a separately styled sample is not sufficient.

Preserve the current chat showcase and its composer. Add a non-product catalogue area or section for Home/health/profile/record/document patterns, while keeping the existing global toolbar/header unchanged. Catalogue controls may live inside the library body. They must not become product navigation or require a new route.

### 15.2 Entry anatomy

Each entry should show a plain component name, a one-sentence purpose, the screen(s) using it, representative fixtures and the same action states seen in the product. Include its source path and token roles in internal documentation, not in patient-facing UI.

For interactive specimens, callbacks update local fixture state or report the intended action/parameters in the internal sample. Never import the WidgetLab keyword router into product code, and never trigger real booking, saving, shopping, subscription or notification behavior from a casual specimen click.

### 15.3 Coverage dimensions

For each new card, cover default, sparse content, long content, narrow width, largest text, keyboard focus and applicable pressed/selected/disabled/loading/error states. Do not invent unsupported states simply to fill a catalogue matrix: a static note preview does not need a loading spinner if it never loads independently.

Preserve mock/placeholder labeling. A lab fixture is not real medical information and must not be silently promoted into a production recommendation. Keep scenario examples deterministic and profile-specific.

### 15.4 Completion rule

A new card is incomplete until its shared implementation, product use, Widget Library specimens, state notes and action contract all exist. Screens must import it rather than carrying a subtly different local copy. Review library and screen together; the library proves component coverage, while the screen proves composition.

The Design System route should document primitive/token roles when new roles are adopted. It need not duplicate every full widget. Widget Library owns contextual examples; Design System owns reusable rules and foundational controls.

## 16. Behavior preservation

### 16.1 What UI-only means here

A change is eligible when it changes presentation, composition or a local disclosure of already available nonessential information without changing what the action means. Moving a current card, extracting markup, aligning metadata or adding an accessible label to an in-scope new control can fit. Changing a question, gate, route parameter, persistence operation, priority algorithm or required action sequence does not.

Local presentation state is not automatically harmless. A new accordion can hide an essential action; a new tab can reset a form; a remount can clear a draft. Keep the base design simple enough that these risks are unnecessary.

### 16.2 Protected implementation areas

| Area | Default rule |
|---|---|
| `src/shared/engine/` | No changes |
| `src/shared/store/`, selectors and slices | No behavior or schema changes |
| Clinical/intake/consent data and shared copy | No wording, sequencing or eligibility changes |
| `navigation/registry.ts`, nav store, transitions | Preserve route IDs, stacks, params and transitions |
| `useHomeData`, `useHomeView`, `useHubData`, account/add-member gates | Preserve derivation and handlers |
| Onboarding, Complete Intake, chat, Composer and ChatLauncher | Locked visual/behavior boundary |
| `mobile.tokens.css`, skin, shared primitives | No global changes as a shortcut; explicit scope review first |
| Client app/shell/top-nav | Excluded |
| `versions/v1/`, manifest and saved contracts | Excluded |

Some presentational extraction may occur in a screen file that also contains handlers. Review the diff at statement level: JSX composition can change while the handler bodies, conditions and effects remain identical. If a desired visual arrangement needs a behavior change, move that item into deferred scope.

### 16.3 Action-equivalence ledger

| Existing action | Required parity evidence |
|---|---|
| Home launcher | R01 still uses its returning scripted path; other scenarios keep current active/openAsk behavior |
| Continue mid-intake | Same conversation, current question, answer mode and draft |
| Continue existing conversation | Same selected target, unarchive/set-active effects and openAsk call |
| Starter prompt | Same prefill string and entry behavior; no automatic new submission |
| Complete Intake | Same intakeDone-dependent destination/action |
| My Health/Family tile | Same route and back-stack behavior |
| Healing Plan | Same `journey` gate and current destination |
| Check-in | Same `mode: 'checkin'`, current profile and eligibility |
| Toggle habit | Same habitId/profileId/date and toggled value |
| Add family | Same `add(false)` behavior, full/locked handling and limit |
| Open family details | Same `profileId`; no implicit profile switch |
| Open record | Same record-specific ID and editor/detail destination |
| Add labs | Same active-profile eligibility and `documents` gate where currently applied |
| Save Visit Notes | Same create/update decision and note fields |
| Download PDF | Same persist-before-preview operation and briefNoteId |
| Schedule follow-up | Same date calculation, notification copy/deep link and dismissal |
| Product action | Same eligible productId and existing destination |

Record the baseline once using representative seeded data. New handlers should normally be passed through, not reconstructed inside the new card. Comparing appearance alone does not prove behavior parity.

### 16.4 Preserve data meaning

Do not conflate absent medication information with an explicit “none,” unconfirmed labs with reviewed labs, early guidance with completed guidance, a saved note with a draft, or profile basics with extended intake completion. Visual state labels should reflect the existing fields exactly.

No new data model, migration, API request, AI provider, storage key or cross-profile aggregation. The prototype remains a frontend with scripted/mock AI behavior. The interface must not imply newly available intelligence.

### 16.5 Non-blocking implementation

Build one vertical slice at a time. Components can be reviewed with local fixtures before their screens are changed. Existing screens keep working while a slice is under review. Do not turn the overhaul into a prerequisite for fixing unrelated bugs or continuing existing product work.

If provenance fields are missing, omit the optional provenance enhancement. If a new icon is unavailable, use a suitable existing icon. If blur is slow, ship the fallback. If a shared pattern cannot safely be restyled, preserve it. None of these should stall Home composition or force new infrastructure.

Keep PRs/commits scoped to one phase or coherent slice. Revert the specific presentation patch if needed; do not reset unrelated user work or revert the whole repository. No data migration should be required for rollback.

### 16.6 Shared `/` and `/internal` surface

`VERSIONS.md` explicitly states that Version 2 `src` is shared with the client demo. Default proposal: build on an isolated branch and review locally at `/internal`. Do not merge/deploy while the design is under review. This permits progress without claiming runtime isolation that does not exist.

If a deployed internal-only preview is later required, agree on a scoped presentation isolation approach before shipping it. Do not add a global flag or freeze `versions/client` as a side effect; the frozen client snapshot is separately requested work. Continue to leave `ClientApp`, `ClientShell` and `ClientTopNav` untouched.

## 17. States and content ranges

### 17.1 Coverage matrix

| Surface | Required states |
|---|---|
| Home | New, returning, established, mid-intake, no summary, due check-in, zero reports, recommendations absent/present |
| My Health | Loading, empty, populated, refresh, plan complete, other profile |
| Healing Plan | Locked/currently gated entry, active, no habits, some/all complete, beyond day 90 |
| Family | Self only, multiple members, add available, add locked, full capacity, custom relationship |
| Records | Each segment loading/empty/populated, active/other profile, long collection |
| Visit Notes | No full guidance, unsaved, edited, saved/reopened, urgent priority, PDF, date/no-date follow-up |
| Labs | No report, partial metadata, unconfirmed/confirmed as currently represented, long values, existing errors |
| Library | Existing content types, no eligible recommendations, missing optional metadata, long title |
| Locked surfaces | Sign-in, intake variants, chat start/stream/stop/error/safety/end, composer keyboard/focus |

### 17.2 Useful existing scenario seeds

Use the current `src/shared/scenarios` data and visible scenario picker, not invented replacements. Reconfirm seed contents at P0 because the working tree is evolving.

| Seed | Main purpose |
|---|---|
| S01 | New-user/sign-in boundary regression |
| S02 | Signed-up/onboarding boundary; do not assume it is already post-intake |
| S03 | Basic-details/intake-related entry; verify actual seed and visible route before use |
| R01 | Returning Home, continuation and special launcher path |
| S04 | First completed answer and downstream actions |
| S05 / S06 | Last free/exhausted trial gates |
| S07 / S08 | Follow-up due / labs reviewed with established plan |
| S09 / S10 | Family context / individual-plan family gate |
| S11 | Empty My Health |
| S12 / S13 | Escalation and safety compatibility |
| S14–S18 | Representative age/stage/pregnancy/male journey compatibility |
| S19 / S22 | Fact confirmation and provider-review ending |
| S20 / S21 | Dependent and adult-partner intake compatibility |
| S23 | Early guidance versus completed guidance |
| S24 / S24b | Visit Notes full-guidance and insufficient-detail cases |

A seed name is not proof that every state is exercised. Add only necessary UI fixtures for missing presentation ranges; do not rewrite the clinical seed to make a prettier screenshot.

### 17.3 Content stress ranges

Use one-word and long names, two-to-four-line topics, long relationship labels, missing summaries, long prompts, zero/one/three next steps, zero/five family profiles according to the actual limit, zero/many records, multi-line medications with doses, and long provider-question lists. Include labels at approximately twice their English length for expansion checks without adding localization infrastructure.

Test default and all supported in-app text sizes, narrow phone width, existing 393×852 frame, wider phone and short keyboard-reduced height. Do not fit long content by reducing font size, hiding an action or assuming a fixed card height.

## 18. Accessibility and responsiveness

### 18.1 Readability and interaction

Use WCAG 2.2 AA as the minimum and retain the project’s 7:1 target for readable text and 48px comfortable hit targets. Those stronger project targets are not a claim that AA universally requires those exact numbers. Measure actual effective colors after skin overrides, alpha compositing and background effects.

Provide text alongside semantic color and use clear names for icon controls. Keep headings in logical order. Use lists for collections, buttons for actions and appropriate links for navigation according to existing conventions. Card boundaries can be subtle while the action itself remains recognizable.

Source: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Existing accessibility shortcomings on locked surfaces should be recorded separately instead of silently broadening this UI task.

### 18.2 Focus and keyboard

The new body must work with keyboard navigation in the browser prototype. Keep a visible focus outline, logical order and no nested interactive elements. A large clickable card must not trap focus or activate when its internal checkbox is used.

Focused content must remain visible above the fixed launcher/composer and below any header. Use correct scroll clearance in the body without changing those locked elements. Retain current modal focus management and return focus to the invoking control. See [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum).

### 18.3 Text scaling and layout

At large text, rows grow, destination pairs stack and metadata wraps. Avoid fixed heights except where the existing control contract requires them, and never clip action labels. Screens with long documents use a readable single column; no phone-sized split view.

Respect the phone frame and safe-area behavior already present. Responsive changes apply to the prototype’s in-scope body, not a new desktop product. The web app under `src/apps/web` remains separate scope.

### 18.4 Motion/transparency preferences

Every optional effect has an immediate/opaque fallback. Reduced motion must not remove status feedback. Reduced transparency must not expose text to a busy background. Where a preference is unsupported, the default design still meets readability and interaction requirements.

## 19. Performance and failure handling

### 19.1 Performance approach

Record a baseline on the same browser/device and representative scenarios before changing the UI. Compare Home scroll, record scroll, opening a note and typing in the locked composer. The goal is no material regression; absolute performance budgets should be set from this baseline rather than fabricated in a planning document.

Avoid per-card backdrop filters, full-screen animated gradients, large new imagery, repeated measured layout in scroll handlers and new dependencies. Keep icon imports behind the current adapter. Stable component keys and lightweight presentational props matter more here than premature memoization.

If scroll or input degrades, remove the optional effect first. The app must remain usable and visually coherent without blur. Do not compensate with longer loading animations or a delay before showing the screen.

### 19.2 Loading and failures

Use existing loading/error flags and the same retry actions. Static skeletons match the eventual geometry where already used. Do not invent network states in a purely local card or show an animated “AI working” indicator merely during navigation.

Preserve current validation and error text. A new card should not swallow an exception, disable an action permanently or hide a failed upload behind a completed-looking surface. When optional data is absent, omit that slot; when an actual action fails, show the current failure state.

### 19.3 Graceful partial delivery

Home can ship to internal review while supporting screens remain visually unchanged. The common components must tolerate that mixed period without changing global styles. A missing optional polish item does not justify blocking an otherwise complete and behaviorally correct slice.

## 20. Phased build backlog

The companion [program.md](program.md) contains the overall estimate and review gates. The tasks below are future build instructions, not work performed in this planning turn.

### P0 — Baseline and boundaries · 1–2 focused days

**Inputs:** approved plan, current working tree, existing scenarios.

- Capture locked sign-in, intake, headers/greeting, chat/composer and shared consumer regions in representative states.
- Record effective token values and load order; settle current skin as baseline without an incidental palette migration.
- Inventory every action and visibility predicate for the first Home slice.
- Record current checks and distinguish pre-existing failures.
- Map component consumers and identify shared print/chat/intake risks.
- Choose local/branch review and document the shared client-surface implication.

**Exit:** boundary manifest, action ledger, scenario list and baseline evidence. No new behavior. Avoid turning a broad audit into a prerequisite for all design work; investigate only material risks to the requested scope.

### P1 — Composition and visual agreement · 2–3 focused days

- Prepare new/returning/established Home compositions using actual scenario content.
- Place unchanged header, greeting and launcher in every composition.
- Compare continuation, supporting actions and destinations at real phone size.
- Demonstrate one card, one list row, one document section and one family row using current tokens.
- Include narrow/large-text layouts and opaque/reduced-motion variants.
- Assemble a small dated reference board from the catalogue, with a specific lesson for each capture.
- Resolve optional Home Visit Notes shortcut and any nonclinical label clarification.

**Exit:** one selected composition and a component/state list. Do not polish every secondary screen before the Home hierarchy is agreed.

### P2 — Shared patterns and catalogue · 2–3 focused days

- Reuse compatible patterns; extract Home-specific cards with typed props and callbacks.
- Keep locked shared defaults unchanged; add scoped presentation variants only where justified.
- Create Widget Library specimens for every new card and each material state.
- Use existing spacing/type/color/icon roles and document any proposed alias.
- Check keyboard semantics, target size, long content and largest text on specimens.

**Exit:** reusable modules and their real library examples. No production screen should contain an unregistered new card after this phase’s integration work.

### P3 — Home vertical slice · 2–3 focused days

- Replace state body composition only; preserve Home hooks/effects/handlers, greeting and launcher.
- Integrate all three state layouts, retaining current conditions and available actions.
- Verify mid-intake resume, R01 launcher branch, check-in, habits, family, reports and product paths.
- Inspect first viewport and bottom reachability at default/largest text and keyboard height.
- Compare locked regions before/after and check shared chat/intake consumers.

**Exit:** concrete Home review with screenshots and action-equivalence evidence. If a composition needs changed logic, revise the composition or defer that part.

### P4 — My Health and Healing Plan · 2–3 focused days

- Apply the current-work/records/educational-content hierarchy.
- Reuse Focus, PlanProgress, CheckIn and QuickLinks patterns with scoped styles.
- Preserve empty/loading/refresh/completed behavior and plan-day actions.
- Verify record counts and IDs for self and another active profile.
- Add any new variants to the library in the same slice.

**Exit:** empty/populated/due/completed hub and plan states with current behavior intact.

### P5 — Family and profile context · 1–2 focused days

- Introduce the shared profile overview row/card with readable identity and relationship.
- Preserve details navigation versus switching.
- Retain add-member available/locked/full behavior and current capacity.
- Limit profile details changes to approved non-form presentation.
- Check dependent, partner, custom relationship and long-name fixtures.

**Exit:** improved overview with no changed forms, consent, membership, active profile or record access.

### P6 — Records, Visit Notes and lab presentation · 2–4 focused days

- Harmonize consultation/note/report rows without changing segments, selectors or sorting.
- Present Visit Notes as one document, keeping section order and edit semantics.
- Preserve source IDs, save/update/PDF/follow-up sequencing.
- Scope screen styles to avoid accidental print/PDF changes.
- Verify full/insufficient guidance, saved/reopened notes, urgent priority and long documents.
- Improve report reading surfaces without new lab interpretation or upload behavior.

**Exit:** retrievable records and usable notes with correct persistence/export behavior. If shared PDF styling cannot be isolated, retain the existing document styling and ship the safe surrounding improvements.

### P7 — Supporting body consistency · 1–2 focused days

- Apply approved spacing and card vocabulary to library/content, booking information and selected settings bodies.
- Preserve existing forms, gates, payments, legal copy and notification logic.
- Keep shared chat widget defaults unchanged.
- Update catalogue coverage for any newly extracted card.

**Exit:** consistent supporting surfaces without expanding product scope. Unrelated feature work remains deferred.

### P8 — Integration and acceptance · 2–3 focused days

- Review the full approved surface set and locked boundaries in one batched pass.
- Check large text, keyboard, reduced motion/transparency, long content and cross-profile cases.
- Run required build/lint/type/journey/version checks, compare against baseline.
- Measure representative scroll/input behavior and remove effects that regress it.
- Fix material issues in one batch, then confirm the fixes in a bounded second pass.
- Record library completeness, known limitations, diff scope and per-phase rollback.

**Exit:** reviewable internal result. Acceptance is not automatic permission to deploy to `/`.

### PX — Optional chat presentation · 2–4 additional focused days

Only after explicit inclusion of chat presentation. Start with §6’s comparison, enumerate exact components to change, preserve all intake/composer/header defaults, and verify every affected answer/stream/safety state. Keep this a separate slice so declining it does not block the rest of the overhaul.

**Base estimate:** 15–25 focused working days, excluding review wait and unrelated defects. Home becomes reviewable at P3. PX is additional. Re-estimate after P0 using the actual shared-style and baseline-test findings.

## 21. Verification and acceptance

### 21.1 Existing checks

During implementation, run the repository’s existing commands appropriate to the slice, followed by the complete set before final acceptance:

- `npm run typecheck`
- `npm run lint`
- `npm run test:journeys`
- `npm run test:versions`
- `npm run build`

These are planned verification steps, not tests claimed to have run during this documentation-only task. Existing journey/version checks cover important behavior but do not prove UI affordance quality or every handler binding. Pair them with the action ledger and visible scenario inspection.

Add focused behavioral checks only if extraction creates a material untested risk, such as wrong record ID or save action. Do not create tests that merely assert a class name, mirror JSX or freeze every spacing choice.

### 21.2 Concrete acceptance criteria

| Criterion | Evidence |
|---|---|
| Locked surfaces unchanged | Matched-state before/after captures and affected-consumer review |
| No changed domain logic | Diff shows no engine/store/data/schema/gate changes; handler ledger matches |
| Correct continuation | Same conversation/question before and after for R01 and mid-intake |
| Clear Home priority | Reviewers can identify the primary existing task without explanation |
| Existing actions retained | Content movement ledger accounts for every action |
| Profile correctness | Self/dependent/partner action traces keep correct IDs and data |
| Correct notes behavior | Create/update/reopen/PDF/follow-up results match baseline |
| Component reuse | New card modules are imported by screens and library, with no duplicate specimen markup |
| Tone and hierarchy | New decorative cards use token-based flat fills with no ornamental border/shadow |
| Accessible interactions | Keyboard, focus visibility, labels, targets, contrast and text scaling checked |
| Graceful effects | Reduced-motion/transparency and unsupported-blur variants remain usable |
| No performance regression | Same-device comparisons of representative scroll/input paths |
| Release scope understood | Explicit acknowledgement that shared V2 affects client after merge/deploy |

### 21.3 Suggested usability review

Use a small task-based review with representative users or stakeholders; it is a design check, not a claim of statistical validation. Ask them to continue a conversation, find a saved note, find a lab report, identify the active person and locate the Healing Plan.

Watch where they hesitate, select the wrong item or misunderstand status. Compare with the baseline, rather than declaring an unmeasured percentage improvement. A tentative target is that the main Home task is understood within a few seconds and existing destinations require no extra steps. Do not add analytics or collect health data merely to evaluate the redesign; moderated observation is enough for this phase.

## 22. Risks and deferred decisions

| Risk/decision | Recommended treatment | What can proceed meanwhile |
|---|---|---|
| Chat wording ambiguity | Keep locked; PX separate | All approved surrounding screens |
| Design document versus effective skin | Confirm effective skin baseline; document separately | Source mapping and compositions using current tokens |
| Shared client surface | Local branch/internal review, no automatic deploy | Full local design/build |
| Shared styles leak into intake/composer | Explicit variants, consumer map, no global overrides | Isolated patterns |
| 100% basics versus incomplete extended intake | Preserve predicates; review truthful labels separately | Card layout and existing action |
| Missing source metadata | Omit unsupported provenance UI | Records/notes presentation |
| Shared BriefDocument print styling | Screen scope or retain existing document styling | Record rows and modal body organization |
| Dense phone layout | Vertical hierarchy, natural height, large-text stacking | Core components |
| Expensive blur | Opaque fallback; remove optional effect | Entire functional layout |
| Existing working-tree changes | Establish baseline and avoid broad resets | Planning and narrowly scoped future slices |
| Prior widget/ending plans | Keep historical plans separate; do not execute them through this revamp | UI-only scope |

### 22.1 Optional ideas explicitly outside the base plan

Daily AI briefings, generated next-best actions, symptom trend graphs, risk scoring, new citation infrastructure, new search/filter/pinning, cross-device sync, family invitations, new reminder automation, collaborative notes, autonomous care tasks and clinical-content revision are separate product work. They may be valuable later, but none is required to achieve this UI uplift.

### 22.2 Small review decisions

The plan can be reviewed now without answering a questionnaire. The choices that matter before implementation are:

1. Accept or adjust the continuation-first Home hierarchy.
2. Confirm the current effective design skin as the visual baseline.
3. Keep chat locked as proposed, or explicitly include a later PX presentation study.
4. Decide whether a Home Visit Notes shortcut is useful, provided it preserves the existing records path.
5. Confirm the initial screen breadth: P0–P6 first, with P7 as the supporting consistency pass.

None of these authorizes code changes in the present planning task. They are review points for the next implementation request.

## 23. Review checklist

- [ ] Sign-in, intake, headers, greeting/date/time, chat and composer boundaries match the request.
- [ ] Home’s three existing states each have a useful and recognizable next action.
- [ ] All existing paths stay available without new mandatory steps or waiting.
- [ ] My Health feels organized, Family makes person context clear, and Visit Notes read like documents.
- [ ] The reference adaptations are specific and use Oracle’s design system rather than competitor branding.
- [ ] New cards are components and appear as the same implementation in the Widget Library.
- [ ] Flat tonal color and subtle effects preserve readability and interaction clarity.
- [ ] No new AI behavior, clinical logic, data schema or permissions are hidden in the UI work.
- [ ] Each phase has a reviewable output, parity evidence and a safe rollback.
- [ ] Client/shared-source implications are understood before any later release.

The proposed first build milestone is a complete, reviewable Home slice with its reusable components and library examples. The rest of the program extends that accepted language to existing health, family and record surfaces while preserving the product’s behavior.

