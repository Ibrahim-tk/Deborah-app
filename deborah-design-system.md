# Deborah — Mobile Design System

An implementation-derived export of the current mobile prototype, with detailed tokens for **Ask Deborah**, followed by Home, profile setup, and shared surfaces.

**Source:** `dist/index.html`, revision `a36a97e9a94f86840f974b65e494028e639ab78e`. Compared with the supplied Focus, Home, and Ask Deborah screenshots. Exported 14 October 2026.

**Units:** Dimensions below are **CSS pixels**, not screenshot pixels. The supplied screenshots are enlarged; do not measure their text and double the font sizes. In Figma, use these numbers as design units. Rem equivalents assume a 16px root.

**Scope:** Values describe the existing implementation after its mobile overrides. Semantic token names are proposed names for organizing the existing values; the original implementation declares only the core `--plum`, `--mauve`, `--peach`, `--orange`, `--ink`, `--muted`, `--paper`, `--line`, and `--ease` variables. This document does not change the app. `normal` line-height means the source leaves it to the browser/font rather than declaring a numeric value.

## 1. Foundations

### Brand palette

| Token | Exact value | Use |
|---|---|---|
| `color.brand.plum` | `#3A0353` | Primary actions, send button, selected chips |
| `color.brand.mauve` | `#804A8A` | Brand mark, accent headings, selected borders |
| `color.brand.peach` | `#F8D299` | Composer gradient highlight, decorative warmth |
| `color.brand.apricot` | `#F59E51` | Original palette accent; not the main chat action color |
| `color.text.ink` | `#302335` | Default text, headings, entered composer text |
| `color.text.muted` | `#766B78` | Header status and shared secondary text |
| `color.background.paper` | `#F7F4F1` | Home, profile setup, mobile shell |
| `color.border.base` | `#E8E1E6` | Base variable; individual components use the borders below |

### Font families

| Token | Value | Role |
|---|---|---|
| `font.family.body` | `'DM Sans', Arial, sans-serif` | Chat, buttons, labels, input, most cards |
| `font.family.display` | `'Manrope', Arial, sans-serif` | Welcome, profile headings, home greeting, large numbers |
| `font.family.editorial` | `Georgia, serif` | Italic phrases such as “to you today?” and “more like you” |

DM Sans weights loaded: **400, 500, 600, 700**. Manrope weights loaded: **400, 500, 600, 700, 800**. Most running text and controls inherit weight **400**. Do not make all headings bold: key headings use **500**, and Georgia emphasis uses **400 italic**.

### Alpha notation

The final two digits of an eight-digit CSS color are alpha: `#RRGGBBAA`. Four-digit values expand similarly: `#FFF8` = `#FFFFFF88`. Set opacity on the **fill**, not the whole frame, so text and icons stay opaque.

| Exact CSS value | Figma color + fill opacity |
|---|---|
| `#FFFFFFCC` / `#FFFC` | White · 80% |
| `#FFFFFFAF` | White · 68.63% |
| `#FFFFFFB8` | White · 72.16% |
| `#FFFFFFBC` | White · 73.73% |
| `#FFFFFF99` / `#FFF9` | White · 60% |
| `#FFFFFF88` / `#FFF8` | White · 53.33% |
| `#FFFFFF77` / `#FFF7` | White · 46.67% |
| `#FFFFFF55` | White · 33.33% |
| `#FFFFFF33` / `#FFF3` | White · 20% |
| `#FFFFFF13` | White · 7.45% |

## 2. Ask Deborah — Color tokens

### Canvas, content, and controls

