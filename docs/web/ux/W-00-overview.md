# Web app — UX overview (W-x.y)

**Status:** ASSUMPTION — written in phase 9 without a web brief, derived from the mobile specs (`docs/ux/F01–F10`). Every product decision below that the mobile specs don't already make is marked ASSUMPTION. Visual rules: `DESIGN.web.md`.

The web app is the **desktop companion** to the iPhone app: the same account, profiles, conversations, labs, notes, plan and bookings (one shared store and engine), laid out for a desk. Behaviour follows the mobile spec of the same number unless a section here says otherwise. **Safety behaviours (F03) are identical and never gated.**

## 1. Routes and screen map

```
/web                      → redirect: /web/welcome if no consent, else /web/ask
/web/welcome              W-1.2 Welcome + W-1.3 Consent (one page, two steps)
/web/ask                  W-2.1 Conversation (+ context panel)
/web/health               W-7.1 / W-7.2 My Health hub
/web/health/plan          W-7.3 90-day plan
/web/health/library       W-7.5 Library        /web/health/library/:itemId   W-7.4 Content detail
/web/health/about         W-7.6 About Deborah
/web/health/records/:segment                   W-9.1 Records (consultations | notes | labs)
/web/health/records/consultations/:id          W-9.2 Consultation detail
/web/health/records/labs/:id                   W-9.5 Lab report
/web/book                 W-8.2 Book Deborah → /web/book/time W-8.3 → /web/book/confirmed/:id W-8.4
/web/account              W-10.1 Account (sections: profile, plan, family, notifications, privacy, legal)
/web/account/family/:profileId                 W-6.5 Profile details

Dialogs (over any route): W-2.7 Shop · W-4.1 Free limit · W-4.2 Choose plan → W-4.4 Checkout → W-4.5 Success ·
W-5.3 Add labs → W-5.4 Check results · W-6.1 Profile switcher (popover) · W-6.2 Add member · W-6.3 Upgrade to Family ·
W-9.4 Note editor · W-9.6 PDF preview · W-10.5 Terms & disclaimer · confirmations
```

Not on web (ASSUMPTION): M-1.1 Splash (no app launch), M-2.8 follow-up opt-in (no push on web; reminders are set in Account › Notifications and arrive in the iPhone app), M-5.1 lock screen, M-4.3 as a separate screen (sign-in is a step inside the checkout dialog when there is no account).

## 2. Global behaviour

| Behaviour | Web rule |
|---|---|
| App shell | Left sidebar: brand · profile switcher (avatar + name + relationship; opens W-6.1 popover) · nav (Ask Deborah, My Health, Account) · trial counter as plain text when on trial · "Book Deborah" link. |
| Active profile | Same as mobile: every profile-scoped page reads `activeProfileId`; switching resets nothing on web except the current page's data (routes are URLs). Non-self profile shows the ProfileBanner above the chat. |
| Onboarding | Until consent exists, every `/web/*` route redirects to `/web/welcome`. Name → consent → `/web/ask`. "Sign in" restores an account (same store action as mobile). |
| Free limit | Same counting and gate as mobile (engine). Gate opens W-4.1 dialog; held text stays in the composer and is sent after purchase. |
| Purchases | ASSUMPTION: web uses a simulated card checkout ("Stripe for web sign-ups", F04 OPEN) — card fields accept anything, 1.2 s processing, no SDK, no network. |
| Notifications | No browser notifications (ASSUMPTION). Account › Notifications changes the same reminder settings the phone uses. |
| Toasts | Bottom-centre of the main column, 2.5 s. |
| Errors / empty | As mobile; every list has an empty state with a next action. |
| Keyboard | Enter sends; Shift+Enter newline; Escape closes dialogs/popovers; `/` focuses the composer on /web/ask. |

## 3. Screens (deltas from the mobile spec)

### W-1.2 / W-1.3 · Welcome & consent — `/web/welcome`
Two-column page: left, Deborah's portrait panel (Midnight surface, welcome note); right, step 1 name field + Continue, step 2 consent summary bullets + AI disclosure + checkbox links (Terms, Privacy) + "I agree, let's start". Link "I already have an account" → sign-in step (email → code) → restore account → `/web/ask`. Acceptance: one field per step; cannot reach `/web/ask` without accepting; consent version + timestamp saved.

