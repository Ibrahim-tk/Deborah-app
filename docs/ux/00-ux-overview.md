# UX overview — mobile app

Figma (wireframes v0.1): https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=44-986
Notion: Experience Blueprint › Story · UX Flows

## 1. Navigation map

```
First launch
  M-1.1 Splash ─► M-1.2 Welcome ─► M-1.3 Consent ─► Main
                     └ "Sign in" ─► M-4.3 Create account (sign-in mode) ─► Main

Main ─ Tab bar: [ Ask Deborah ] [ My Health ] [ Account ]      Avatar (top-left) ─► M-6.1 Profile switcher (sheet)
 │
 ├─ Ask Deborah ── M-2.1 Conversation  (states: empty, focused, intake, ready, generating, answered,
 │                    │                 error, safety, check-in, profile-banner)
 │                    ├─► M-2.7 Shop (modal, in-app browser)
 │                    ├─► M-2.8 Follow-up opt-in (sheet) ─► SystemAlert (permission)
 │                    ├─► M-4.1 Free limit (sheet) ─► M-4.2 Plans (modal stack) ─► M-4.3 ─► M-4.4 ─► M-4.5
 │                    ├─► M-5.3 Add labs (sheet) ─► M-5.4 Confirm results (modal) ─► back to M-2.1 (lab answer)
 │                    ├─► M-8.2 Booking info (push) ─► M-8.3 Scheduler ─► M-8.4 Confirmed
 │                    ├─► M-9.6 PDF preview (modal)   └─► M-9.4 Note editor (modal, "Save to Visit Notes")
 │                    └─► M-7.6 About Deborah (push, from (i) menu)
 │
 ├─ My Health ── M-7.1/7.2 Hub (empty / populated)
 │                    ├─► M-7.3 90-day plan ─► (Tell Deborah) ─► Ask tab, check-in
 │                    ├─► M-7.4 Content detail ─► (Ask about this) ─► Ask tab, prefilled
 │                    ├─► M-7.5 Library ─► M-7.4 · M-7.6 About Deborah ─► M-8.2
 │                    └─► M-9.1 Records [Consultations | Visit Notes | Labs]
 │                              ├─► M-9.2 Consultation detail ─► M-9.6 PDF · continue chat
 │                              ├─► M-9.4 Note editor
 │                              └─► M-9.5 Lab report
 │
 └─ Account ── M-10.1 Account ─► M-10.3 Subscription · M-6.5 Profiles · M-10.4 Notifications
                                  · M-10.2 Privacy & data · M-10.5 Terms & disclaimer · M-7.6 About · Sign out

Profile switcher (M-6.1) ─► switch · M-6.2 Add member (modal) / M-6.3 Upgrade (sheet) · M-6.5 Profile details
Device layer (shell): LockScreen + notification (M-5.1) ─► deep link ─► M-2.1 check-in
```

## 2. Screen inventory

