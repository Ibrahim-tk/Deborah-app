---
name: Your Oracle Clinician
description: Deborah Maragopoulos FNP's clinical voice, in a calm, legible iPhone app for women navigating hormonal health
colors:
  canvas: "#fdf9f1"
  surface: "#ffffff"
  surface-tonal: "#f7eed5"
  surface-lilac: "#efebf1"
  surface-signature: "#2b104e"
  ink: "#291832"
  ink-secondary: "#58346c"
  ink-tertiary: "#613977"
  ink-placeholder: "#816192"
  ink-on-accent: "#ffffff"
  ink-on-signature: "#fdf9f1"
  accent: "#613977"
  accent-pressed: "#58346c"
  accent-tint: "#efebf1"
  border-hairline: "#cec2d5"
  border-control: "#957aa4"
  gold: "#e6c776"
  gold-tint: "#f7eed5"
  gold-ink: "#7f6d41"
  pink-ink: "#92345a"
  danger-ink: "#862323"
  danger-tint: "#fbeae7"
  danger-border: "#a3302a"
  danger-fill: "#8f2a25"
  success-ink: "#245a37"
  success-tint: "#e8f2ea"
  warning-ink: "#6a4200"
  warning-tint: "#fbefd6"
  scrim: "rgba(18, 7, 33, 0.40)"
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
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0"
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: "26px"
    letterSpacing: "0.005em"
  body:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: "30px"
    letterSpacing: "0.005em"
  callout:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "27px"
    letterSpacing: "0.005em"
  button:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0.01em"
  subhead:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0.01em"
  footnote:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0.01em"
  caption:
    fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0"
  data:
    fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "-0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
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
    padding: "0 28px"
    height: "56px"
  button-primary-pressed:
    backgroundColor: "{colors.accent-pressed}"
  button-secondary:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "56px"
  button-emergency:
    backgroundColor: "{colors.danger-fill}"
    textColor: "{colors.ink-on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    height: "64px"
  option-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.callout}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
    height: "56px"
  option-row-selected:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.callout}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "56px"
  composer:
    backgroundColor: "{colors.surface}"
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
  tab-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    height: "64px"
---

# Design System: Your Oracle Clinician

## Overview

**Creative North Star: "The Consulting Room at Dusk"**

The app should feel like sitting across from Deborah in a quiet, warm consulting room in the early evening: soft parchment light, deep aubergine ink, a few precious gold details, and nothing on the desk that doesn't need to be there. It is a reading-and-listening experience first. Deborah's words are the interface; everything around them recedes.

The visual world is **restrained and literary**: a subtle beige canvas, dark purple type, generous margins, serif voice, soft rounded shapes and almost no decoration. Precision ("clinical") comes from alignment, consistent rhythm and honest data presentation, not from cold colours. Warmth and femininity come from the serif voice, the beige-and-aubergine palette and Deborah's photographic presence, not from ornaments, gradients, waves or florals.

This is an **Operate surface on iOS**: users are in a task (understanding their health), so familiarity beats novelty. iOS structure, gestures and controls are kept; the brand lives in type, colour, spacing and Deborah's presence.

**Key Characteristics:**
- Beige canvas `#fdf9f1`, aubergine ink `#291832` (15.7:1); every readable text pair ≥ 7:1.
- Serif everywhere people read (EB Garamond, Cormorant Garamond); SF Pro only for tiny functional text.
- Nothing heavier than Medium (500). Hierarchy is carried by size, family, colour and space.
- Soft, rounded geometry: 16 pt cards, fully rounded buttons, 24 pt sheets and composer.
- Flat tonal layering; shadows only on things that float.
- Deborah's answers unboxed and full-width; the user's words in lilac bubbles.
- No pills, tags, badges or chips; no wave, ripple, shimmer or bounce animations.

## Colors

A warm parchment-and-aubergine palette with gold reserved for Deborah and pink reserved for her signature.

