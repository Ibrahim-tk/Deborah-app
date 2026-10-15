# Flow versions

## Version 1 — preserved

The original flow is saved in Git tag **flow-v1**, pointing to commit **1fc10df** on branch **new-design-system**. That is the exact checkpoint before version navigation was added.

The runnable snapshot is `versions/v1/src`. It contains its own screens, widgets, engine, data, scenarios, store and styles. Its import aliases are namespaced to `@flow-v1` so changes to the editable code cannot silently affect the saved engine or components.

`versions/v1/manifest.json` guards the snapshot. Do not edit or regenerate it for Version 2 work.

## Version 2 — editable copy

The main `src` tree is now Version 2. It begins with the same flow and behavior as Version 1. No new question-engine rules or interaction steps have been introduced for Version 2 yet; those await the user's next specification.

- Question engine: `src/shared/engine/`.
- Question content and flow data: `src/shared/data/conversation/`.
- Screens: `src/apps/mobile/screens/`.
- Widget interactions: `src/apps/mobile/patterns/`.
- Version 2 application routes: `src/FlowV2App.tsx`.
- Version loader and query preservation: `src/App.tsx`.
- Top-nav buttons: `src/shell/nav/FlowVersionSwitch/`.

## Opening and switching

- Version 1: `/mobile?flow=v1` (the default for old links).
- Version 2: `/mobile?flow=v2`.
- Same seed in either version: `/mobile?flow=v1&scenario=S22` or `/mobile?flow=v2&scenario=S22`.
- Widget lab also supports `/wid?flow=v1` and `/wid?flow=v2`.

The top-nav buttons switch the whole document, preserving the current route and scenario selection. Each switch starts the scenario fresh and cancels the old page's timers. In-progress conversations are intentionally not migrated between versions. Platform links retain the selected version. Only the chosen version's source tree and styles are loaded.

The variants share dependency packages and static public fonts/brand assets. Development toolbar preferences may also use the same local browser keys. Clinical state and question engines are separate.

## Checks

```sh
npm run test:journeys  # Editable Version 2 contracts
npm run test:versions # Version 1 integrity, routing helpers, and saved-flow contracts
npm run lint
npm run build         # Builds both selectable versions
```

Add or update Version 2 behavior/tests when the new engine specification arrives. Leave the frozen Version 1 tests and source unchanged.