| ID | Screen | Presentation | Flow | In Figma v0.1 |
|---|---|---|---|---|
| M-1.1 | Splash | root (pre-auth) | F01 | 1.1 |
| M-1.2 | Welcome | root (pre-auth) | F01 | 1.2 |
| M-1.3 | Consent | push (pre-auth) | F01 | 1.3 |
| M-2.1 | Conversation | tab root (ask) | F02/F03/F05/F06/F08 | 2.1–2.6, 3.1–3.4, 5.2, 5.5, 6.4, 8.1 (as states) |
| M-2.7 | Shop (in-app browser) | modal | F02 | 2.7 |
| M-2.8 | Follow-up opt-in | sheet (medium) | F02 | 2.8 |
| M-4.1 | Free limit | sheet (medium, not dismissible by drag) | F04 | 4.1 |
| M-4.2 | Choose plan | modal (stack "plans") | F04 | 4.2 |
| M-4.3 | Create account / Sign in | push in modal | F04 | 4.3 |
| M-4.4 | Store payment (simulated) | sheet over modal | F04 | 4.4 |
| M-4.5 | Plan success | push in modal | F04 | 4.5 |
| M-5.1 | Lock screen + notification | shell overlay | F05 | 5.1 |
| M-5.3 | Add lab results | sheet (medium) | F05 | 5.3 |
| M-5.4 | Confirm lab results | modal | F05 | 5.4 |
| M-6.1 | Profile switcher | sheet (medium) | F06 | 6.1 |
| M-6.2 | Add family member | modal | F06 | 6.2 |
| M-6.3 | Upgrade to Family | sheet (medium) | F06 | 6.3 |
| M-6.5 | Profile details | push | F06 | 6.5 |
| M-6.6 | Manage profiles (list) | push | F06 | NOT IN WIREFRAMES |
| M-7.1 | My Health — empty | tab root (health), state of hub | F07 | 7.1 |
| M-7.2 | My Health hub | tab root (health) | F07 | 7.2 |
| M-7.3 | 90-day plan | push | F07 | 7.3 |
| M-7.4 | Content detail | push | F07 | 7.4 |
| M-7.5 | Deborah's library | push | F07 | 7.5 |
| M-7.6 | About Deborah | push | F07 | 7.6 |
| M-8.2 | Booking info | push | F08 | 8.2 |
| M-8.3 | Scheduler (simulated) | push | F08 | 8.3 |
| M-8.4 | Booking confirmed | push (replaces stack top) | F08 | 8.4 |
| M-9.1 | Records | push | F09 | 9.1, 9.3 (segment) |
| M-9.2 | Consultation detail | push | F09 | 9.2 |
| M-9.4 | Note editor | modal | F09 | NOT IN WIREFRAMES |
| M-9.5 | Lab report | push | F09 | NOT IN WIREFRAMES (reuses 5.4 layout, read mode) |
| M-9.6 | PDF preview | modal | F09 | NOT IN WIREFRAMES |
| M-10.1 | Account | tab root (account) | F10 | 10.1 |
| M-10.2 | Privacy & data | push | F10 | 10.2 |
| M-10.3 | Subscription | push | F10 | NOT IN WIREFRAMES |
| M-10.4 | Notifications | push | F10 | NOT IN WIREFRAMES |
| M-10.5 | Terms & disclaimer | push | F10 | NOT IN WIREFRAMES |

Figma 2.2–2.6, 3.x, 5.2, 5.5, 6.4 and 8.1 are **states of M-2.1**, not separate screens. Figma 9.3 is the "Visit Notes" segment of M-9.1.

## 3. Global behaviours (apply everywhere)

| Behaviour | Rule |
|---|---|
| Active profile | Avatar (initial) top-left on tab roots; tap → M-6.1. Every profile-scoped screen reads `activeProfileId`. Non-self profiles show `ProfileBanner` in Conversation. |
| Disclaimer access | `(i)` on Conversation header opens an action sheet: "About this app & disclaimer" (→ M-10.5), "About Deborah" (→ M-7.6), "Book Deborah" (→ M-8.2). Also in Account. |
| Safety precedence | Emergency/crisis/out-of-scope replace normal replies anywhere Deborah responds (Conversation, check-in, profile chats). Never gated, never counted. |
| Free limit | Only gates *starting a new consultation*. Everything else stays usable. |
| Commerce | Product appears only in answer §6 and in 90-day plan/content detail related rows. Every product link opens M-2.7 (in-app browser) with `?ref=app`. Disclosure "Formulated by Deborah" always visible. |
| Notifications | Lock-screen/banner text is generic: never symptoms, conditions or product names. |
| Empty states | Every list has a designed empty state with a next action. |
| Loading | Skeletons for content lists (300–600 ms simulated), `ProgressStatus` for Deborah (no typing dots). |
| Errors | Friendly, Deborah-voice when in chat; system-voice elsewhere; always a retry or a way out. |
| Back | Header back on pushed screens; swipe-from-left-edge; close (×) on modals; drag-down/scrim on sheets. |
| Toasts | Confirm silent saves ("Saved to Visit Notes", "Copied"). 2.5 s, bottom above tab bar. |

## 4. F00 — Pre-app touchpoints (context only)

Search → Deborah's blog/Medium → YouTube → Shopify purchase → order email + newsletter (blogs, community, app link with `?ref=`) → App Store → first launch. Not built. If the prototype is opened with `?ref=newsletter`, M-1.2 may show "Welcome from the Genesis Gold family" (ASSUMPTION, optional vanity).

## 5. How to read the flow specs

Each screen section contains: **meta** (presentation, entry/exit, Figma, scenarios), **purpose**, **layout** (numbered top→bottom, numbers match the Figma tags where they exist), **interactions**, **states**, **data**, **acceptance criteria**, **open questions**.
