# Oracle Clinician — UI Overhaul Program

**Prepared:** 17 October 2026 · **Status:** proposed, for review · **Implementation:** not started

This program defines a presentation overhaul of the post-intake mobile experience. It is a plan for making the existing product easier to understand, navigate, and return to. It does not authorize code changes, new clinical behavior, or a release.

Read [plan.md](plan.md) for the detailed screen and component specifications. Read [the reference catalogue](docs/planning/ui-overhaul-references.md) for the research and the exact patterns to study. The earlier root plan is preserved verbatim in [the planning archive](docs/planning/plan-before-ui-overhaul-2026-10-17.md); its relative links were preserved as historical text and should be resolved from the repository root.

## 1. Program outcome

Give Oracle Clinician the clarity and fluidity of a modern AI conversation app while retaining its own design system, Deborah’s clinical framework, and every existing journey contract.

The proposed direction is **a calm conversation companion with a useful personal health collection**. Home makes the next existing action understandable. My Health organizes ongoing work. Family makes the person in context unmistakable. Visit Notes feel like useful documents that belong to the patient. The approved chat remains the central interaction.

Success is visible in five outcomes:

1. A returning person recognizes where to continue without scanning several equally prominent cards.
2. My Health, Family, history, labs, and Visit Notes are easy to distinguish and reach through existing destinations.
3. Color, spacing, typography, and consistent icons establish hierarchy without decorative strokes or card shadows.
4. Every new card is a reusable component, demonstrated by its actual implementation in the internal Widget Library.
5. The same user action still produces the same route, parameters, data mutation, gate, and downstream result.

## 2. Scope agreement

| Area | Program decision |
|---|---|
| Sign-in, sign-up, onboarding, intake forms and intake controls | Locked visually and behaviorally |
| Chat experience | Locked baseline; audit and document compatibility now. Optional presentation exploration is specified separately in the plan, with no automatic implementation |
| Composer and Home chat launcher | Locked, including styling, placement, dimensions, handlers, focus, attachments, voice, send/stop, and keyboard behavior |
| Headers, navbar, sidebar/navigation chrome | Locked; preserve actions and structure |
| Home greeting, date/time and contextual greeting line | Locked, including device-clock behavior |
| Home below the greeting | Main redesign target |
| My Health, Healing Plan, Family overview/profile details, records, Visit Notes | Main supporting redesign targets, outside locked intake fields and shared chat components |
| Labs, library, content details, booking and settings bodies | Secondary consistency pass, limited to approved presentation surfaces |
| Safety, consent, billing, entitlement and authentication behavior | Locked |
| Desktop web product | Separate later scope; this program concerns the mobile prototype, including its responsive browser container |
| Client chrome and Version 1 | Excluded under AGENTS.md |

The user mentioned both “lock in” chat and planning chat. The conservative interpretation is deliberate: give chat a full compatibility and future design chapter, but keep changes to the actual chat out of the base program. Reviewing the overall plan does not silently unlock chat.

## 3. Research synthesis

The four named products contribute different interaction principles. These are adaptations, not visual copies.

| Reference | Principle to borrow | Oracle application | Boundary |
|---|---|---|---|
| Grok | Direct entry into a conversation | A clear continuation surface and less competing Home content | No mode picker, research engine, new voice experience, or composer change |
| ChatGPT | Continuity and retrievable context | Existing conversation titles, dates, profile context, and records destinations | No new memory, project system, chat search, or background agent |
| Perplexity | Traceable information and contextual follow-up | Honest lab metadata, existing sources, clear next-action rows | No fabricated citations, web search, or new medical synthesis |
| Claude | A useful output has its own readable home | Document-like Visit Notes and organized health material | No collaborative editor, artifact generation platform, or shared workspace |

Official sources, dates, limitations, and screen-to-reference mappings are in the [reference catalogue](docs/planning/ui-overhaul-references.md). Public documentation was reviewed; this is not a claim to have audited every signed-in native app or every release variant.

## 4. Delivery principles

- Build one complete vertical slice before spreading changes across screens.
- Demonstrate new components in the Widget Library before or with their first screen integration.
- Keep the present data models and action handlers. Screens continue owning domain actions; presentation components receive data and callbacks.
- Preserve every existing action’s reachability. Simplification may group or restyle actions; it must not remove necessary paths.
- Do not add a new onboarding checkpoint, confirmation step, modal, account prompt, or health questionnaire to support the design.
- Do not delay independent screens for unavailable source metadata, future AI features, new photography, or a new backend.
- Keep optional effects dispensable. If blur fails contrast, performance, or browser support checks, ship the opaque token-based fallback.
- Do not globally edit tokens, buttons, headers, or chat patterns as a shortcut. Shared changes can alter locked screens.
- Separate identified pre-existing defects from this overhaul. Record them; do not quietly repair behavior in a visual PR.

## 5. Workstreams and ownership

These are future responsibilities, not instructions to launch agents or parallel work now.