| Token | Exact value | Source / role |
|---|---|---|
| `chat.background.base` | `#F9F7F5` | `.workspace` base; slightly different from Paper |
| `chat.background.lavender` | `#E9DBEE77` | Top-right radial wash |
| `chat.background.peach` | `#FFDDA344` | Bottom-left radial wash |
| `chat.header.fill` | `#F9F7F57D` | 49.02% opacity warm off-white |
| `chat.header.border` | `#EEE5EEAA` | 66.67% opacity divider |
| `chat.text.primary` | `#4D3D54` | Assistant message text |
| `chat.text.heading` | `#302335` | Header title, optional opening heading |
| `chat.text.status` | `#766B78` | “Here with you” under header title |
| `chat.text.sender` | `#95859A` | Message sender row |
| `chat.text.divider` | `#A293A8` | “A little space, just for you” |
| `chat.text.utility` | `#9A899E` | Save moment / Listen |
| `chat.text.typing` | `#9B849F` | Typing indicator label |
| `chat.typing.dot` | `#A984B0` | Animated dots |
| `chat.user.fill` | `#EADEEF` | User message bubble |
| `chat.user.text` | `#593467` | User message text |
| `chat.chip.fill` | `#FFFFFFCC` | Suggested reply |
| `chat.chip.border` | `#E0D2E6` | Suggested reply outline |
| `chat.chip.text` | `#6E4B79` | Suggested reply text |
| `chat.chip.hover.fill` | `#EFE1F2` | Hover |
| `chat.chip.hover.border` | `#C6ABCF` | Hover outline |
| `chat.chip.selected.fill` | `#3A0353` | Selected chip fill and border |
| `chat.chip.selected.text` | `#FFFFFF` | Selected label |
| `chat.utility.hover.fill` | `#EEE6EF` | Hover behind Save / Listen |
| `chat.utility.hover.text` | `#3A0353` | Hover label and icon |
| `chat.scrollbar` | `#D9CBDC` | Scrollbar thumb; track transparent |

**Assistant messages have no enclosing bubble, border, or card fill.** They sit directly on the softly tinted canvas. Only user messages and interactive widgets get containers.

### Composer

| Token | Exact value | Role |
|---|---|---|
| `composer.text` | `#302335` | Entered text |
| `composer.placeholder` | `#A394AA` | “Tell me what’s on your mind…” |
| `composer.border.lavender` | `#C7AAD799` | Gradient start; 60% alpha |
| `composer.border.blush` | `#E2C6DEAA` | 34% stop; 66.67% alpha |
| `composer.border.peach` | `#F8D299` | 77% stop |
| `composer.border.mauve` | `#D6ADDF` | Gradient end |
| `composer.fill.start` | `#FFFFFFED` | White, 92.94% alpha |
| `composer.fill.end` | `#FAF6FBE8` | Lavender white, 90.98% alpha |
| `composer.tool.fill` | `#F0E9F29C` | Add a file / Speak; 61.18% alpha |
| `composer.tool.text` | `#806C88` | Tool label and icon |
| `composer.tool.recording.fill` | `#E6C8E7` | Active microphone |
| `composer.tool.recording.text` | `#3A0353` | Active microphone label |
| `composer.send.fill` | `#3A0353` | Send button |
| `composer.send.icon` | `#FFFFFF` | Up arrow |
| `composer.footnote.text` | `#9A8D9F` | Demo disclaimer |
| `composer.attachment.fill` | `#EEE3F3` | Selected local file chip |
| `composer.attachment.text` | `#806285` | File name |
| `composer.suggestion.fill` | `#FFFFFF88` | Optional compact suggestion row above composer |
| `composer.suggestion.border` | `#E7DCE9` | Compact suggestion outline |
| `composer.suggestion.text` | `#816C89` | Compact suggestion label |

## 3. Ask Deborah — Typography

All styles are DM Sans unless noted. Numeric line heights are calculated from the actual CSS multipliers.

| Style / source | Size | Weight | Line height | Letter spacing | Color |
|---|---:|---:|---|---|---|
| Header “Deborah” | 19px / 1.1875rem | 500 | normal | −0.5px | `#302335` |
| Header status | 10px / 0.625rem | 400 | normal | normal | `#766B78` |
| Section divider | 9px / 0.5625rem | 400 | normal | +1.5px, uppercase | `#A293A8` |
| Sender row | 11px / 0.6875rem | 400 | normal | normal | `#95859A` |
| Assistant message | **18px / 1.125rem** | **400** | **1.65 / 29.7px** | normal | `#4D3D54` |
| User message | 18px / 1.125rem | 400 | 1.5 / 27px | normal | `#593467` |
| Suggested reply | 14px / 0.875rem | 400 | normal | normal | `#6E4B79` |
| Save moment / Listen | 11px / 0.6875rem | 400 | normal | normal | `#9A899E` |
| Composer input + placeholder | **17px / 1.0625rem** | **400** | **1.5 / 25.5px** | normal | Entered / placeholder tokens |
| Composer tools | 12px / 0.75rem | 400 | normal | normal | `#806C88` |
| Composer disclaimer | 9px / 0.5625rem | 400 | normal | +0.1px | `#9A8D9F` |
| Typing label | 12px / 0.75rem | 400 | normal | normal | `#9B849F` |
| Optional opening heading | 30px / 1.875rem | 500 | 1.3 / 39px | −1.5px | `#302335` |
| Optional compact suggestion row | 12px / 0.75rem | 400 | normal | normal | `#816C89` |
| Attachment file chip | 12px / 0.75rem | 400 | normal | normal | `#806285` |

