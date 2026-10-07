# 10 · Conventions and templates

## 1. Naming

| Thing | Convention | Example |
|---|---|---|
| Screen ID | `M-<flow>.<n>` / `W-<flow>.<n>` | `M-2.1`, `M-9.4` |
| Screen component | PascalCase noun describing the screen | `Conversation`, `ChoosePlan` |
| Pattern / primitive | PascalCase | `AnswerSections`, `Button` |
| Folder | Same as component | `screens/consultation/Conversation/` |
| CSS Module | `<Component>.module.css` | `Conversation.module.css` |
| Hook | `useX` camelCase | `useConversation` |
| Store slice | camelCase noun | `subscription` |
| JSON data | kebab-case file names, camelCase keys | `best-tips.json` |
| Scenario | `S<nn>-kebab-label.json` | `S06-trial-exhausted.json` |
| CSS custom property | `--group-name-variant` | `--color-text-muted` |

## 2. Component folder template

```
Conversation/
├── Conversation.tsx
├── Conversation.module.css
├── index.ts                  // export { Conversation as default } for screens; named export for patterns/ui
└── parts/                    // optional: private sub-components used only here
```

## 3. Header blocks (required)

Screen file:
```tsx
/**
 * @screen  M-2.1 · Conversation
 * @flow    F02 Core consultation (also hosts F03 safety states, F05 check-in, F06 profile chat)
 * @states  empty · focused · intake · ready · generating · answered · error · safety · checkin
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
 * @spec    docs/ux/F02-consultation.md#m-21-conversation
 * @xref    web: W-2.1 (apps/web/screens/consultation/Conversation) — not built
 */
```

Pattern / primitive file:
```tsx
/**
 * @pattern AnswerSections — 7-section Deborah answer, fixed order, product slot in §6
 * @usedBy  M-2.1, M-9.2
 * @spec    docs/ux/F02-consultation.md#answer-sections
 * @xref    web: apps/web/patterns/chat/AnswerSections — not built
 */
```

## 4. Checklists

### Adding a screen
- [ ] Spec exists in `docs/ux/` (if not, write the spec section first).
- [ ] Folder under the right domain; header block filled.
- [ ] Registered in `navigation/registry.ts` with correct presentation.
- [ ] All states listed in the spec implemented and reachable (by interaction or scenario).
- [ ] Row added/updated in `docs/xref.md`.
- [ ] Acceptance criteria ticked; lint + typecheck pass.

### Adding a scenario
- [ ] JSON in `shared/scenarios`, entry in `index.ts` with user-facing label + description.
- [ ] Loads without errors from the State menu and via `?scenario=`.
- [ ] Listed in `05-state-and-scenarios.md §3`.

### Adding a third-party library
- [ ] Install; wrap in `ui/<Adapter>`; no other file imports it.
- [ ] Note it in `01-architecture.md §2` (one line: what and why).

## 5. Code style

- Function components + hooks; no classes.
- Props interfaces named `<Component>Props`; destructure with defaults.
- Keep JSX readable: extract when a block exceeds ~40 lines.
- No business logic in JSX — compute in hooks/selectors.
- Comments explain *why*; `// OPEN:` for pending product decisions; `// ASSUMPTION:` for design defaults.
- Prettier defaults (2 spaces, single quotes, trailing commas).

## 6. Pointing Claude Code at a component

Use the screen caption ID from the shell (click to copy) or the `@pattern` name:
> "On M-7.2, the `PlanProgressCard` feels heavy. Make it a single line with a thin progress bar. Keep the spec's tap behaviour."
