# 09 · Styling (vanilla CSS)

## 1. Approach

- **Plain CSS** only. Global files in `src/styles`, per-app semantic tokens in `apps/<app>/styles`, component styles in **CSS Modules** next to the component (`Button.module.css`). Vite handles Modules natively — no PostCSS plugins required.
- **No Tailwind, no CSS-in-JS, no inline styles** (exception: dynamic numeric values like `style={{ '--progress': 0.6 }}` setting a custom property).
- Components reference **variables only** — never raw hex, px font sizes or magic spacing. This is what lets the design system (next step) re-skin everything by editing token files.

## 2. Token layers

```
src/styles/tokens.primitives.css      raw brand values (shared by both apps)
   --purple-700: #613977;  --gold-400: #e6c776;  --pink-500: #cd497f;   (from brief, provisional)
   --space-1: 4px … --space-12: 48px;   --radius-sm/md/lg/xl/full;   --font-display / --font-body
        ▼ referenced by
apps/mobile/styles/mobile.tokens.css  semantic tokens for the phone
   --color-bg, --color-surface, --color-surface-raised, --color-text, --color-text-muted,
   --color-accent, --color-on-accent, --color-border, --color-danger, --color-scrim,
   --text-xs … --text-2xl, --leading-*, --tap-min: 44px, --header-h: 52px, --tabbar-h: 83px
apps/web/styles/web.tokens.css        semantic tokens for desktop (own scale)
        ▼ used by
Component.module.css                  .root { background: var(--color-surface); padding: var(--space-4); }
```

Real values now live in `design-tokens/` (see `12-design-system.md`). Use them from the start — no neutral-grey phase needed.

## 3. CSS Module conventions

```css
/* Button.module.css */
.root { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
        min-height: var(--tap-min); padding: 0 var(--space-5); border-radius: var(--radius-full);
        font: var(--weight-semibold) var(--text-md)/1 var(--font-body); transition: transform var(--dur-fast) var(--ease-out); }
.root:active { transform: scale(0.98); }
.root:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
.primary { background: var(--color-accent); color: var(--color-on-accent); }
.secondary { background: transparent; color: var(--color-text); box-shadow: inset 0 0 0 1px var(--color-border); }
.fullWidth { width: 100%; }
.root[aria-disabled='true'] { opacity: .45; pointer-events: none; }
```

- Class names camelCase; combine with a tiny `cx()` util in `shared/utils` (no `classnames` dependency needed).
- Variants = classes; states = attributes (`[data-state='open']`, `[aria-selected='true']`).
- No global selectors inside modules except `:global(.reduced-motion)` hooks.
- Layout with flex/grid and `gap`; avoid margins on reusable components (parents control spacing).

## 4. Phone-specific rules

- Root of the phone screen area sets `font-size: 16px` and uses `--safe-top/--safe-bottom` paddings provided by the emulator.
- Use `dvh`-free sizing: the phone is a fixed 393×852 box; screens use `height: 100%` and inner scroll areas (`overflow-y: auto; overscroll-behavior: contain`).
- Hide scrollbars inside the phone (`scrollbar-width: none` + `::-webkit-scrollbar { display:none }`).
- Minimum tap target 44×44; body text ≥ 16 px; secondary text ≥ 13 px (audience).

## 5. Motion

`src/styles/motion.css` defines `--ease-ios: cubic-bezier(0.32, 0.72, 0, 1)`, `--ease-out`, `--dur-fast: 120ms`, `--dur-base: 240ms`, `--dur-slow: 380ms`. JS-driven motion (Motion library) reads the same values from a `transitions.ts` constants file. All motion respects `prefers-reduced-motion` and the shell toggle (adds `.reduced-motion` on `<html>`).

## 6. Fonts

Decided in `DESIGN.md`: EB Garamond (all reading text, 400/500 + italic), Cormorant Garamond (display, 400 + italic), SF Pro via the system stack for `caption` and `data` only. Self-host the serif families in `public/fonts` (`design-tokens/fonts.css`); no runtime Google Fonts requests. Exact sizes, line heights and the `--type-scale` multiplier are in `design-tokens/mobile.tokens.css`.