The optional opening heading uses **Manrope**. At viewport widths of 360px or less, the composer tool **span labels** become 11px in the existing CSS. The main message remains 18px.

The small secondary sizes above are an exact export, not an accessibility certification. For a production version aimed at older adults, review the 9–12px labels, low-contrast secondary text, and small icon targets separately; do not silently substitute revised values when matching these screenshots.

## 4. Ask Deborah — Containers and layout

### Layout specifications

| Component | Dimensions / spacing | Radius | Border / effect |
|---|---|---|---|
| Header | 78px height; horizontal padding 17px; identity gap 8px | None | 1px bottom divider; background blur 25px |
| Header orb | 31 × 31px | Circle | Mini-orb recipe below |
| Back control | 34 × 44px; padding 4px; left margin −4px | Inherits circle | Transparent, no border |
| Header action controls | 40 × 44px; 2px between controls | Circle | Transparent, no border |
| Thread | Padding 25px top, 20px sides, 20px bottom | None | Transparent |
| Divider | 25px bottom margin | None | Text only |
| Message group | 27px bottom margin | None | No assistant container |
| Sender | 9px gap; 12px bottom margin; orb 21 × 21px | — | No fill |
| User bubble | Max 85% width; padding 14px vertical / 21px horizontal | 23px 23px 5px 23px | No border; inset white highlight |
| Suggested reply group | 20px top margin; 9px wrapping gap | — | — |
| Suggested reply | Min-height 48px; padding 11px / 17px | 40px | 1px outline |
| Message utility row | 9px top margin; 4px gap | — | — |
| Utility button | Min-height 35px; padding 5px / 10px; icon 14px; internal gap 5px | 12px | Transparent at rest |
| Composer dock | Padding 10px top / 13px sides / 20px bottom | None | Fade plus progressive blur |
| Composer outer | 1.5px padding creates the gradient outline | 27px | Gradient shell, not a solid CSS border |
| Composer inner | Padding 13px top / 13px sides / 10px bottom | 26px | Translucent gradient; background blur 25px |
| Input | Min-height 39px, max-height 130px; padding 2px / 4px | None | Transparent; no border |
| Composer action row | 5px top margin; 8px between left tools | — | — |
| Add file / Speak | Min-height 42px; padding 8px / 11px; icon 18px; gap 7px | 30px | No border |
| Send | 43 × 43px; icon 22px | Circle | Plum fill, subtle shadow |
| Disclaimer | 11px top margin, centered | — | No container |
| Attachment chip | Padding 10px; gap 10px; margin-bottom 10px | 13px | No border |
| Optional suggestion row | 7px gap; buttons min-height 38px, padding 8px / 13px | 30px | 1px outline |

Radius order for asymmetric values: top-left, top-right, bottom-right, bottom-left. Icon strokes are generally **1.6px**, round caps and joins; standard icon size is **22px**.

### Exact background and glass recipes

