---
name: Deborah
description: Plum serif identity and pale botanical atmosphere from the supplied reference.
colors:
  ink: "#35233f"
  plum: "#694080"
  deep: "#50305f"
  muted: "#76617f"
  surface: "#fcf8fc"
  on-primary: "#fff"
  focus: "#704587"
typography:
  display:
    fontFamily: "'Deborah Cormorant', Georgia, serif"
    fontSize: "clamp(58px, 5.05vw, 88px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "'Deborah Cormorant', Georgia, serif"
    fontSize: "clamp(32px, 2.57vw, 44px)"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-0.018em"
  action:
    fontFamily: "'Deborah Cormorant', Georgia, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.25
  copyright:
    fontFamily: "Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.7
rounded:
  pill: "999px"
  circle: "50%"
spacing:
  gutter: "clamp(24px, 8.37vw, 160px)"
  mobile-gutter: "24px"
  footer-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.on-primary}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "12px 34px"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
  button-hero:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.on-primary}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "12px 42px"
  button-hero-desktop:
    padding: "12px 38px"
  text-link:
    textColor: "{colors.ink}"
    padding: "12px 0 9px"
---

# Design System: Deborah

## Overview

**Creative North Star: "The supplied Deborah botanical reference"**

The implemented identity pairs plum serif lettering with pale surfaces and a flowering landscape. The supplied flower mark and portrait remain image assets; they anchor a spacious, personal introduction.

This record covers the shipped navigation, hero and footer, not an expanded application library. Cormorant Garamond is the local approximation selected for the reference's unidentified typeface.

**Key Characteristics:**
- Plum text and actions on pale surfaces.
- Regular serif display and supporting copy.
- Circular portrait, pill actions and restrained underlines.

## Colors

The palette stays within plum and warm pale neutrals.

### Primary
- **Plum:** primary action fill and secondary-link hover.
- **Deep:** primary-action hover fill.

### Neutral
- **Ink:** main text and navigation.
- **Muted:** copyright and secondary information.
- **Surface:** page, header, footer and mobile navigation.
- **On-primary:** primary-action text.
- **Focus:** visible keyboard outline.

**The Plum Action Rule.** Filled actions use plum, deepen on hover and retain light text.

## Typography

**Display and Body Font:** locally bundled Cormorant Garamond Regular, registered as Deborah Cormorant; Georgia and serif fallbacks. The asset is `assets/CormorantGaramond-Regular.ttf`, loaded with `font-display: swap`.

**Character:** regular, closely tracked serif lettering carries both greeting and large conversational copy. Arial is confined to small supporting metadata.

### Hierarchy
- **Display:** frontmatter display role; at tablet widths, 70px; below 600px, `clamp(42px, 10.8vw, 62px)` with 1.05 line height.
- **Body:** frontmatter body role; tablet 38px; below 600px, `clamp(28px, 7.1vw, 34px)` with 1.2 line height.
- **Brand:** 38px desktop, 34px compact/tablet, 32px mobile; footer 29px.
- **Navigation/actions:** 21px desktop; navigation 19px in the compact desktop band, disclosure links 24px; mobile hero actions 20px.
- **Footer links:** 18px. Copyright uses its frontmatter role.

**The Serif Voice Rule.** Keep the display, conversational copy and action labels in the bundled regular serif.

## Layout

Header, hero and footer use a centered maximum width of 2000px and the shared gutter. The desktop header is 90px tall. Hero content is capped at 650px, supporting copy at 620px. Actions wrap and use a 42px gap. At desktop widths (1100px and above), the heading bottom margin is 4px and the action row top margin is 28px. At 1400px and above, the default reference description uses explicit block lines; custom descriptions retain natural wrapping.

From 1100px through 1399px, header padding becomes 5vw and gaps tighten; hero content and copy cap at 560px and 540px. Below 1100px, the header becomes 80px tall and navigation is a scrolling disclosure beneath it; hero text sits over a stronger pale horizontal wash. The footer wraps.

Below 600px, the header becomes 76px, gutters 24px, hero padding 40px above and 290px below. The landscape is anchored at the bottom in a 540px-high region, beneath a vertical pale wash; the portrait reduces from 96px to 72px. Footer items stack and copyright comes last. These are observed hero arrangements, not mandatory layouts for future pages.

## Elevation & Depth

The landscape and translucent washes provide most depth. Shadows are soft and local: portrait (`0 8px 20px #50305f17`), action hover (`0 5px 18px #35233f1c`) and open mobile navigation (`0 16px 24px #35233f12`). Header and footer remain pale, flat bands; footer has a subtle single top border.

## Shapes

Primary actions are fully rounded pills. The portrait is circular. The flower mark retains its supplied silhouette. Navigation and secondary actions use thin underlines rather than containers; the landscape spans the hero without a rounded card frame.

## Components

### Buttons

Quiet pill links use the primary tokens. Standard minimum height is 57px; hero minimum height is 63px and includes an inline SVG arrow. Hero horizontal padding is 38px at desktop widths and 42px on tablet. Mobile hero actions use 55px minimum height and 26px horizontal padding. Hover transitions background and soft shadow over 180ms ease. Keyboard focus uses a 2px focus-color outline with 6px offset. Reduced-motion preference removes transitions.

### Secondary link

The text action has a persistent single bottom border, ink text and plum hover; its color transition uses the same duration. It shares the visible keyboard treatment.

### Navigation

Desktop links show an underline for hover and current page. Below 1100px, a labeled Menu/Close button and inline SVG control a surface-colored disclosure. The current mobile link is underlined. Escape restores toggle focus; outside click, link activation, leaving navigation focus and entering desktop width close it. Native links retain keyboard access.

### Hero

The portrait and flower mark use crops of the supplied reference asset by default and accept custom images. A decorative tree landscape sits behind text and a responsive wash. Keep the local image assets alongside the component. The hero greeting and prose use the typography roles above.

### Footer

A compact brand, muted copyright and native policy/contact links share a pale band. Links underline on hover and retain visible keyboard focus. Footer styling is scoped so the component can be imported independently.

## Do's and Don'ts

### Do:
- **Do** retain the supplied flower mark and portrait unless replacements are provided.
- **Do** preserve visible keyboard focus and reduced-motion behavior.
- **Do** keep local fonts and image assets with the component.

### Don't:
- **Don't** treat this hero's composition as a universal page template.
- **Don't** infer inputs, cards or additional application components from this small library.

The uppercase eyebrow is part of the supplied hero reference. The unidentified original font remains an acknowledged approximation.
