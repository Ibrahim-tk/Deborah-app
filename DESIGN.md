---
name: Your Oracle Clinician
description: Deborah Maragopoulos FNP's clinical voice, in a calm, legible iPhone app for women navigating hormonal health
updated: "2026-11-02 — re-derived from the shipped code (tokens + refresh + Deborah skin, as loaded in MobileApp.tsx / WebApp.tsx)"
colors:
  canvas: "#f9f7f0"
  surface: "#fbf8fa"
  surface-glass: "#ffffffb0"
  surface-tonal: "#f0ebe6"
  surface-lilac: "#eadeef"
  surface-signature: "#2e193c"
  ink: "#302335"
  ink-body: "#4d3d54"
  ink-secondary: "#54455a"
  ink-placeholder: "#a394aa"
  ink-on-accent: "#ffffff"
  ink-on-signature: "#efdfed"
  accent: "#3a0353"
  accent-pressed: "#2e0242"
  accent-tint: "#eee2f3"
  accent-tint-pressed: "#e3c9eb"
  focus: "#b579c4"
  mauve: "#804a8a"
  border-hairline: "#e8e1e6"
  border-control: "#e0d2e5"
  border-selected: "#804a8a"
  stroke-card: "rgb(67 36 57 / 0.08)"
  gold: "#e6c776"
  gold-ink: "#615432"
  danger-ink: "#862323"
  danger-tint: "#fbeae7"
  danger-border: "#a3302a"
  success-ink: "#245a37"
  success-tint: "#e8f2ea"
  warning-ink: "#6a4200"
  warning-tint: "#fbefd6"
  scrim: "#321e4044"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: "42px"
    letterSpacing: "-0.01em"
  title-1:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "-0.005em"
  title-2:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: "32px"
    letterSpacing: "0"
  title-3:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: "25px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: "22px"
    letterSpacing: "-0.015em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "-0.015em"
  callout:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "21px"
    letterSpacing: "-0.015em"
  button:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: "22px"
    letterSpacing: "-0.015em"
  subhead:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "-0.015em"
  footnote:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "-0.015em"
  caption:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0"
  data:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "-0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  card-sm: "19px"
  xl: "24px"
  card: "30px"
  home: "32px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink-on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-primary-pressed:
    backgroundColor: "{colors.accent-pressed}"
  button-secondary:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  option-row:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.callout}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
    height: "56px"
  option-row-selected:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
  choice-pill:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.subhead}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-tonal}"
    rounded: "{rounded.card}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.callout}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "48px"
  composer:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "12px 12px 12px 20px"
  user-bubble:
    backgroundColor: "{colors.surface-lilac}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
---

# DESIGN.md

The design system of the Your Oracle Clinician mobile app, written down — every token, rule and component as the code actually has it.

This file describes what the code does, not what it aspires to. Every value below is lifted from the source, and the source wins any disagreement:

| Source of truth | What lives there |
|---|---|
| `src/styles/tokens.primitives.css` | Brand ramps, spacing, radius, motion, the card stroke |
| `src/apps/mobile/styles/mobile.tokens.css` | Semantic roles, type scale, layout, elevation, card and Home tones |
| `src/apps/mobile/styles/mobile.refresh.css` | Glass surfaces, field and button recipes |
| `src/apps/mobile/styles/mobile.skin.deborah.css` | The Deborah skin — loaded last, so its values win |
| `src/apps/mobile/styles/mobile.theme.fig.css` | The optional Fig colour theme |
| `src/apps/mobile/ui/` · `patterns/` | The components, mirrored in `src/apps/web/` |
| `/internal/design-system` | The live showcase — every component, rendered |

**Stack.** React · Vite · TypeScript · vanilla CSS Modules (no Tailwind, no CSS-in-JS) · Hugeicons through the `ui/Icon` adapter · Cormorant Garamond self-hosted · DM Sans via `@fontsource`.

## 1. Visual theme and atmosphere

**"The Consulting Room at Dusk."** Sitting across from Deborah in a quiet, warm room in the early evening: soft cream light, deep plum ink, a few precious gold details, and nothing on the desk that doesn't need to be there. It is a reading-and-listening experience first. Deborah's words are the interface; everything around them recedes.