```css
/* Bottom layer first conceptually; CSS paints the first gradient on top. */
.ask-deborah-screen {
  background:
    radial-gradient(ellipse at 87% -10%, #e9dbee77, transparent 45%),
    radial-gradient(ellipse at 8% 100%, #ffdda344, transparent 45%),
    #f9f7f5;
}

.ask-deborah-header {
  background: #f9f7f57d;
  border-bottom: 1px solid #eee5eeaa;
  backdrop-filter: blur(25px);
}

.composer-dock {
  position: relative;
  background: linear-gradient(
    0deg, #f9f7f5 60%, #f9f7f5de 84%, #f9f7f500
  );
}
.composer-dock::before {
  content: "";
  position: absolute;
  inset: -30px 0 auto;
  height: 40px;
  backdrop-filter: blur(4px);
  mask-image: linear-gradient(transparent, #000);
  pointer-events: none;
}

.composer-outline {
  padding: 1.5px;
  border-radius: 27px;
  background: linear-gradient(
    115deg, #c7aad799, #e2c6deaa 34%, #f8d299 77%, #d6addf
  );
  box-shadow: 0 5px 25px #8e599010, 0 0 15px #f8d29922;
}
.composer-surface {
  border-radius: 26px;
  padding: 13px 13px 10px;
  background: linear-gradient(120deg, #ffffffed, #faf6fbe8);
  backdrop-filter: blur(25px);
}
.composer-outline:focus-within {
  box-shadow: -6px 3px 24px #ab7aca33, 7px 0 24px #f5c68533;
}

.user-message { box-shadow: inset 0 1px 0 #fff8; }
.reply-chip { box-shadow: 0 3px 12px #3a035303; }
.send-button { box-shadow: 0 3px 9px #3a035322; }
```

For Figma, create separate outer and inner composer frames. Keep the border gradient on the outer frame and inset the inner surface by 1.5px. Use **background blur**, not layer blur, on the header and glass surfaces. Keep the dock fade and its blurred top edge separate. A single opaque rounded rectangle will lose the softness in the screenshot.

### Interactive chat cards

These appear later in conversation; they are not visible in the supplied initial-chat screenshot.

| Container | Fill | Border | Radius / padding | Typography |
|---|---|---|---|---|
| Mood check-in | `linear-gradient(145deg, #F3E9F6, #FFF8EB)` | 1px white | 28px / 22px 16px | Title 17px, 500; labels 11px, `#81688C` |
| Quiet-moment card | Base `#2E193C`, with radial overlays below | None | 28px / 21px | Title 25px, 500, −0.7px; body 14px/1.6, `#D2BED9` |
| Evening plan | `linear-gradient(130deg, #F9DFB9, #F4E3E6 65%, #E7DCF1)` | 1px white | 28px / 21px | Title 25px, 500, −0.8px; items 16px/1.5 |
| Sleep observation | `linear-gradient(130deg, #EEE5F6, #F8EFEE)` | 1px white | 28px / 21px | Title 23px, 500; value Manrope 55px, 400, −3px; unit 16px `#93729E` |
| Visit notes / reflection | `#FFFFFF99` | 1px white | 25px / 22px | Title 21px, 500; list 16px/1.8, `#78627F` |
| File card | `#EFE6F3` | 1px white | 20px / 18px | File 15px, 500; metadata 12px `#967D9E` |
| Save-card action | `#FFFFFF99` | 1px `#FFFFFF88` | 50px / 13px 18px | 14px; minimum height 48px |
| Quiet-card action | `#FFFFFF13` | 1px `#FFFFFF33` | 50px / 14px 20px | White 14px; minimum height 50px; blur 20px |

Quiet-card overlays: `radial-gradient(ellipse at 80% 10%, #85558B66, transparent 60%), radial-gradient(ellipse at 10% 100%, #D6A86B33, transparent 65%)`. Its eyebrow is `#C9A9D6`, 10px.

Plan-item divider: 1px `#8A638918`. Checked item text: `#8A788B`, struck through. Checkbox accent: Mauve.

Mood faces: 1.5px `#B194BC` outline, `#FFFFFF77` fill. Selected fill `#E3C9EB`, outline `#804A8A`, mouth stroke `#9879A4`. Default face is 44px; Home overrides it to 43px; the original ≤360px chat rule uses 40px.

## 5. Home — Surfaces and type

| Component | Fill | Border | Radius |
|---|---|---|---:|
| Screen | `#F7F4F1` | None | None |
| Main Deborah card | `linear-gradient(135deg, #E9DFEE, #F7ECDF 70%, #F2D8B4)` | 1px white | 30px |
| Main card light overlay | `radial-gradient(ellipse at 100% 25%, #FFFFFF77, transparent 70%)` | None | Inherits clipping |
| Main card action strip | `#FFFFFF52` | 1px top `#FFFFFF66` | Inherits card clipping |
| Mood container | `#FFFFFFB8` | 1px white | 24px |
| Saved-moments tile | `#EAE3EF` | 1px white | 25px |
| Quiet-moment tile | `#F6E5CE` | 1px white | 25px |
| Starting-point card | `#FFFFFF88` | 1px `#E4D7E9` | 19px |
| Floating bottom navigation | `#FFFFFFBC` | 1px `#FFFFFFDF` | 30px |
| Active navigation item | `#EEE2F2` | None | 23px |
| Profile avatar | `linear-gradient(135deg, #EAD3EF, #F5D5B1)` | 1px white | Circle |

