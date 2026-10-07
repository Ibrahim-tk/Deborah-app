# 11 · Build plan

Build in phases; each phase ends with something clickable end-to-end. The design system is ready: copy `design-tokens/` in phase 0 and style with real tokens from the start. Phase 7 is the polish pass against DESIGN.md.

| Phase | Scope | Done when |
|---|---|---|
| **0 · Scaffold** | Vite + React + TS, aliases, ESLint boundaries, CSS reset/tokens, folder skeleton for shell/shared/mobile/web, `CLAUDE.md` + docs copied in | `npm run dev` shows empty shell; lint fails on a deliberate cross-app import |
| **1 · Shell** | TopNav, PlatformTabs, StateMenu (reads scenario catalogue), Reset, Toggles, IPhoneFrame with status bar, island, home indicator, scaling, screen caption, BrowserFrame placeholder | Phone frame scales on resize; menus work; web tab shows placeholder |
| **2 · Foundations** | Store slices + persist + `loadScenario`; navigator (stacks, tabs, sheets, modals, transitions); registry; `ui` primitives (§2 of 08) | A dummy screen can push/pop, open a sheet and a modal; scenarios switch state |
| **3 · Onboarding + Conversation core** | M-1.1–1.3; M-2.1 all non-safety states; engine: classifier, intake, streaming, answer, counting; M-2.7, M-2.8 | S01→onboarding→first answer works with streaming, counter decreases |
| **4 · Safety** | All F03 patterns + guardrail precedence; S13 test bench | Every guardrail phrase produces the specified UI; none count or gate |
| **5 · Conversion + return** | F04 modal stack; lock screen, notifications, deep links; F05 labs | S06 and S07 run end to end |
| **6 · Profiles, My Health, records, booking, account** | F06, F07, F08, F09, F10 | All scenarios S01–S13 load and every screen in `xref.md` is reachable |
| **7 · Design polish** | Every component state per DESIGN.md › Components; motion per DESIGN.md › Motion; run Impeccable `audit` and `polish` | All contrast pairs verified; no banned patterns; text size Largest survives |
| **8 · Polish & QA** | Empty/long-content checks, a11y toggle checks, reduced motion, copy flags review | Checklist in each spec ticked |
| **9 · Web app** | After a web spec exists | — |

## Definition of done (per screen)

1. Matches its spec: layout order, components, every state, every interaction.
2. Reachable through the prototype (no dead ends; back always works).
3. Works in at least one scenario; scenario listed in spec.
4. Header block + registry + xref row present.
5. No hard-coded data strings; placeholder content flagged.
6. Tap targets ≥ 44 px; focus-visible; reduced motion OK.

## Ready-made prompts for Claude Code

**Phase 0**
> Read CLAUDE.md and docs/README.md, 01, 02, 09, 10. Scaffold the project exactly as in 02-folder-structure.md with Vite + React 18 + TypeScript, path aliases, ESLint boundary rules, and copy design-tokens/ into src/styles and src/apps/mobile/styles as described in docs/12-design-system.md. Read DESIGN.md. Create empty index files so every folder exists. Don't build features yet.

**Phase 1**
> Implement the prototype shell from docs/03-prototype-shell.md: TopNav with Mobile/Web tabs, StateMenu (groups: Scenarios, Simulate events, Device), Reset, Toggles, and the iPhone emulator at 393×852 with scale-to-fit, status bar with live clock, Dynamic Island, home indicator and the screen caption. Use neutral shell styling. Web tab shows the placeholder.

**Phase 2**
> Implement the store (docs/05), loadScenario with S01 and S02 seeds, the mobile navigator and registry (docs/04) and all ui primitives listed in docs/08 §2 with CSS Modules. Add a temporary demo screen to prove push/sheet/modal transitions, then delete it.

**Phase 3**
> Build F01 and F02 from docs/ux/F01-onboarding.md and docs/ux/F02-consultation.md, and the engine from docs/07-ai-simulation.md (classifier without safety for now, intake, streaming, answer, counting). Create the scripts hot-flashes-sleep, sleep-3am, thyroid-fatigue and generic as placeholder JSON. Tick every acceptance criterion.

(Continue the same pattern per phase, always naming the spec files.)