- **Plum on cream.** One action colour, Deborah Plum (`#3a0353`), on a cream canvas (`#f9f7f0`) washed with a purple photograph across the top fifth of the screen.
- **Deborah's words are the hero.** Her answers run unboxed and full-width; chrome concedes to them.
- **Colour fields, then glass.** Cards separate by soft tonal fills; tappable surfaces are frosted glass. Real shadows only on things that float.
- **A literary accent.** Cormorant Garamond for display moments; DM Sans for everything people read and tap.
- **Operate on iOS.** Users are in a task, so familiarity beats novelty: iOS structure and gestures are kept, the brand lives in type, colour and space.

## 2. Colour palette and roles

Reach for semantic tokens first. The ramps underneath exist to build them. Components read only `--color-*`, `--surface-*`, `--card-tone-*` and `--home-tone-*` — never a ramp step or a raw hex.

### 2.1 Surfaces

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#f9f7f0` | Behind every screen, under the backdrop photo |
| `--color-surface` | `#fbf8fa` | Sheets and solid surfaces |
| `--surface-1` | `#ffffffb0` | Glass — option rows, pills, inputs, tiles |
| `--color-surface-tonal` | `#f0ebe6` | Cream tonal panels |
| `--color-surface-lilac` | `#eadeef` | User bubbles |
| `--color-surface-signature` | `#2e193c` | The rare dark quiet-moment card |
| `--color-scrim` | `#321e4044` | Behind sheets and modals |

### 2.2 Text

| Token | Value | Role |
|---|---|---|
| `--color-ink` | `#302335` | Headings, primary text, icons |
| `--color-ink-body` | `#4d3d54` | Reading prose — the most-used text colour |
| `--color-ink-secondary` | `#54455a` | Secondary text, subtitles, metadata |
| `--color-ink-placeholder` | `#a394aa` | Placeholders only (below 7:1 by design) |
| `--color-ink-on-accent` | `#ffffff` | Label on a plum fill |
| `--color-gold-ink` | `#615432` | Gold as text — answer numerals |

### 2.3 Action and borders

| Token | Value | Role |
|---|---|---|
| `--color-accent` | `#3a0353` | Primary buttons, links, card arrows |
| `--color-accent-pressed` | `#2e0242` | Pressed primary |
| `--color-accent-tint` | `#eee2f3` | Secondary buttons, selected fill |
| `--color-focus` | `#b579c4` | Focus ring, 3 px at a 4 px offset |
| `--color-border-selected` | `#804a8a` | Mauve — selected outlines |
| `--color-border-control` | `#e0d2e5` | Field and option edges |
| `--color-border-hairline` | `#e8e1e6` | Dividers inside dense lists |
| `--stroke-card` | `rgb(67 36 57 / 0.08)` | The one outline for white cards, tiles, rows and pills |

### 2.4 Card and Home tones

Whisper tints: just enough colour to tell cards apart, never enough to compete with text.

| Token | Value | Role |
|---|---|---|
| `--card-tone-lilac` | `#eae3ef` | Tonal card |
| `--card-tone-linen` | `#f0ebe6` | Tonal card |
| `--card-tone-rose` | `#f4e3e6` | Tonal card |
| `--home-tone-sky` | `#e4e8fb` | Home labs card |
| `--home-tone-rose` | `#fde8e6` | Home habits card |
| `--home-tone-hero` | `#ebe4f7` → `#c4b3e0` | Home continue card — the one gradient |

### 2.5 Brand ramps

Four ramps of ten steps in `tokens.primitives.css`. The Deborah skin re-points purple:

| Step | Value | Use |
|---|---|---|
| purple-50 | `#efe1f2` | Selected tint |
| purple-100 | `#e0d2e6` | Lavender border |
| purple-300 | `#a394aa` | Placeholder |
| purple-400 | `#804a8a` | Mauve |
| purple-500 | `#3a0353` | Plum — action |
| purple-600 | `#2e0242` | Pressed |
| purple-700 | `#4d3d54` | Body prose |
| purple-900 | `#302335` | Ink |
| gold-500 | `#e6c776` | Signature Gold — Deborah only |
| gold-900 | `#615432` | Gold Ink |

### 2.6 Semantic

