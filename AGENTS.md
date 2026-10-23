# Agent surface policy

## Default = internal

Unless the user explicitly says **production**, **client**, or **update the main page**, treat all work as **internal**:

- Routes under `/internal` (Profile, Web, Design System, Widget Library)
- Prototype shell tooling (TopNav, journeys, scenarios, toggles)
- Live Version 2 product code in `src/` while verifying on `/internal`

The internal page is password-gated (prototype password `1234`, in-memory only — re-locks on every refresh). That gate is not real authentication.

## Production / client — only on command

The client pages are `/` (phone: `ClientApp` → `ClientShell`) and `/web` (desktop: `ClientWebApp` → `ClientWebShell`). Both use `ClientTopNav` (Home / Chat / Reset). Internal tooling stays under `/internal` (password gate); `/internal/web` still shows the web twin with prototype TopNav.

Do **not** change these unless the user explicitly asks for production/client/main-page work:

- `src/ClientApp.tsx`
- `src/shell/ClientShell/`
- `src/shell/nav/ClientTopNav/`

Until a frozen `versions/client` snapshot exists (Phase 5, on request), edits under `src/apps/mobile` still affect both `/` and `/internal`. Prefer validating product changes on `/internal`; only adjust client chrome when asked.

## Frozen Version 1

Do not edit `versions/v1/` unless the user explicitly requests a Version 1 fix. See `versions/v1/AGENTS.md` and `VERSIONS.md`.