| Workstream | Responsibility | Required output |
|---|---|---|
| UX/design | Hierarchy, component composition, screen states, copy boundaries | Approved Home compositions and screen specifications |
| Design system | Effective token inventory, icon usage, contrast, new presentation aliases if needed | Token-role table and Widget Library specimens |
| Mobile frontend | Presentational extraction and screen integration | Small reversible changes with unchanged callbacks |
| Behavioral verification | Existing journey parity and cross-profile isolation | Recorded input/action/output comparisons |
| Accessibility/performance | Text scaling, keyboard/focus, motion/transparency fallbacks | Defect list with evidence and a bounded fix pass |
| Product review | Scope decisions and final visual acceptance | Explicit approval of the concrete screen set |

## 6. Phased build program

Effort ranges are planning estimates for focused design/development work, not delivery promises. They exclude review waiting time and unrelated existing defects. One experienced implementer can run the base sequence; design review may overlap only where dependencies permit.

| Phase | Work | Dependency | Estimated effort | Exit evidence |
|---|---|---|---|---|
| P0 | Baseline, boundary manifest, effective tokens, action inventory | Approval to start implementation preparation | 1–2 days | Locked-region captures, current test baseline, affected-file map |
| P1 | Home composition and reusable visual language | P0 | 2–3 days | Three Home states, one narrow/large-text version, reviewable component specimens |
| P2 | Reusable cards and Widget Library coverage | P1 composition agreement | 2–3 days | Actual shared components with fixtures and callback demonstrations |
| P3 | Home integration | P2 | 2–3 days | New/returning/established Home, identical handler trace, locked-region comparisons |
| P4 | My Health and Healing Plan | P2; use P3 findings | 2–3 days | Empty/populated/completed/due states and original action parity |
| P5 | Family and profile context | P2 | 1–2 days | Self/family/limit/other-profile cases, no changed intake or switch semantics |
| P6 | Records, Visit Notes, labs presentation | P2; P4 destinations settled | 2–4 days | All record segments, editable/saved/gated notes, unchanged PDF/follow-up actions |
| P7 | Secondary bodies: library, booking, settings | P3–P6 | 1–2 days | Consistent presentation without new forms, gates, or commercial logic |
| P8 | Integration, accessibility, performance, final review | P3–P7 | 2–3 days | Acceptance matrix, required checks, library completeness and rollback notes |
| PX | Optional chat visual exploration | Separate explicit chat scope decision | 2–4 additional days | Separate approved proposal and parity checks; composer remains locked |

**Base planning range: 15–25 focused working days**, with Home available for review after P3, before all secondary surfaces are complete. PX is outside that range. Baseline failures or unresolved shared-surface isolation can change the estimate; reassess after P0 using actual evidence.

## 7. Review gates

**Gate A — direction:** Review this written proposal. Confirm or correct the locked boundaries, the Home concept, and the use of the current effective token skin. No application changes happen before a later implementation request.

**Gate B — first visual slice:** Review concrete new/returning/established Home compositions and representative cards. Check the actual first viewport around the unchanged greeting and launcher, rather than approving isolated attractive cards.

**Gate C — Home behavior:** Compare the approved UI with the same seeded scenarios and action results. Approve continuation to the supporting screens only when Home is both usable and behaviorally equivalent.

**Gate D — complete internal review:** Review all included screens, largest text, reduced motion/transparency, keyboard behavior, and Widget Library coverage. Record any optional follow-up separately.

These are future project review milestones. The current task ends with planning artifacts, as requested; it does not require an extra permission loop to finish the plan.

## 8. Shared client surface and release boundary

Current Version 2 product code in `src/apps/mobile` is shared by `/` and `/internal`. The internal password is prototype tooling, not deployment isolation. Simply visiting `/internal` does not prevent a merged shared-component change from appearing at `/`.

Default development proposal: an isolated branch and local/internal preview, with no merge or deployment during design review. Do not change `ClientApp`, `ClientShell`, or `ClientTopNav`. Do not create `versions/client` under this program: VERSIONS.md reserves that for an explicit request.

Before merging or releasing, make the actual impact reviewable. If an internal-only deployed experiment is required, it needs a separately agreed presentation isolation mechanism. Do not claim the present architecture already provides it. Until that decision, the working preview can progress locally without blocking screen design.

## 9. Definition of done

- All approved screen bodies match the selected direction and use existing semantic tokens.
- All new cards are shared components; the Widget Library imports the same modules used by screens.
- No intake, sign-in, header, greeting, composer, chat, engine, store, clinical copy, entitlement, or consent regression.
- No lost navigation destination or inaccessible lower-page action.
- No invented health summaries, completion metrics, clinician endorsements, citations, or personalized recommendations.
- Profile IDs, route parameters, original gating and save/export behavior remain correct.
- All material states are covered, including sparse data and long text.
- Relevant `typecheck`, `lint`, journey/version checks, and build pass, or pre-existing failures are explicitly distinguished from new failures.
- Before/after evidence includes the locked surfaces and representative in-scope screens.
- A phase can be rolled back without migrating or deleting user data.
- No production deployment is implied by internal visual acceptance.

## 10. Review order

Start with the Home proposal in [plan.md](plan.md), then review My Health, Family, Visit Notes, and the component inventory. Use the reference catalogue to inspect the source patterns. The highest-value decision is whether the proposed hierarchy feels right around the parts you already want to keep.