### Primary
- **Aubergine Ink** (#291832, purple-900): all primary text, icons in their default state, headings. 15.7:1 on canvas, 16.5:1 on white.
- **Deborah Purple** (#613977, purple-500): the one action colour — primary buttons, links, focus rings, selected borders, active tab tint, progress fill. White text on it is 8.9:1. Pressed: purple-600 #58346c.

### Secondary
- **Signature Gold** (#e6c776, gold-500): Deborah signature moments only — the ring around her portrait, the rule above "A Word from Deborah", plan highlights, and selected states on the dark signature surface (9.9:1 on #2b104e). Never as text on light surfaces (1.6:1). Never as a button on beige.
- **Gold Ink** (#7f6d41, gold-800): the only gold allowed as text on light surfaces (answer section numerals, "Most chosen" line on plans). 4.8:1 — use at ≥ 19 px only.

### Tertiary
- **Deborah's Rose** (#92345a, pink-700): Deborah's personal accent only — her written sign-off ("— Deborah") and her mark in About Deborah. 7.0:1 on canvas. Pink-500 #cd497f is never used for text (4.1:1).

### Neutral
- **Parchment** (#fdf9f1, gold-50): the canvas behind every screen.
- **Paper** (#ffffff): raised surfaces — cards, options, inputs, composer, sheets, tab bar. Distinguished from the canvas by a hairline or float shadow, not by colour alone.
- **Linen** (#f7eed5, gold-100): tonal panels — closing-line panel, profile strip, "A Word from Deborah", grouped settings sections.
- **Lilac Mist** (#efebf1, purple-50): user message bubbles, secondary buttons, selected-option fill.
- **Midnight** (#2b104e, midnight-500): the rare signature dark surface — splash, plan success, toasts, About Deborah header band. Text on it is Parchment (15.5:1).
- **Plum Secondary** (#58346c, purple-600): secondary text, inactive tab labels, list subtitles. 9.4:1.
- **Plum Tertiary** (#613977, purple-500): metadata, timestamps. 8.5:1.
- **Plum Placeholder** (#816192, purple-400): placeholders only. 4.9:1.
- **Hairline** (#cec2d5, purple-100): decorative dividers and card outlines (not used to signal interactivity).
- **Control Border** (#957aa4, purple-300): input and unselected option outlines (3.6:1, meets non-text contrast).

### Semantic (added, tuned to the palette)
| Role | Ink (text, icons) | Tint (background) | Ink on canvas | Ink on tint |
|---|---|---|---|---|
| Danger / emergency | #862323 | #fbeae7 | 8.8:1 | 7.9:1 |
| Success | #245a37 | #e8f2ea | 7.7:1 | 7.1:1 |
| Warning | #6a4200 | #fbefd6 | 8.4:1 | 7.7:1 |
| Emergency button fill | #8f2a25 with white text 8.3:1 | — | — | — |
| Emergency card border | #a3302a | — | — | — |

Information is never carried by colour alone: every semantic state also has an icon and words.

### Named Rules
**The One Action Colour Rule.** Deborah Purple is the only colour that means "you can do something here". Gold, pink and the semantic colours never appear on an interactive control except the emergency button.

**The Gold Is Deborah Rule.** Gold marks Deborah's presence and premium moments. If gold appears somewhere Deborah isn't, remove it.

**The Seven-to-One Rule.** Any text a user needs to read meets 7:1 on its surface. Only placeholders and decorative numerals may sit between 4.5:1 and 7:1.

## Typography

**Display Font:** Cormorant Garamond (fallback Georgia, serif) — weights 400, 500 loaded; 400 used.
**Body Font:** EB Garamond (fallback Georgia, serif) — weights 400, 500.
**Functional Font:** SF Pro via `-apple-system, system-ui` — 400 only.

**Character:** A literary, consulting-room pairing. Cormorant gives Deborah's moments a quiet elegance at large sizes; EB Garamond carries every sentence people read. SF Pro appears only where a serif becomes illegible: tiny labels and numbers.

### Type scale (mobile, at default text size)

Built from Apple's iOS text styles (Dynamic Type at the default "Large" size, the standard native iOS scale), then adjusted upward because EB Garamond's x-height is roughly 20 % smaller than SF Pro's. Our 19 px body reads closer to a 15–16 pt SF Pro body; it is the smallest size that stays comfortable for this audience in a serif.

| Token | iOS reference style (default) | Ours | Family | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|---|---|
| `display` | Large Title 34 / 41 | **36 / 42** | Cormorant | 400 | 42 | −0.01em | Large titles on tab roots, Welcome, plan success |
| `title-1` | Title 1 28 / 34 | **30 / 36** | Cormorant | 400 | 36 | −0.005em | Sheet and modal titles, greeting line |
| `title-2` | Title 2 22 / 28 | **26 / 32** | Cormorant | 400 | 32 | 0 | Card headings in hub, About Deborah name |
| `title-3` | Title 3 20 / 25 | **22 / 28** | EB Garamond | 400 | 28 | 0 | Inline navigation titles, product name |
| `headline` | Headline 17 / 22 (semibold) | **19 / 26** | EB Garamond | **500** | 26 | +0.005em | Answer section titles, list row titles |
| `body` | Body 17 / 22 | **19 / 30** | EB Garamond | 400 | 30 (1.58) | +0.005em | Deborah's answers, all message text |
| `callout` | Callout 16 / 21 | **18 / 27** | EB Garamond | 400 | 27 | +0.005em | Card body, option text, inputs, descriptions |
| `button` | (Body / Headline) | **18 / 24** | EB Garamond | **500** | 24 | +0.01em | Every button label |
| `subhead` | Subheadline 15 / 20 | **17 / 24** | EB Garamond | 400 | 24 | +0.01em | Secondary text, list subtitles, closing line |
| `footnote` | Footnote 13 / 18 | **16 / 22** | EB Garamond | 400 | 22 | +0.01em | Disclaimers, helper text, legal |
| `caption` | Caption 1 12 / 16 | **13 / 18** | SF Pro | 400 | 18 | 0 | Tab labels, timestamps, character counter |
| `data` | Body 17 / 22 | **17 / 22** | SF Pro, tabular figures | 400 | 22 | −0.01em | Lab values, prices, dates in lists |

Floors: nothing below 13 px anywhere; nothing below 16 px in EB Garamond; no Cormorant below 26 px.

### Text size control
- The whole scale multiplies by `--type-scale`. In-app control (Account › Text size and the `Aa` action in the conversation header menu): **Smaller 0.9 · Default 1.0 · Larger 1.15 · Largest 1.3**.
- In the native build the same tokens map to iOS Dynamic Type via `relativeTo` styles (display→largeTitle, title-1→title1, title-2→title2, title-3→title3, headline→headline, body→body, callout→callout, subhead→subheadline, footnote→footnote, caption→caption1) and the in-app control multiplies on top.
- Layouts must survive Largest: buttons wrap to two lines, rows grow in height, nothing truncates mid-word.

### Named Rules
**The Medium Ceiling Rule.** Nothing is heavier than 500. Medium is allowed only on buttons, answer section titles, selected options and list row titles. Everything else, including every Cormorant heading, is Regular. Emphasis inside sentences uses italic, never weight.

**The Serif Speaks Rule.** Anything a person reads is in a serif. SF Pro is allowed only for `caption` and `data`.

## Layout

- **Device frame:** 393 × 852 pt; safe area top 59, bottom 34.
- **Margins:** 20 pt left/right on every screen. Deborah's answers run the full content width (353 pt ≈ 45–55 characters per line at 19 px).
- **Spacing scale (4-pt base):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Tight groups 8–12; between components 16–24; between sections 32–40; more space above a heading than below it (32 above, 12 below).
- **Touch targets:** minimum 48 × 48 pt; 8 pt minimum between adjacent targets. List rows ≥ 56 pt. Primary buttons 56 pt; emergency button 64 pt.
- **Structure:** large-title tab roots; inline-title pushed screens; sheets for focused sub-tasks; one primary button per view, bottom-anchored on forms.
- **Conversation column:** messages stack with 24 pt between turns, 12 pt within a turn. The composer floats above the tab bar with 12 pt clearance.

## Elevation & Depth

Flat by default. Depth comes from tonal layering — Parchment canvas, Paper surfaces outlined with a Hairline, Linen panels — and shadows appear only on elements that float above the content: composer, floating tab bar, sheets, menus, toasts.

### Shadow Vocabulary
- **float-sm** (`box-shadow: 0 2px 8px rgba(43, 16, 78, 0.08)`): menus, toasts.
- **float-md** (`box-shadow: 0 8px 24px rgba(43, 16, 78, 0.10), 0 1px 3px rgba(43, 16, 78, 0.08)`): composer, floating tab bar.
- **float-lg** (`box-shadow: 0 -8px 32px rgba(43, 16, 78, 0.12)`): bottom sheets.
- **Scrim** (`rgba(18, 7, 33, 0.40)`): behind sheets and modals.

### Named Rules
**The Only-Floating-Things-Cast-Shadows Rule.** Cards, options and inputs never have shadows. If it scrolls with the content, it is flat.

## Shapes

Soft and rounded, never bubbly.

| Token | Radius | Used on |
|---|---|---|
| `sm` | 8 | Checkbox, small image thumbnails |
| `md` | 12 | Segmented control, inline media, lab value rows |
| `lg` | 16 | Cards, option rows, inputs, product card, safety cards, toasts |
| `xl` | 24 | Bottom sheets (top corners), composer, user bubbles, modal cards |
| `full` | 999 | Buttons, avatars, floating tab bar, toggle switch |

User bubbles use `xl` on three corners and 8 on the bottom-right (the speaker's corner). Borders are 1 px (Hairline for decoration, Control Border for interactive outlines); selected and focus states use 2 px Deborah Purple.

**No pills, tags or badges.** Fully rounded shapes are reserved for buttons, avatars, the tab bar and switches. Labels such as "Most chosen", "New", "3 free consultations left" or "Premium" are plain text set in `subhead` or `footnote`, never inside a coloured capsule.

## Components

### Buttons
Calm, large and unmistakable.
- **Shape:** fully rounded (`full`), 56 pt tall, label in `button` (EB Garamond 18/500), optional leading Hugeicon 22 pt.
- **Primary:** Deborah Purple fill, white text. Pressed: purple-600 plus scale 0.98 (120 ms). One per view.
- **Secondary:** Lilac Mist fill, Aubergine text. Pressed: purple-100 fill.
- **Tertiary (text button):** no fill, Deborah Purple text, underline offset 3 px on press; 48 pt hit area.
- **Destructive:** Paper fill, 1 px danger-border, danger-ink text.
- **Emergency:** 64 pt, danger-fill #8f2a25, white text, phone icon. Used only in the emergency card.
- **Focus:** 2 px Deborah Purple ring, 3 px offset in Parchment.
- **Disabled:** avoided where possible (respond on tap with an inline message instead). When unavoidable: purple-50 fill, purple-400 text, no shadow, explanatory text below.
- **Loading:** label stays; a 16 pt rotating ring replaces the icon; width does not change.

### Option rows (replace chips and pills everywhere)
Full-width, easy-to-hit choices for suggestions, intake answers, quick replies and filters.
- **Style:** Paper fill, 1 px Control Border, `lg` radius, ≥ 56 pt tall, `callout` text left-aligned, optional leading icon.
- **Selected:** Lilac Mist fill, 2 px Deborah Purple border, check icon on the right, text weight 500.
- **Layouts:** a vertical list (default); a two-column grid for up to six short answers (e.g. age ranges); never a wrapping cloud of capsules.
- **Multi-select:** check icons on each row plus a "Done" primary button below.

### Cards / Containers
- **Corner style:** `lg` (16).
- **Background:** Paper on Parchment; Linen for quiet informational panels.
- **Shadow strategy:** none (see Elevation).
- **Border:** 1 px Hairline on Paper cards; none on Linen panels.
- **Internal padding:** 20 pt; 12 pt between title and body.

### Inputs / Fields
- **Style:** Paper fill, 1 px Control Border, `lg` radius, 56 pt tall, `callout` text, label above in `subhead` Plum Secondary.
- **Focus:** border becomes 2 px Deborah Purple; no glow.
- **Error:** 2 px danger-border, danger-ink message below with alert icon; the message names the problem and the fix.
- **Placeholder:** Plum Placeholder, a real example ("Maria").

### Composer (signature)
A solid, softly lifted writing surface.
- Paper fill, `xl` radius, float-md shadow, grows 1–5 lines, `body` text.
- Left: **attach** (+) icon button (lab photo, PDF, manual entry). Right: **voice** (mic) and **send** (Deborah Purple circle, white arrow). While Deborah writes, send becomes **stop** (square icon, same position).
- Voice recording state: mic icon in Deborah Purple, elapsed timer in `data`, "Listening…" in `subhead`, and Stop / Cancel buttons. **No waveform or animated levels.**
- Character counter appears in `caption` from 1,800 characters.

### Messages
- **User:** Lilac Mist bubble, right-aligned, max width 300 pt, `body` text, `xl` radius with 8 pt speaker corner.
- **Deborah:** unboxed, full-width `body` text on Parchment, preceded by her 32 pt photo avatar (gold ring) and "Deborah" in `subhead` at the start of each turn only.
- **Streaming:** each new word fades in from opacity 0 to 1 over 200 ms (no movement, no blur, no caret).
- **Progress status:** while Deborah works, a single line with a 16 pt rotating ring and a status in `subhead` Plum Secondary that changes as steps complete ("Reading your answers" → "Looking through my Handbook" → "Writing to you"). Steps crossfade (160 ms). No typing dots.
- **Message actions** (under each completed Deborah turn): Copy · Listen (read aloud) · Helpful · Not helpful — Hugeicons with `caption` labels, 48 pt targets.

### Answer sections (signature)
Deborah's seven-section framework as a calm accordion.
- Each section: number in Gold Ink (Cormorant 26, Regular), title in `headline`, chevron. Divided by Hairlines, no boxes.
- Expanded body in `body`; bullets with 8 pt Deborah Purple dots.
- §6 ends with the **product card**: Paper card, `lg`, product image (64 pt, `md` radius), name in `title-3`, "Formulated by Deborah" in `footnote`, why-it-fits in `callout`, 90-day line in `subhead`, secondary button "Shop on Genesis Gold".
- §7 "A Word from Deborah": Linen panel with a 2 px Signature Gold rule on top (not on the side), body in `body` italic, sign-off "— Deborah" in Cormorant 26 Deborah's Rose.
- **Closing line:** Linen panel, `subhead`, Aubergine.
- **Sources:** "From Deborah's work" heading in `subhead`, then plain list rows (book, video or article icon, title in `callout`, chapter or date in `footnote`, chevron). No chips.

### Safety cards
- **Emergency:** Paper card, 2 px danger-border, alert icon, title in `title-3` danger-ink, body in `callout` Aubergine, Emergency button, secondary "Find nearest ER", tertiary "I'm safe — this isn't happening now". Nothing else on screen competes.
- **Medication:** Linen panel, pill-bottle icon, `callout` text, tertiary link to the interaction checker.
- **Crisis:** Paper card, 1 px Hairline, calm tone (not red), primary "Call or text 988".
- **Out of scope / escalation:** Deborah's normal unboxed text plus a secondary button "Book a consultation with Deborah".

### Navigation
- **Large title header (tab roots):** `display` Cormorant, left-aligned, collapses to an inline `title-3` title on scroll. Profile avatar (40 pt) top-left on tab roots.
- **Inline header (pushed screens):** back chevron with previous title in `callout` Deborah Purple, title `title-3` centred.
- **Floating tab bar:** Paper, `full` radius, float-md, 64 pt tall, inset 16 pt from the sides and 8 pt above the home indicator. Three items (Ask Deborah, My Health, Account): Hugeicon 26 pt + `caption` label, always visible. Active item: Lilac Mist rounded background behind icon and label, icon and label in Aubergine; inactive in Plum Secondary. The bar hides while the keyboard is open.
- **Sheets:** Paper, top corners `xl`, grabber 40 × 5 pt purple-100, float-lg, scrim.
- **Toasts:** Midnight surface, Parchment `callout` text, `lg` radius, float-sm, above the tab bar, 2.5 s.

### Other controls
- **Checkbox:** 26 pt, `sm` radius, 2 px Control Border; checked: Deborah Purple fill with white check. Label in `callout`, whole row tappable.
- **Toggle:** iOS switch geometry, on = Deborah Purple, off = purple-100 track.
- **Segmented control:** Linen track, `md` radius, selected segment Paper with Hairline border and Aubergine `callout` text at 500.
- **List rows:** ≥ 56 pt, title `headline`, subtitle `subhead` Plum Secondary, trailing chevron or value in `data`; Hairline separators inset 20 pt.
- **Avatars:** Deborah — photo in a circle with a 2 px Signature Gold ring. Profiles — initial in Cormorant on Lilac Mist, Aubergine.
- **Progress bar (90-day plan):** 8 pt tall, `sm` radius, purple-100 track, Deborah Purple fill, value written beside it in `subhead`.
- **Skeletons:** static Linen blocks with `md` radius. No shimmer.
- **Empty states:** a short invitation in `title-2`, one line of `callout`, one primary button. No illustration required.

### Motion
Calm iOS-standard motion with no bounce.
- Durations: quick 160 ms (state), base 240 ms (fades, accordions), screen 320 ms (push), sheet 360 ms.
- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` for navigation and sheets; `cubic-bezier(0.22, 1, 0.36, 1)` for small state changes. Springs critically damped (no overshoot).
- Reduced motion: every movement becomes a 120 ms crossfade; streaming words appear without fading.
- **Banned:** waves, wave-like loaders, ripples, shimmer, bouncing or pulsing dots, parallax, confetti, animated gradients.

### Iconography
**Hugeicons**, stroke-rounded style, 1.5 pt stroke, 24 pt default (22 in buttons, 26 in the tab bar), Aubergine by default, Deborah Purple when interactive-primary. One library only, wrapped in the `Icon` adapter.

## Do's and Don'ts

### Do:
- **Do** set every screen on Parchment (#fdf9f1) with Aubergine Ink (#291832) text.
- **Do** keep all readable text at 7:1 or higher; check every new pair.
- **Do** use option rows for every set of choices, at least 56 pt tall.
- **Do** carry hierarchy with size, family (Cormorant vs EB Garamond), colour and space.
- **Do** leave 20 pt side margins and 32 pt between sections.
- **Do** show Deborah's photo with its gold ring wherever she speaks.
- **Do** pair every colour-coded state with an icon and words.

### Don't:
- **Don't** use any weight above 500, or Medium outside buttons, answer section titles, selected options and list row titles.
- **Don't** use pills, tags, badges or chips for labels, statuses, filters or suggestions.
- **Don't** use wave, ripple, shimmer, bounce or pulse animations, including audio waveforms and typing dots.
- **Don't** use gold as text on light surfaces (except Gold Ink at ≥ 19 px) or as a button on beige.
- **Don't** use pink-500 for text; Deborah's Rose is for her signature only.
- **Don't** put shadows on cards, options or inputs.
- **Don't** use glass, blur or translucency for decoration; surfaces are solid.
- **Don't** use a coloured side stripe (border-left) on cards, callouts or alerts.
- **Don't** use gradient text, eyebrow labels above headings, or emoji as icons.