| Role | Ink | Tint |
|---|---|---|
| Danger / emergency | `#862323` | `#fbeae7` |
| Success | `#245a37` | `#e8f2ea` |
| Warning | `#6a4200` | `#fbefd6` |

Information is never carried by colour alone: every semantic state also has an icon and words.

## 3. Typography

### 3.1 Faces

| Face | Loaded via | Used for |
|---|---|---|
| Cormorant Garamond | Self-hosted `.woff2`; weight 400 served by the SemiBold cut | Display, titles, Deborah's own words |
| DM Sans 400 / 500 | `@fontsource/dm-sans` | Everything people read and tap |

### 3.2 Scale

Every size multiplies by `--type-scale` (Smaller 0.9 · Default 1 · Larger 1.15 · Largest 1.3).

| Role | Size / line | Family | Weight | Use |
|---|---|---|---|---|
| `display` | 36 / 42 | Cormorant | 400 | Large titles, Welcome, Home greeting |
| `title-1` | 30 / 36 | Cormorant | 400 | Sheet and modal titles |
| `title-2` | 26 / 32 | Cormorant | 400 | Card headings, health questions |
| `title-3` | 20 / 25 | DM Sans | 400 | Inline navigation titles |
| `headline` | 17 / 22 | DM Sans | 500 | Section titles, row titles |
| `body` | 17 / 22 | DM Sans | 400 | Deborah's answers, message text |
| `callout` | 16 / 21 | DM Sans | 400 | Card body, options, inputs |
| `button` | 17 / 22 | DM Sans | 500 | Button labels |
| `subhead` | 15 / 20 | DM Sans | 400 | Secondary text, pills |
| `footnote` | 13 / 18 | DM Sans | 400 | Disclaimers, helper text |
| `caption` | 13 / 18 | DM Sans | 400 | Timestamps, counters |
| `data` | 17 / 22 | DM Sans, tabular | 400 | Lab values, prices, dates |

### 3.3 Rules

- **Medium is the ceiling.** DM Sans never goes above 500. Emphasis inside sentences uses italic.
- **Serif for display only.** Cormorant never below 26 px, profile initials excepted.
- **Nothing below 13 px.** Layouts must survive Largest: buttons wrap, rows grow, nothing truncates mid-word.

## 4. Components

All in `src/apps/mobile/ui/` (primitives) and `patterns/` (compositions), one folder per component, styled with CSS Modules.

### Button

| Variant | Chrome |
|---|---|
| contained | Flat plum, white label, soft plum lift `0 3px 9px` |
| secondary | Accent tint `#eee2f3`, plum label |
| text | No fill, plum label, 48 pt hit area |
| emergency | 64 pt, danger fill, white label — emergency card only |

Sizes: `lg` 48 px · `md` 40 px. Always fully rounded. Pressed: opacity 0.92.

### Choices

- **Option rows** — glass fill, 16 px radius, ≥ 56 px tall. Selected: accent tint and mauve border — no tick.
- **Choice pills** — 44 px glass capsules in `subhead`, wrapping in a row. Pills are for tappable choices only — never labels or statuses.
- **Wheels and sliders** — `OptionWheel`, `DateWheel`, `YearWheel`, `RulerSlider`, `MoodScale` for ranged answers.

### Cards

Tonal fill, 30 px radius (32 px on Home), 24 px padding, `--stroke-card` outline on white cards, one quiet round action (white circle, plum arrow). Leading marks sit in a 40 px `IconWell`.

### Inputs

Glass fill, 1 px control border, 16 px radius, 48 px tall, label above in `subhead`. Focus darkens the border to ink at 28% — no ring, no purple. Errors name the problem and the fix.

### Composer

Warm frosted glass, 24 px radius, float shadow, grows 1–5 lines. Attach on the left; voice and send on the right; send becomes stop while Deborah writes.

### Messages

User words in lilac bubbles, right-aligned. Deborah unboxed, full-width, with her avatar at the start of each turn. While she works: one rotating ring and a status line that names the real step.

### Sheets and overlays

Bottom sheets on `#fbf8fa` with 24 px top corners, a grabber and a scrim. Toasts on the signature surface.

## 5. Layout

