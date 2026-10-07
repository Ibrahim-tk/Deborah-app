# 12 · Design system — implementation guide (mobile)

The design system itself lives in **`/DESIGN.md`** (Impeccable / DESIGN.md format) with product context in **`/PRODUCT.md`**. This file explains how to wire it into the codebase. If anything in `docs/ux/*` conflicts with `DESIGN.md` on visual matters, **DESIGN.md wins**.

## 1. Files to copy into the project

| From this bundle | To | Purpose |
|---|---|---|
| `design-tokens/tokens.primitives.css` | `src/styles/tokens.primitives.css` | Brand ramps, semantic additions, families, spacing, radius, motion |
| `design-tokens/fonts.css` | `src/styles/fonts.css` | Self-hosted EB Garamond + Cormorant Garamond |
| `design-tokens/mobile.tokens.css` | `src/apps/mobile/styles/mobile.tokens.css` | Semantic tokens, type scale with `--type-scale`, role classes |
| `DESIGN.md`, `PRODUCT.md`, `.impeccable/design.json` | project root | Read by Claude Code and the Impeccable skill |

Put `class="phone-root"` on the root element of `MobileApp` inside the emulator. Set `--type-scale` on it from `settings.textSize` (0.9 / 1 / 1.15 / 1.3).

## 2. Decisions captured (from the design quiz, 7 Oct 2026)

| Topic | Decision |
|---|---|
| Canvas / text | Gold-50 #fdf9f1 / Purple-900 #291832 (15.7:1) |
| Primary action | Purple-500 fill, white text (8.9:1), fully rounded, 56 pt |
| Gold | Deborah signature moments, selected states on dark surfaces, plan highlights |
| Pink | Deborah's personal accent only (pink-700 as text) |
| Semantic colours | Added muted red, green and amber, all ≥ 7:1 |
| Dark mode | Not in v1 |
| Fonts | EB Garamond for all reading text, sized up; Cormorant for display; SF Pro only for 13 pt labels and numbers |
| Body size | 19 px / 30 px |
| Weights | 400 everywhere; 500 only on buttons, answer section titles, selected options, list row titles |
| Text size | In-app control (0.9–1.3×); native build also follows iOS Dynamic Type |
| Shape | 16 cards, fully rounded buttons, 24 sheets and composer |
| Chat | Deborah unboxed full-width; user in lilac bubbles |
| Depth | Flat tonal layers; shadows only on floating elements |
| Composer | Solid, softly lifted surface |
| AI features | Source list, progress status, copy, thumbs, read aloud, attach labs, voice dictation. **Not included:** regenerate, edit message, branch |
| Streaming | Word-by-word fade-in, no caret |
| Deborah | Real photo, circle, gold ring (OPEN: photography) |
| Icons | Hugeicons, stroke-rounded |
| Motion | Calm iOS standard, no bounce |
| Tab bar | Floating, fully rounded, labels always visible |
| Spacing | 20 pt margins, roomy lists, 48 pt targets |
| Feel | Warm, calm, trustworthy, elegant, clinical, feminine, modern |
| Bans | No waves, pills, tags, badges or chips |

## 3. How "no pills or tags" is interpreted

- **Banned:** capsule-shaped labels and statuses (Most popular, New, Premium, trial counter, "In progress"), chip clouds for suggestions, intake answers, quick replies and filters, citation chips.
- **Replaced by:** plain text labels; full-width **option rows** (or a 2-column grid of rounded-rectangle options); a Segmented control for filters; a source list for citations.
- **Still fully rounded (explicit quiz choices):** buttons, the floating tab bar, avatars, iOS toggle switches.

## 4. How "no waves" is interpreted

No audio waveforms, wave-like or bouncing loaders, typing dots, ripples, shimmering skeletons, pulsing indicators or decorative wavy shapes/dividers. Loading uses a small rotating ring plus changing status text; skeletons are static.

## 5. Component skin checklist (apply in phase 7)

For every primitive in `08-component-system.md §2`, implement: default · pressed · focus-visible · selected (if applicable) · loading · error · disabled (avoid where possible) — exactly as specified in `DESIGN.md › Components`. Verify contrast for each state with the pairs listed in `DESIGN.md › Colors`.

## 6. Web

Desktop web will get its own `DESIGN.web.md` later. Do not reuse mobile token files for web.
