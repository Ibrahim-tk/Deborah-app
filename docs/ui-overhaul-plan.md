# AI-native UI overhaul — program of record

UI-only visual overhaul of post-intake mobile surfaces, inspired by Claude, ChatGPT, Perplexity, and Grok, expressed only through Your Oracle Clinician tokens. **Logic, navigation contracts, store selectors, and safety flows stay frozen.**

## Verdict

Freeze sign-in, intake, and the chat experience (including Composer). Revamp the Home content column (everything below the date/greeting) into an AI-native companion landing, then restyle My Health, Family, and Visit Notes/Records with the same component language. Every new card is a reusable pattern registered in Widget Lab and Design System. Depth comes from **tonal color fields** plus **selective progressive blur on floating chrome** — not strokes or content shadows.

## Locked surfaces

| Zone | Paths |
|------|--------|
| Sign-in / welcome / account | `screens/onboarding/Welcome`, `CreateProfile`, `Consent`, `Splash`; `screens/plans/CreateAccount` |
| Intake | `HealthBasics`, `CompleteIntake`, `IntakeQuestion`, choice/named-reason widgets |
| Chat + Composer | `Conversation.tsx`, `patterns/chat/*` message UI, **`Composer/Composer.tsx` absolute freeze** |
| Home chrome | `ConversationHeader`, date + `Good {morning\|afternoon\|evening}` intro in `Home.tsx`, `ChatLauncher` structure |
| Backdrop stack | `Aura`, `GradientShift`, `ScrollEdge` (tokens may refine; stack stays) |

## Open for revamp

- Home `StateNew` / `StateReturning` / `StateEstablished` + HomeKit → shared widgets
- My Health hub, NinetyDayPlan, health patterns
- Family manage / details / switcher chrome
- Records / Visit Brief chrome
- Sidebar visual polish

## Design amendments (see DESIGN.md)

1. **Color-Field Depth** — Content cards separate from parchment by fill contrast, not hairline stroke, not shadow.
2. **Progressive Blur Privilege** — `backdrop-filter` only on floating chrome (`ScrollEdge`, transparent headers, optional dock rim). Scroll content cards stay opaque.
3. **No Content Shadow** — shadows only on floaters.
4. **Flat Iconry** — Hugeicons in soft tinted wells.
5. **Subtlety Ceiling** — weight ≤ 500; no shimmer/pulse/bounce.

## Component program

### `ui/` primitives

- `ColorField` — opaque tonal surface (`linen` / `lilac` / `rose` / `paper`)
- `IconWell` — flat icon in soft circle
- Shared progress hairline where needed

### `patterns/widgets/` (Widget Lab required)

- `PrimaryIntentCard`, `PromptStarterList`, `NextIntentRow`, `TodayHabitsCard`
- `DestinationTile` / `DestinationTilePair`, `LinkStatusCard`, `RecommendationCard`
- Existing: `IntakeCompletionCard`, `HealingPlanCard` (restyle carefully)

## Phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | This doc + DESIGN.md amend + docs index links | in progress |
| 1 | Tokens + ColorField/IconWell + extract HomeKit + WidgetLab | pending |
| 2 | Home body visual revamp | pending |
| 3 | My Health + 90-day plan | pending |
| 4 | Family profiles | pending |
| 5 | Records + Visit Notes | pending |
| 6 | Sidebar + orphan hygiene + xref | pending |

## Non-blocking gate

Per phase: `npm run lint` + `npm run typecheck` + smoke new / returning / established / open chat / resume / toggle habit / hub / switch profile / records. If a visual needs a store change, park it.

## References

- https://eug.github.io/posts/dissecting-the-assistant-user-interface.html
- https://aiuxplayground.com/teardowns/compare/design-the-composer
- https://www.mobileappdesign.io/blog/chat-ui-design
- https://screensdesign.com/explore/ui-elements/ai-prompt-suggestions/
- [DESIGN.md](../DESIGN.md), [PRODUCT.md](../PRODUCT.md)
- UX: F02, F06, F07, F09, F09b
- [08-component-system](08-component-system.md), [09-styling](09-styling.md), [12-design-system](12-design-system.md)

## Definition of done

- Locked surfaces unchanged in structure and behavior
- Home content: clear primary intent, ≤3 starters, quiet destinations; parchment/Cormorant/aubergine
- Content cards: color fields, no strokes, no shadows; blur only on floating edges
- Flat Hugeicon wells; every new card in Widget Lab + Design System
- No store/engine/nav contract changes; lint + typecheck clean