Home action strip: blur **20px**. Bottom navigation: blur **25px**, shadow `0 9px 35px #76548016`. Navigation sits 20px from the sides and bottom, with 8px inner padding. Its buttons have minimum height 53px, minimum width 60px, and 20px icons.

| Text style | Family | Size / weight | Line height / tracking | Color |
|---|---|---|---|---|
| Greeting | Manrope | 35px / 500 | 1.2 = 42px / −1.7px | Ink |
| Greeting italic | Georgia italic | 35px / 400 | Inherited / inherited | Mauve |
| Greeting eyebrow | DM Sans | 9px / 600 | normal / +1.6px | `#A189A8` |
| Profile context | DM Sans | 11px / 400 | normal | `#99839F` |
| Hero title | DM Sans | 26px / 500 | 1.22 = 31.72px / −1px | Ink |
| Hero description | DM Sans | 13px / 400 | 1.7 = 22.1px | `#927598` |
| Hero eyebrow | DM Sans | 9px / 600 | normal / +1.5px | `#96799F` |
| Hero action | DM Sans | 16px / 400 | normal | `#674470` |
| Section title | DM Sans | 18px / 500 | normal / −0.4px | Ink |
| Section annotation | DM Sans | 10px / 400 | normal | `#A48BAB` |
| Mood labels | DM Sans | 11px / 400 | normal | `#81688C` |
| Mood helper | DM Sans | 11px / 400 | normal | `#A38AAB` |
| Bento title | DM Sans | 17px / 500 | normal / −0.4px | Ink |
| Bento caption | DM Sans | 11px / 400 | normal | `#9B84A4` |
| Starting-point label | DM Sans | 14px / 400 | 1.5 = 21px | `#81638C` |
| Bottom navigation | DM Sans | 9px / 400 | normal | Inactive `#AA92B2`; active `#6A3E7E` |

Home content padding: **13px 23px 110px**. Hero padding: **22px 21px 0**; minimum height **249px**. Bento cards: **19px padding**, **158px min-height**, **11px grid gap**. Mood container: **17px 17px 13px** padding.

## 6. Profile setup — Surfaces, borders, and typography

| Component | Fill | Border / selected treatment | Radius |
|---|---|---|---:|
| Screen | `#F7F4F1` | None | None |
| Back circle | `#FFFFFFAD` | 1px `#E5DCE6` | Circle |
| Form input / select | `#FFFFFFAF` | 1px `#E0D2E5`; focus Mauve | 17px |
| Myself / family choice | `#FFFFFFB0` | 1px `#E5D8EB` | 24px |
| Selected profile choice | `#EEE2F3` | 1px `#B595C3` | 24px |
| Family details subcontainer | `#EEE6EF66` | 1px white | 24px |
| Sleep topic | `#EEE5F2` | 1px white | 27px |
| Energy topic | `#F8E4C5` | 1px white | 27px |
| Balance topic | `#E4E8DD` | 1px white | 27px |
| Something else topic | `#EDE8E8` | 1px white | 27px |
| Selected topic | Existing topic fill | **2px Mauve inset outline** (`outline-offset: -2px`) | 27px |
| Review card | `linear-gradient(130deg, #EAE0F1, #F6E7D2)` | 1px white | 24px |
| Review divider | Transparent | 1px top `#AC8AB321` | — |
| Ready note | `#EDE2F28C` | None | 15px |
| Error message | `#F7DFD9` | 1px `#EDC5C0` | 15px |
| Primary action | `#3A0353` | None | 100px |
| Footer dock | `linear-gradient(0deg, #F7F4F1 75%, #F7F4F1BB)` | 1px top `#FFFFFF77` | None |

