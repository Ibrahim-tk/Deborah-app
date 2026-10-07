# 01 · System architecture

## 1. Goals

| Goal | How the architecture serves it |
|---|---|
| Designer can iterate fast | Vite HMR, one component per folder, JSON-driven content, no backend to break |
| Feels like a real native AI app | iPhone emulator, native-style navigator with stacks/sheets/transitions, streaming mock AI |
| Every state is reachable on demand | Scenario system loads complete app states from the top navbar |
| Scales to dozens of screens and new libraries | Strict layers (ui → patterns → screens), adapters around third-party code, registries |
| Mobile and web evolve separately but stay traceable | Isolated app folders, mirrored domains, shared IDs, `@xref` headers, `docs/xref.md` |
| Easy hand-off to engineering later | Non-visual logic (types, engine, store) separated from UI; specs map 1:1 to files |

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Build / dev server | **Vite** | Instant HMR, zero-config CSS Modules, simple aliases |
| UI | **React 18** | Requested; huge ecosystem |
| Language | **TypeScript** (`strict: true`, pragmatic) | Typed JSON + store keeps a growing mock world consistent; Claude Code writes it, so cost to the designer is low |
| Styling | **Vanilla CSS**: global token files + **CSS Modules** per component | Requested "vanilla CSS"; Modules add scoping with zero runtime |
| App state | **Zustand** (+ `persist` middleware → localStorage) | Tiny API, slices, survives refresh, trivial to reset/seed |
| Shell routing | **React Router** (`/mobile`, `/web/*`) | Platform switch and deep links into the web app |
| Phone navigation | **Custom stack navigator** (Zustand + Motion) | Native semantics (per-tab stacks, sheets, modals) that URL routing cannot express inside an emulator |
| Motion | **Motion** (`motion/react`, formerly Framer Motion) behind an adapter | Native-feeling push/sheet/spring transitions |
| Icons | **Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`, stroke-rounded) behind an `Icon` adapter | Chosen in the design system; swap by editing one map |
| Lint boundaries | ESLint + `eslint-plugin-boundaries` (or `no-restricted-imports`) | Enforces mobile/web isolation automatically |

Any additional library (date picker, charts, toasts, carousel…) must enter through an adapter in the consuming app's `ui/` folder. See `08-component-system.md §4`.

## 3. Layered model

```
┌──────────────────────────── Browser ─────────────────────────────┐
│ SHELL  (src/shell)  — prototype chrome, never part of the product │
│  TopNav [Mobile|Web] [State ▾] [Reset] [Toggles]                  │
│  ┌──────────────── /mobile ───────────────┐ ┌──── /web/* ───────┐│
│  │ IPhoneFrame (393×852 pt, scaled)       │ │ BrowserFrame      ││
│  │  └ MobileApp (src/apps/mobile)         │ │  └ WebApp         ││
│  │     Navigator → screens → patterns → ui│ │   (src/apps/web)  ││
│  └────────────────────────────────────────┘ └───────────────────┘│
│                     ▲ reads/writes            ▲                   │
│ SHARED (src/shared) — NO UI                                        │
│  store (Zustand) ◄─ scenarios (seeds)                              │
│  engine (mock AI, guardrails, counting, memory, lab extraction)    │
│  data (JSON)  · types (TS)  · utils                                │
│ STYLES (src/styles) — reset, fonts, brand tokens (CSS variables)   │
└───────────────────────────────────────────────────────────────────┘
```

### Layer rules

| Layer | May import | Must not import |
|---|---|---|
| `shell` | `shared`, `styles`, app **entry points only** (`@mobile/MobileApp`, `@web/WebApp`) | App internals |
| `apps/mobile` | `shared`, `styles`, its own folders | `apps/web`, `shell` (except the `useDevice` hook exported from `@shell/device`) |
| `apps/web` | `shared`, `styles`, its own folders | `apps/mobile`, `shell` internals |
| `shared` | `shared` only | Anything React-visual, any `.css`, any app or shell |
| `styles` | nothing | — |

Within an app: `screens → patterns → ui`. Lower layers never import higher ones.

## 4. Data flow

```
JSON seed (scenario) ──loadScenario()──► Zustand store ──selectors──► screens
                                            ▲                     │
                                            │   actions           ▼
                         engine (pure TS) ◄─┴── user interaction (tap, type)
                                │
                                └─ timers simulate latency / streaming / delivery
```

- **Single source of truth:** the store. Screens never keep business state locally (UI-only state like "is this card expanded" stays local).
- **Engine is pure and UI-agnostic.** It receives the current store snapshot + user input and returns events (`message`, `intakeQuestion`, `answerSection`, `guardrail`, …). A thin hook in each app (`useConversation`) turns those events into store actions and timers. Mobile and web reuse the same engine, so both apps tell the same story.
- **Persistence:** the store persists to localStorage (key `yoc-proto-v1`). The navbar's **Reset** clears it and reloads the active scenario.

## 5. Key decisions and the reasoning

1. **Share data and logic, never components.** You asked for fully isolated apps. Components stay isolated; but duplicating mock data or the AI engine would make the two apps contradict each other within a week. Sharing the non-visual layer keeps one story, two presentations. *(Recommendation — reverse it only if you want the web app to be a completely different demo.)*
2. **Custom phone navigator instead of URL routes.** iOS apps have per-tab stacks, sheets with detents and full-screen modals. Nesting a second router inside the shell router is unsupported and fights these semantics. The navigator lives in the store, so scenarios can open the app on any screen and the state survives refresh.
3. **Scenarios, not screen jumps.** The navbar menu loads a whole consistent world (user, plan, profiles, history, pending notification) and lands on that scenario's natural start screen. This tests real states and avoids screens that can't exist (e.g. "lab answer" without labs).
4. **Many Figma "screens" are states of one screen.** The Conversation screen (M-2.1) owns empty, suggestions, intake, generating, answered, error and every safety interrupt. See `ux/00-ux-overview.md §3`.
5. **Emulator is device-accurate in points, scaled in pixels.** The app lays out at 393×852 CSS px (iPhone 15/16 points); the frame scales with `transform` to fit the viewport, so layouts are pixel-honest.
6. **Clinical content is flagged.** Every clinical string in JSON has a `status`. A shell toggle highlights placeholder content during reviews so nobody mistakes demo copy for approved advice.

## 6. Non-functional targets (prototype)

- Cold start < 1.5 s on a laptop; route/screen transition 250–350 ms; no layout shift inside the phone.
- Works in latest Chrome, Safari, Edge at viewports ≥ 1280×720. Phone frame scales down to fit 720 px height.
- Accessibility baseline: focus-visible styles, real `<button>`/`<input>` elements, labels, `prefers-reduced-motion` respected, contrast ≥ 4.5:1 (design system will set exact values).
- No network requests at runtime except fonts (self-host fonts in `public/fonts` once the design system is set).

## 7. Future path (not now)

When engineering takes over: replace `src/shared/engine` adapters with API clients, keep types and stores; React Native port would re-implement `apps/mobile` UI using the same specs and IDs.
