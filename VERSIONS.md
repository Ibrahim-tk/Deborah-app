# Flow versions and surfaces

## Surfaces

| Surface | URL | What you get |
| --- | --- | --- |
| **Client (production demo)** | `/` | Version 2 phone only. Brand + Home / Chat / Reset. No version switch or design tools. |
| **Internal tools** | `/internal/…` | Full prototype chrome. Password-gated (`1234`, in-memory — re-locks every refresh). Not real auth. |

Internal paths:

- Profile (mobile): `/internal/mobile?flow=v2`
- Web: `/internal/web?flow=v2`
- Design system: `/internal/design-system?flow=v2`
- Widget Library: `/internal/wid?flow=v2`

Legacy bare paths (`/mobile`, `/web`, `/wid`, `/design-system`) redirect into `/internal/…` and preserve query + hash.

## Version 1 — preserved

The original flow is saved in Git tag **flow-v1**, pointing to commit **1fc10df** on branch **new-design-system**. That is the exact checkpoint before version navigation was added.

The runnable snapshot is `versions/v1/src`. It contains its own screens, widgets, engine, data, scenarios, store and styles. Its import aliases are namespaced to `@flow-v1` so changes to the editable code cannot silently affect the saved engine or components.

`versions/v1/manifest.json` guards the snapshot. Do not edit or regenerate it for Version 2 work.

Version 1 is available **only on internal**: `/internal/mobile?flow=v1`. The client page never mounts it.

## Version 2 — editable copy

The main `src` tree is Version 2. HealthBasics (M-1.8) follows the age × gender intake PDF: after birth year and gender, `showIf` branches ask reproductive status, puberty, child basics, and medications (including Genesis Gold). Version 1 keeps the shorter age + sex-at-birth form.

- Question engine: `src/shared/engine/`.
- Onboarding steps: `src/shared/data/intake/healthBasics.json`.
- Question content and flow data: `src/shared/data/conversation/`.
- Screens: `src/apps/mobile/screens/`.
- Widget interactions: `src/apps/mobile/patterns/`.
- Client routes: `src/ClientApp.tsx` + `src/shell/ClientShell/`.
- Internal routes: `src/InternalApp.tsx` (v2) and `src/InternalV1App.tsx` (v1 under `/internal` without editing the frozen v1 App).
- Version loader + gate: `src/App.tsx`, `src/shell/InternalGate/`.
- Top-nav version buttons (internal only): `src/shell/nav/FlowVersionSwitch/`.

## Opening and switching

- Client: `/` (always Version 2).
- Internal Version 2: `/internal/mobile?flow=v2` (also the default once `flow` is normalized on internal).
- Internal Version 1: `/internal/mobile?flow=v1`.
- Same seed in either version: `/internal/mobile?flow=v1&scenario=S22` or `/internal/mobile?flow=v2&scenario=S22`.
- Widget lab: `/internal/wid?flow=v1` or `/internal/wid?flow=v2`.

On internal, the top-nav version buttons switch the whole document, preserving the current route and scenario selection. Each switch starts the scenario fresh and cancels the old page's timers. In-progress conversations are intentionally not migrated between versions. Platform links retain the selected version. Only the chosen version's source tree and styles are loaded.

The variants share dependency packages and static public fonts/brand assets. Development toolbar preferences may also use the same local browser keys. Clinical state and question engines are separate.

## Agent policy

See root [`AGENTS.md`](AGENTS.md): default work is **internal**; touch the client/`/` chrome only when the user says production, client, or update the main page.

**Phase 5 (not shipped):** a hard frozen client snapshot at `versions/client` can be added later on explicit request, so `/` mounts a promote-only tree while `/internal` keeps editing `src/`.

## Checks

```sh
npm run test:journeys  # Editable Version 2 contracts
npm run test:versions # Version 1 integrity, routing helpers, and saved-flow contracts
npm run lint
npm run build         # Builds both selectable versions
```

Add or update Version 2 behavior/tests when the new engine specification arrives. Leave the frozen Version 1 tests and source unchanged.