Topic cards also carry a light overlay: `radial-gradient(ellipse at 100% 0%, #FFFFFF88, transparent 70%)`. Selected-topic shadow: `0 6px 25px #804A8A20`. Default-topic shadow: `0 5px 20px #522D5905`.

Topic selection indicator: **24 × 24px**, circle; default fill `#FFFFFF55`, border `#B799C655`, glyph `#8C6897`; selected fill Plum, glyph white. Card grid gap **10px**; effective minimum height **152px**.

| Text style | Font / weight | Size | Line height / tracking | Color |
|---|---|---:|---|---|
| Profile heading | Manrope 500 | 34px | 1.14 = 38.76px / −1.7px | Ink |
| Italic heading phrase | Georgia italic 400 | 34px | Inherits heading | Mauve |
| Description | DM Sans 400 | 16px | 1.65 = 26.4px | `#8B7692` |
| Top eyebrow | DM Sans 600 | 10px | normal / +2px | `#977B9F` |
| Field label | DM Sans 400 | 14px | normal | `#7C6285` |
| Input text | DM Sans 400 | 18px | normal | Ink |
| Input placeholder | DM Sans 400 | 18px | normal | `#B5A3BA` |
| Field helper | DM Sans 400 | 11px | 1.6 = 17.6px | `#A08BA6` |
| Topic label | DM Sans 400 | 18px | normal / −0.5px | Ink |
| Review name | DM Sans 500 | 23px | normal / −0.7px | Ink |
| Review description | DM Sans 400 | 14px | 1.6 = 22.4px | `#8B7095` |
| Primary action | DM Sans 400 | 17px | normal | White |
| Footer helper | DM Sans 400 | 10px | normal | `#A08BA6` |
| Error copy | DM Sans 400 | 14px | 1.6 = 22.4px | `#864238` |

Profile content: **24px horizontal padding**. Form controls: **56px min-height**, **15px padding**, **8px top gap**. Labels: **19px top margin**. Continue button: **57px min-height**, **16px 24px inherited padding**. Footer: **15px 24px 27px**, background blur **18px**.

Progress segments: **4px high**, radius **20px**, **5px gap**; incomplete `#E5DBE9`, completed Mauve.

## 7. Shared sheets, feedback, welcome, and splash

| Surface | Fill | Border | Geometry / effect |
|---|---|---|---|
| Sheet | `#FBF8FA` | 1px white | Radius 30px; shadow `0 35px 100px #24112844` |
| Sheet backdrop | `#321E4044` | None | Background blur 12px |
| Sheet field | White | 1px `#E1D2E7` | Radius 15px; padding 15px; text 18px Ink |
| Saved note | White | 1px `#E7DCE9` | Radius 18px; padding 16px; text 16px/1.7 |
| Toast | `#3A214AEF` | 1px `#FFFFFF33` | Radius 40px; blur 15px; shadow `0 10px 35px #3A035330` |
| Welcome | `#F8F5F1` | None | Lavender / peach decorative glow |
| Welcome floating tag | `#FFFFFF65` | 1px `#FFFFFF99` | Radius 50px; blur 20px; shadow `0 12px 35px #69456912` |
| Splash | `#2F143F` | None | Mauve / rose radial overlays |
| Splash enter button | `#FFFFFF0B` | 1px `#FFFFFF26` | Radius 35px; blur 15px; text `#EFDFED` |

Sheet title: **27px DM Sans 500**, −1px tracking. Sheet body: **16px / 1.7**, `#87718F`. Sheet padding: **25px**. On viewports ≤600px, sheets sit at the bottom with **30px 30px 0 0** corners and safe-area-aware bottom padding.

Toast text: **13px**, white. Welcome heading: **52px Manrope 500**, 1.06 line-height, −3px tracking; emphasis **Georgia italic 400**, Mauve, −2px tracking. On mobile ≤600px the heading uses `clamp(46px, 12vw, 58px)`; the ≤760px height rule then sets it to **46px**. Welcome body: **17px / 1.65**, `#766678`; short-height override **16px**.

Welcome glow: `radial-gradient(ellipse at 70% 20%, #E5D5ED, transparent 65%), radial-gradient(ellipse at 30% 70%, #F8D299AB, transparent 63%)`, layer blur **30px**.