- **Device:** 393 × 852 pt; safe area top 59, bottom 34.
- **Margins:** 20 pt left and right. Deborah's answers run the full content width.
- **Spacing:** a 4 pt scale — 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Tight groups 8–12; between components 16–24; between sections 32–40.
- **Heights:** buttons 48 · fields 48 · pills 44 · rows ≥ 56 · header 52 · targets ≥ 48.
- **One primary button per view**, bottom-anchored on forms.

Radius is by role, not habit:

| Radius | Used by |
|---|---|
| 8 px | Checkbox, thumbnails |
| 12 px | Segmented control, inline media |
| 16 px | Option rows, inputs, toasts |
| 19 px | Small tiles |
| 24 px | Sheets, composer, user bubbles |
| 30 px | Tonal cards |
| 32 px | Home cards |
| full | Buttons, pills, avatars, icon wells |

## 6. Depth and elevation

Depth comes in three layers, in this order: **colour fields** (tonal cards, no shadow), **glass** (tappable surfaces), **float shadows** (only chrome that floats).

| Token | Value | Used by |
|---|---|---|
| `--shadow-float-sm` | `0 3px 12px #3a035308` | Menus, toasts |
| `--shadow-float-md` | `0 9px 35px #76548016` | Composer |
| `--shadow-float-lg` | `0 35px 100px #24112844` | Bottom sheets |
| `--shadow-soft` | `0 5px 20px #522d5905` | Glass surfaces |
| `--surface-blur` | `blur(20px)` | Glass rows, pills, inputs |

Glass sits under controls and short labels, never under long clinical prose.

## 7. Colour themes

There is no dark mode. One optional recolour exists: **Fig** (`mobile.theme.fig.css`), switched on with `<html data-color-theme="fig">` from the internal State menu. Deep fig `#432439`, champagne gold `#be9862`, fig coral `#c96560`, vanilla cream `#f6f0e8`. It changes colour tokens only — no layout, type or component changes.

## 8. Motion and interaction

- **Durations:** quick 160 ms (state) · base 240 ms (fades, accordions) · screen 320 ms (push) · sheet 360 ms.
- **Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` for navigation and sheets; `cubic-bezier(.2, .8, .2, 1)` for state changes. No overshoot.
- **Reduced motion:** quick drops to 0, everything else becomes a 120 ms crossfade.
- **Banned:** waves, ripples, shimmer, bouncing or pulsing dots, typing dots, parallax, confetti.
- **Waits are narrated truthfully.** The thinking line names the step actually running.

## 9. Responsive behaviour

- The mobile app is designed at 393 pt and runs inside the iPhone frame.
- The web app (`src/apps/web`) reuses the same tokens at 1280–1440 px — see `DESIGN.web.md`.
- Nothing produces horizontal page scroll; wide content scrolls in its own container.

## 10. Voice in the interface

- **A brilliant doctor friend.** Warm, wise, plain-spoken.
- **Education, never diagnosis.** No dosing, diagnoses or prescriptions; clinical copy is placeholder until Deborah approves it.
- **Labels are plain text.** "Most chosen", "New" and "3 free consultations left" are words, not capsules.
- **Errors name the problem and the fix.**

## 11. Do and don't

**Do**

- Use semantic tokens in components, never ramps or raw hex.
- Keep readable text at 7:1 or higher.
- Use option rows or choice pills for every set of choices.
- Use `--stroke-card` as the one outline for white cards.
- Show Deborah's photo with its gold ring wherever she speaks.
- Pair every colour-coded state with an icon and words.

**Don't**

- Use DM Sans above 500.
- Use tags, badges or coloured capsules for labels or statuses.
- Use wave, ripple, shimmer, bounce or pulse animations.
- Use gold as text on light surfaces (except Gold Ink) or as a button.
- Put long clinical prose on glass, or real shadows on scroll-column cards.
- Use a coloured side stripe, gradient text or emoji as icons.

## 12. For AI agents generating UI

- Read this file and `PRODUCT.md` before any visual change. This file wins on visuals.
- Build bottom-up: `ui/` primitive → `patterns/` → screen. Reuse before creating.
- Mobile and web never import from each other; both read `src/shared` and `src/styles`.
- Never add a raw hex to a component — add a token to `mobile.tokens.css` instead.
- Safety behaviours (emergency, medication, crisis, out of scope) must always work exactly as specified.
- When the code and this file disagree, update one of them in the same change.
