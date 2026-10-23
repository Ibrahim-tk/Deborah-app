# Web app

Status: **Phase 3 complete** — layouts + dialog chrome; smoke evidence in [ux/acceptance.md](ux/acceptance.md) (2026-10-22).

## Rules

- Do **not** edit `src/apps/mobile/**` for web work.
- Web never imports `@mobile`. Twins live under `src/apps/web`.
- Same flows, store, engine, scenarios, and Composer look as mobile.
- Only interaction mode changes: side rail, push + DerivedPage for former modal modules, sheets for short gates, mouse/keyboard.

## Guides

See [migration.md](migration.md) for component remap (A), navigation (B), and page layout patterns (C).

## What landed

- Full `@web` twin of `ui` / `patterns` / `screens` / `hooks` / `navigation`
- Full-bleed Web stage (no browser chrome frame)
- Persistent left rail; sheets as centered dialogs
- No purple / Wispr Flow gradients anywhere — plain canvas until a new backdrop lands
- Chat stage ~720px (Composer frozen)
- Home / My Health hub grids; document + settings columns
- Records / Documents wider lists
- Onboarding, plans, booking, family, labs, account subpages: centered form/document stages
- Choose Plan cards two-column on wide desktops
- Records master–detail ≥960px (labs / consultations in pane; notes / visit editors are push + DerivedPage; narrow still pushes)
- Documents master–detail ≥960px on My Uploads (upload + PDF preview are push + DerivedPage; narrow still pushes)
- Family profiles master–detail ≥960px (ManageProfiles → ProfileDetails in pane; Add member is push + DerivedPage)
- Shared `DetailHost` + `useWideSplit` + `styles/masterDetail.module.css`; toasts clear the left rail
- Shell `WebDeviceHost` wraps WebApp (BrowserFrame / full-bleed) so `useDevice()` works off the phone frame
- Former L-modal module screens → push + DerivedPage with Back; sheets remain for short gates; Shop M-2.7 and PolicyUpdate M-2.15 stay modal
- Dialog focus trap + `inert` on the stage while a sheet/modal is open
- FirstConsult uses the same ~720 chat stage as Conversation; Choose Plan is push + DerivedPage (2-col cards)
- Home header omits menu button (rail always visible)
- [`docs/xref.md`](../xref.md) web twin columns filled where screens exist

## QA

1. Open `/internal` → password `1234` → **Web** platform tab.
2. Load a returning scenario from State.
3. Check: rail · Home grid · Chat composer · Records/Documents/Family splits ≥960px · DerivedPage Back on former modals · short-gate sheets · Shop/PolicyUpdate modals · Choose Plan 2-col.
4. Full flow gates: [ux/acceptance.md](ux/acceptance.md).