Splash overlays: `radial-gradient(ellipse at -10% 10%, #AC7CAD70, transparent 55%), radial-gradient(ellipse at 100% 85%, #B4817A50, transparent 55%)`. Wordmark: **45px / 500**, −2.5px tracking; tagline **12px**, +2.5px tracking, `#CBB2D4`. Symbol: `#F5D5AA`.

## 8. Copy-ready semantic tokens

This block consolidates the main screenshot values into reusable CSS variables. It is an export, not a full replacement stylesheet.

```css
:root {
  /* Primitives */
  --color-plum: #3a0353;
  --color-mauve: #804a8a;
  --color-peach: #f8d299;
  --color-apricot: #f59e51;
  --color-ink: #302335;
  --color-muted: #766b78;
  --color-paper: #f7f4f1;
  --color-white: #ffffff;

  /* Typography */
  --font-body: 'DM Sans', Arial, sans-serif;
  --font-display: 'Manrope', Arial, sans-serif;
  --font-editorial: Georgia, serif;
  --font-chat-body-size: 18px;
  --font-chat-body-weight: 400;
  --font-chat-body-leading: 1.65;
  --font-chat-user-leading: 1.5;
  --font-chat-header-size: 19px;
  --font-chat-header-weight: 500;
  --font-chat-composer-size: 17px;
  --font-chat-composer-leading: 1.5;
  --font-chat-chip-size: 14px;
  --font-chat-tool-size: 12px;
  --font-chat-sender-size: 11px;
  --font-chat-status-size: 10px;
  --font-chat-footnote-size: 9px;
  --font-profile-heading-size: 34px;
  --font-home-heading-size: 35px;

  /* Ask Deborah */
  --chat-bg: #f9f7f5;
  --chat-bg-lavender: #e9dbee77;
  --chat-bg-peach: #ffdda344;
  --chat-header-bg: #f9f7f57d;
  --chat-header-border: #eee5eeaa;
  --chat-text: #4d3d54;
  --chat-sender-text: #95859a;
  --chat-meta-text: #9a899e;
  --chat-user-bg: #eadeef;
  --chat-user-text: #593467;
  --chat-chip-bg: #ffffffcc;
  --chat-chip-border: #e0d2e6;
  --chat-chip-text: #6e4b79;
  --chat-chip-hover-bg: #efe1f2;
  --chat-chip-hover-border: #c6abcf;
  --chat-composer-placeholder: #a394aa;
  --chat-composer-tool-bg: #f0e9f29c;
  --chat-composer-tool-text: #806c88;
  --chat-composer-footnote: #9a8d9f;
  --chat-composer-outline: linear-gradient(
    115deg, #c7aad799, #e2c6deaa 34%, #f8d299 77%, #d6addf
  );
  --chat-composer-fill: linear-gradient(120deg, #ffffffed, #faf6fbe8);
  --chat-composer-shadow: 0 5px 25px #8e599010, 0 0 15px #f8d29922;
  --chat-composer-focus-shadow: -6px 3px 24px #ab7aca33, 7px 0 24px #f5c68533;
  --chat-send-shadow: 0 3px 9px #3a035322;
  --chat-thread-padding: 25px 20px 20px;
  --chat-message-gap: 27px;
  --chat-chip-gap: 9px;
  --chat-composer-padding: 13px 13px 10px;
  --chat-composer-border-width: 1.5px;
  --chat-radius-user: 23px 23px 5px 23px;
  --chat-radius-chip: 40px;
  --chat-radius-composer: 27px;
  --chat-radius-composer-inner: 26px;
  --chat-radius-tool: 30px;

  /* Home */
  --home-hero-fill: linear-gradient(135deg, #e9dfee, #f7ecdf 70%, #f2d8b4);
  --home-mood-fill: #ffffffb8;
  --home-bento-lavender: #eae3ef;
  --home-bento-peach: #f6e5ce;
  --home-nav-fill: #ffffffbc;
  --home-nav-border: #ffffffdf;
  --home-nav-active-fill: #eee2f2;
  --home-nav-active-text: #6a3e7e;
  --home-nav-inactive-text: #aa92b2;

  /* Profile */
  --profile-input-fill: #ffffffaf;
  --profile-input-border: #e0d2e5;
  --profile-input-placeholder: #b5a3ba;
  --profile-label: #7c6285;
  --profile-description: #8b7692;
  --profile-focus-sleep: #eee5f2;
  --profile-focus-energy: #f8e4c5;
  --profile-focus-balance: #e4e8dd;
  --profile-focus-other: #ede8e8;
  --profile-review-fill: linear-gradient(130deg, #eae0f1, #f6e7d2);
  --profile-error-fill: #f7dfd9;
  --profile-error-border: #edc5c0;
  --profile-error-text: #864238;

  /* Shared effects */
  --focus-ring: 3px solid #b579c4;
  --focus-ring-offset: 4px;
  --blur-glass: 25px;
  --blur-soft-glass: 20px;
  --blur-profile-footer: 18px;
  --blur-dialog-backdrop: 12px;
  --blur-composer-edge: 4px;
  --ease-gentle: cubic-bezier(.2, .8, .2, 1);
}
```

