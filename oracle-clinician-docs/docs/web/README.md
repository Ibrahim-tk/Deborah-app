# Web app — reserved

Status: **not specified yet.** The web app will be designed after the mobile prototype is complete.

What already exists:
- Folder `src/apps/web` with the same skeleton as mobile (navigation, styles, ui, patterns, screens, hooks), isolated by lint rules.
- Shell route `/web/*` rendering `WebApp` inside `BrowserFrame` with a placeholder page.
- Shared non-visual layer (`src/shared`): the same store, scenarios and AI engine will power the web app, so both platforms tell the same story.

When the web spec is written:
1. Add `docs/web/ux/*.md` using the same flow numbers (W-2.1 ↔ M-2.1).
2. Add web scenarios to the State menu (or reuse mobile ones where meaningful).
3. Build web `ui` primitives from scratch for desktop (hover, keyboard, wider layouts). **Do not import mobile components**; reference them via `docs/xref.md`.
