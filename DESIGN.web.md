---
name: Your Oracle Clinician — Web
description: The desktop companion to the iPhone app — same consulting-room identity, laid out for a 1280–1440 px browser with keyboard and pointer
status: "ASSUMPTION — drafted in phase 9 without a web brief; derived from DESIGN.md. Review before production."
inherits: DESIGN.md
---

# Design System: Your Oracle Clinician — Web

## Overview

**Same North Star, wider room.** The web app is the same "Consulting Room at Dusk" as the iPhone app (see `DESIGN.md`): Parchment canvas, Aubergine ink, Deborah Purple as the one action colour, gold only for Deborah, Cormorant for display moments and SF Pro for everything people read and tap. Everything in `DESIGN.md` › Colors, Named Rules, Elevation, Shapes, Motion bans and Do's and Don'ts applies unchanged. This file only records what changes for a desktop browser.

**Mode: Operate.** Users come to the web app at a desk to do focused work: a longer consultation, reviewing records before a provider visit, printing a summary, managing family profiles and billing. The layout favours scanning and side-by-side context over the phone's one-thing-at-a-time stack.

## What is identical to DESIGN.md

- **Colour tokens and contrast rules** — every pair ≥ 7:1 for readable text; Gold Ink and Deborah's Rose limits; semantic tints with icon + words.
- **Families and weights** — Cormorant Garamond (display only, ≥ 26 px), SF Pro via the system stack, nothing above 500, italic for emphasis.
- **Shapes** — `lg` 16 cards/option rows/inputs, `xl` 24 dialogs, `full` buttons and avatars.
- **Bans** — no pills/tags/badges/chips (option rows and plain text), no wave/ripple/shimmer/bounce/pulse, no shadows on things that scroll, no side stripes, no glass, no eyebrow labels.
- **Deborah's answers** — unboxed, seven sections in fixed order, closing line last, product only in §6.

## Layout

- **Frame:** designed at 1280 × 800 and 1440 × 900; works from 1024 px up. Below 1024 px the context panel drops under the main column. (ASSUMPTION: no phone-width web layout — phones use the app.)
- **App shell:** a fixed **left sidebar** (264 px, Paper, hairline right border) with the brand, the active profile switcher, primary navigation (Ask Deborah · My Health · Account) and the trial counter; a **main column** on the Parchment canvas.
- **Content widths:** reading column max 720 px (Deborah's answers ≈ 70 characters per line at 17 px); hub and lists use a 12-column grid inside a 1120 px max container with 24 px gutters.
- **Conversation:** two columns — chat (flexible, max 760 px) and a 320 px **context panel** (profile, intake summary, current focus, recent consultations, book Deborah).
- **Spacing:** the mobile 4-pt scale, but sections breathe more: 40–48 px between page sections, 32 px page padding.

## Typography (desktop scale)

Roles keep their mobile names so components map 1:1. Desktop sizes step up one notch for viewing distance.

| Token | Size / line | Family | Weight | Use |
|---|---|---|---|---|
| `display` | 44 / 52 | Cormorant | 400 | Page titles (My Health, Account) |
| `title-1` | 34 / 40 | Cormorant | 400 | Dialog titles, greeting line |
| `title-2` | 28 / 34 | Cormorant | 400 | Card headings, section headings in hub |
| `title-3` | 20 / 26 | SF Pro | 400 | Sub-section titles, product name |
| `headline` | 17 / 24 | SF Pro | 500 | Answer section titles, list row titles |
| `body` | 17 / 26 | SF Pro | 400 | Deborah's answers and messages (longer line height for long reading) |
| `callout` | 16 / 24 | SF Pro | 400 | Card body, option text, inputs |
| `button` | 16 / 22 | SF Pro | 500 | Button labels |
| `subhead` | 15 / 22 | SF Pro | 400 | Secondary text, row subtitles |
| `footnote` | 13 / 18 | SF Pro | 400 | Disclaimers, helper text |
| `caption` | 13 / 18 | SF Pro | 400 | Timestamps, counters |
| `data` | 15 / 20 | SF Pro, tabular | 400 | Lab values, prices, dates |

Browser zoom replaces the in-app text-size control (ASSUMPTION). Layouts must survive 200 % zoom (WCAG 1.4.4).

## Components (desktop deltas)

- **Buttons:** 44 px tall (`lg` 48 px for page-level primaries), same fills. **Hover:** primary → accent-pressed; secondary → accent-tint-pressed; ghost → underline. Pointer cursor on every interactive element. Focus ring 2 px Deborah Purple, 3 px offset.
- **Option rows:** 48 px min height; hover shows Lilac Mist. Choice sets may lay out in 2–3 columns at desktop widths; still never a wrapping cloud of capsules.
- **Sidebar navigation:** 44 px rows, Hugeicon 22 + `callout` label; active row Lilac Mist with Aubergine text; inactive Plum Secondary; hover Linen.
- **Dialogs** (replace mobile sheets and full-screen modals): centred, `xl` radius, Paper, float-lg shadow, scrim, max width 560 (forms) or 880 (plans, PDF). Close × top-right, Escape closes, focus trapped and returned on close.
- **Popovers / menus:** Paper, `lg`, float-sm, hairline border; arrow-key navigation.
- **Toasts:** Midnight, bottom-centre of the main column, 2.5 s.
- **Tables / lists:** list rows over tables; lab values may use a 3-column definition grid (marker · value · unit) with `data` figures.
- **Composer:** docked at the bottom of the chat column, Paper, `xl`, float-md. **Enter sends, Shift+Enter adds a line** (ASSUMPTION). Attach and mic as on mobile.
- **Empty states, skeletons, progress status, safety cards, product card:** as `DESIGN.md`, wider.

## Interaction

- Every action reachable by keyboard; visible focus; logical tab order; skip link to main content.
- Hover never carries meaning that touch users would miss (the web app is still usable on a tablet).
- No system alerts — confirmations are dialogs with explicit buttons; destructive buttons use the destructive style.

## Motion

Mobile durations and easings. Desktop uses fades and small (8–12 px) rises for dialogs and popovers; no slide-from-edge screen transitions (routes change instantly, like normal web navigation). Reduced motion: 120 ms crossfades.
