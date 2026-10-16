# Oracle Clinician — Post-intake UI Overhaul Plan

**Date:** 17 October 2026 · **Status:** proposal for review · **Implementation:** not started  
**Primary surface:** Version 2 mobile prototype, reviewed at `/internal/mobile?flow=v2`  
**Companion documents:** [program.md](program.md) · [research catalogue](docs/planning/ui-overhaul-references.md) · [previous plan, preserved verbatim](docs/planning/plan-before-ui-overhaul-2026-10-17.md)

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