### AI orb recipes

```css
/* Chat header: 31px circle. Sender row: same treatment, 21px circle. */
.ai-orb-small {
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 20%, #fff2ce, #e9bce6 25%, #9a63ac 60%, #47215c
  );
  box-shadow: inset 1px 2px 4px #fff6, 0 3px 8px #804a8a23;
}

/* Decorative welcome / home orb body. */
.ai-orb-large {
  border-radius: 50%;
  background: radial-gradient(
    circle at 31% 21%,
    #fff9e6 0%, #ffdab2 13%, #d5afdd 32%,
    #8f55a2 57%, #51296c 73%, #ecd6ec 94%
  );
  box-shadow:
    inset 3px 3px 9px #fffa,
    inset -8px -12px 25px #42145045,
    0 28px 40px #6b3d6530;
}
```

The large orb also has layered highlights and orbit rings. Its primary ring uses `1px solid #FFFFFF77`; the secondary uses `#EDCAED44`. Keep these decorative effects separate from the application’s semantic surface colors.

## 9. States, motion, and responsive handoff

- **Pressed buttons:** `transform: scale(.97)`.
- **Hover buttons:** `translateY(-2px)`; on touch this is not a required interaction cue.
- **Disabled buttons:** opacity `.55`; reply chips override to `.65`.
- **Focus ring:** 3px `#B579C4`, 4px offset. The composer uses its focus-within glow instead of a textarea outline.
- **Message entrance:** 550ms, opacity 0→1, translateY 15px→0, blur 4px→0, gentle easing.
- **Mobile screen entrance:** 420ms, opacity 0→1, translateX 22px→0.
- **Sheet entrance:** 300ms, opacity 0→1, translateY 25px→0.
- **Composer focus glow:** 500ms shadow transition.
- **Orb float:** 7s ease-in-out; 12px vertical travel. Inner highlight rotation: 24s linear.
- **Reduced motion:** existing CSS disables animations and transitions and uses non-smooth scrolling.

### Mobile versus preview frame

The desktop phone frame is **430px wide including a 7px white border** under global `box-sizing: border-box`; its interior is therefore **416px**. This frame is a preview presentation device, not an in-app container token. Its 43px corner radius, outer gradient background, and mock home indicator should not be baked into native screen designs.

At viewport widths **≤600px**, the phone frame becomes the full viewport, with no border, radius, or shadow. Chat typography stays at its mobile values. Respect the native safe areas:

```css
.chat-header-height { height: calc(78px + env(safe-area-inset-top)); }
.chat-composer-bottom { padding-bottom: max(20px, env(safe-area-inset-bottom)); }
.profile-footer-bottom { padding-bottom: max(27px, env(safe-area-inset-bottom)); }
.home-nav-bottom { bottom: max(20px, env(safe-area-inset-bottom)); }
```

### Figma organization

Use collections **Primitives**, **Semantic / Light**, and **Components**. Group component variables under `Chat/`, `Composer/`, `Home/`, and `Profile/`. Create text styles from the typography tables and effect styles for the composer, navigation, sheet, and primary action.

For an exact match, preserve the distinct paper colors (`#F7F4F1`, `#F9F7F5`, `#F8F5F1`) and component-specific lavender borders. Similar colors are intentional in this export; collapsing them into one gray would change the appearance. Reuse the gradient recipes as paint styles and keep transparency on individual fills.
