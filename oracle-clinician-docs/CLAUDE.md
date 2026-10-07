# CLAUDE.md — Your Oracle Clinician (Rapid Prototype)

You are building a **browser-based, high-fidelity, frontend-only prototype** of *Your Oracle Clinician* ("Deborah in Your Pocket"), an AI-native health-education app by Deborah Maragopoulos FNP. A designer owns this repo. Optimise for speed of iteration, clarity of structure, and visual polish — not for production concerns.

Read `docs/README.md` first. It indexes every spec. Never guess behaviour that a spec defines.

**Visual design:** `DESIGN.md` (tokens + rules) and `PRODUCT.md` (product context) at the root are the authority for every visual decision. If a UX spec conflicts with DESIGN.md on visuals, DESIGN.md wins. If the Impeccable skill is installed (`npx skills add pbakaus/impeccable`), it reads both files automatically.

## Non-negotiables

1. **No backend, ever.** No `fetch` to real services, no API keys, no auth providers, no payment SDKs. All data comes from JSON in `src/shared/data` and is mutated in the client store. Everything that "talks to a server" is simulated with timers (see `docs/07-ai-simulation.md`).
2. **React + Vite + TypeScript, running in the browser.** Not React Native, not Next.js.
3. **Vanilla CSS only.** Plain `.css` files: global tokens in `src/styles`, component styles as CSS Modules (`Component.module.css`). No Tailwind, no CSS-in-JS, no inline `style={{}}` except for truly dynamic values (e.g. a progress width).
4. **Mobile and web apps are isolated.** `src/apps/mobile` and `src/apps/web` never import from each other. Both may import from `src/shared` (non-visual: types, data, engine, store) and `src/styles` (tokens). They are linked by **matching IDs, mirrored folder names and `@xref` headers**, not by shared components. See `docs/08-component-system.md`.
5. **Every screen has an ID** (`M-2.1` mobile, `W-2.1` web) that matches the Figma wireframes and `docs/ux/*.md`. Put the header block from `docs/10-conventions.md` at the top of every screen file.
6. **States, not screens, in the prototype navbar.** The top navbar switches *platform* (Mobile / Web) and loads *scenarios* (app states). Users move between screens only by using the prototype itself.
7. **Third-party libraries are always wrapped.** Icons, animation, date pickers, etc. are consumed through a local adapter in each app's `ui/` layer so they can be swapped in one file.
8. **Design-system bans:** no font weight above 500; no pills, tags, badges or chips (use option rows and plain text); no wave, ripple, shimmer, bounce or pulse animations; no shadows on non-floating elements; all readable text ≥ 7:1.
9. **Clinical copy is placeholder.** Any medical/clinical text in JSON carries `"status": "placeholder"` unless Deborah has approved it. Never invent dosing, diagnoses or prescriptions. Safety behaviours (emergency, medication, crisis, out-of-scope) must always work exactly as specified.

## Where things live (short version)

```
src/shell      prototype chrome: top navbar, iPhone emulator, browser frame, dev toggles
src/shared     NON-VISUAL: types, JSON data, scenarios, mock AI engine, store
src/apps/mobile  the phone app (ui → patterns → screens), own navigator
src/apps/web     the desktop web app (same skeleton, isolated)
src/styles     reset, fonts, brand tokens (design system lands here)
docs/          all specs — architecture, UX flows, conventions, build plan
```

## Working rules for Claude Code

- Before building a screen, open its spec in `docs/ux/` and its flow's Figma link. Build every listed state and interaction; tick its acceptance criteria.
- Build bottom-up: `ui` primitive → `pattern` → `screen`. Reuse before creating. If a primitive is missing, create it in the app's own `ui/`.
- Keep files small (< ~200 lines). Split when a component grows.
- One component per folder: `Name/Name.tsx`, `Name/Name.module.css`, `Name/index.ts`.
- Use path aliases (`@shared`, `@mobile`, `@web`, `@shell`, `@styles`). No deep relative imports across layers.
- When you add a screen, register it in the app's screen registry and add a row to `docs/xref.md`.
- When a spec is ambiguous, implement the documented default and leave a `// OPEN:` comment that quotes the open question. Do not silently invent product decisions.
- After each feature: run `npm run lint` and `npm run typecheck`; fix boundary violations immediately.
