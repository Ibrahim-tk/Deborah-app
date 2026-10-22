# Web migration guides

Mobile is locked. Web is an isolated twin under `src/apps/web`. Same story, flows, store, engine, and Composer look. Only interaction mode and page chrome change.

## A — Component migration

| Mobile | Web |
|---|---|
| Copy `ui` / `patterns` / `screens` | Twins under `@web`; never import `@mobile` |
| Composer | Exact visual twin — do not restyle |
| Orbs / reveals / overlays | Copy and reuse |
| `Sheet` / `BottomSheet` | Centered dialog (same API names) |
| Tab bar | Persistent left rail (Ask · My Health · Account) |
| Push stack | Same navigator stacks (web copy) |

## B — Routing / navigation

Web mounts the copied Navigator inside `WebApp` (BrowserFrame or full-bleed), wrapped by shell `WebDeviceHost` for `useDevice()` (alerts, notify, setScreen). Screen IDs remain `M-*` for story parity with scenarios. Scenarios and shared store drive both platforms.

| Mobile API | Web behavior |
|---|---|
| `switchTab` | Side-rail tab switch |
| `presentSheet` | Centered dialog layer |
| `presentModal` | Centered dialog layer (same family as sheets) |
| `push` / `pop` | Same stack semantics |

## C — Page layouts (desktop stage)

| Pattern | Width / arrangement | Used by |
|---|---|---|
| `L-shell` | 260px rail + main | Authenticated app |
| `L-chat-stage` | ~720px centered transcript + Composer dock | Conversation |
| `L-home` / `L-hub` | ~1120px; secondary 2-col ≥960px | Home, My Health |
| `L-document` | ~720–800px | Plan, content, About, details |
| `L-settings` | ~560–640px | Account tree, profiles |
| `L-onboarding` | ~560px | Welcome, Consent, HealthBasics steps |
| `L-form-flow` | ~560–720px; plan cards 2-col inside modal | Plans, booking, labs |
| `L-modal` | Centered dialog (~800px) over scrim — sheets **and** modal layers | Former sheets + Choose plan / Create account / Confirm labs / Policy |
| `L-master-detail` | List ~400px + detail pane ≥960px (`useWideSplit`) | Records (labs), Documents (uploads), Family profiles |

## Parity rule

Every F01–F11 flow must complete on Web with the same gates and content. Layout changes must not reorder steps or invent features.