### W-2.1 · Conversation — `/web/ask`
Chat column (same states as M-2.1: empty greeting + suggestions as option rows, intake option rows in up to 2 columns, ready CTA, streaming answer with AnswerSections, actions, error, stopped, safety cards, check-in, profile banner) and the **context panel**: active profile card (name, age band, conditions as plain text), "Current focus" (latest topic), "Recent consultations" (3 rows → W-9.2), "Your 90-day plan · Day n" link, "Book a consultation with Deborah". Header actions: New conversation, About & disclaimer (W-10.5). Acceptance: identical engine behaviour to mobile (same store); safety never gated; composer locked while generating and during an unacknowledged emergency; answer actions include Save PDF (W-9.6) and Save to Visit Notes.

### W-7.1 / W-7.2 · My Health — `/web/health`
Page title "My Health". Empty state as M-7.1. Populated: 3-column card grid — Focus (span 2) · Plan progress; Check-in / upcoming booking · Records quick links (History · Visit Notes · Labs with counts); "For you from Deborah" row of 3 content cards; link to library. Acceptance as M-7.2.

### W-7.3 · 90-day plan — `/web/health/plan`
Goal panel, "This week" habit list (click toggles today; a "Remove" text button appears on hover/focus instead of long-press), product row, "Tell Deborah how it's going" → `/web/ask` check-in.

### W-7.4 / W-7.5 / W-7.6 · Library, content, About Deborah
Library: search + segmented (For you · All · New) + topic select; results in a 2–3 column card grid. Content detail: reading column (article/lesson text) or a 16:9 video placeholder; "Ask Deborah about this" → `/web/ask` prefilled. About: portrait, credentials, philosophy, books, "Book a consultation".

### W-8.2 – W-8.4 · Book Deborah — `/web/book`
One page with three steps in a stepper (Details → Time → Confirmed) instead of three pushes. Details as M-8.2; Time shows the week as 7 columns with slot buttons in each (unavailable greyed); summary + Confirm on the right. Confirmed: details, Add to calendar (toast), Cancel booking (confirm dialog), Back to chat.

### W-9.1 / W-9.2 / W-9.5 · Records
Records: tabs (segmented) Consultations | Visit Notes | Labs as URL segments; list rows; empty states; "+ New note" (W-9.4 dialog), "+ Add labs" (W-5.3 dialog). Consultation detail: transcript + answer in the reading column, actions in a right rail (Download PDF, Share, Continue chat). Lab report: definition grid; Edit (W-5.4 in edit mode), Delete (confirm), Ask Deborah about these labs.

### W-10.1 · Account — `/web/account`
One settings page with anchored sections (left mini-nav): Profile & plan (W-10.3 content: plan card, change plan → W-4.2, cancel), Family profiles (W-6.6 list → W-6.5 page; Add member → W-6.2 or W-6.3), Notifications (W-10.4), Privacy & data (W-10.2: download, delete account with typed DELETE confirmation), Terms & disclaimer (W-10.5), Sign out (confirm → `/web/welcome`).

### Dialogs
W-4.1/4.2/4.4/4.5, W-5.3/5.4, W-6.1/6.2/6.3, W-9.4, W-9.6, W-10.5 follow their mobile specs' content and validation exactly, presented as dialogs (`DESIGN.web.md` › Dialogs). W-5.3 on web: "Upload a PDF or photo" (file input) and "Enter values manually" (no camera).

## 4. Scenarios

The web uses the **same scenarios** (S01–S13) — the store is shared. The State menu on the web tab lists them and loading one navigates the web app to the matching route (S01 → /web/welcome; S08, S11 → /web/health; S10 → /web/ask with the profile switcher open; others → /web/ask). Simulate events that only make sense on a phone (lock screen, notifications) are hidden on web.

## 5. Open questions (carried from mobile + new)
- Is the web app subscription-capable (Stripe) or read-and-chat only? (ASSUMPTION: full parity, simulated card checkout.)
- Should web send email reminders instead of push? (ASSUMPTION: no web reminders.)
- Phone-width web layout? (ASSUMPTION: not supported; ≥ 1024 px.)
