# F01 — First launch & onboarding

**Goal:** get Maria into her first conversation in under a minute while capturing the legally required consent. No account at this point; the trial runs on the device (ASSUMPTION — account is created at conversion, F04).
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184
**Scenarios:** S01

```
M-1.1 Splash ──(auto 1.6 s)──► M-1.2 Welcome ──Get started (accepts terms)──► M-2.1 Conversation (empty, disclaimer line)
                                   └─ Sign in ──► M-4.3 (sign-in mode, as modal) ──► M-2.1 with restored history

M-2.1 first message ──► health-data consent ──► safety gates* ──► topic questions ──► country check ──► answer
                            └─ Not now: no health questions, general answer, no supplement card
answer (first useful one) ──► "Save your profile" card ──► M-4.3 (Apple · Google · email + password) ──► M-2.8 notifications
                                   └─ Not now ──► M-2.8 notifications
* date of birth, sex at birth, medications & supplements, allergies — only when the answer would recommend a supplement.
```

> **Change 2026-10-12 (design):** the health profile is collected in the chat, not as a form (see "Health profile in chat" and "4 · After the first useful answer" below).

> **Change 2026-10-08 (design):** consent is merged into M-1.2. "Get started" saves the name, accepts the Terms & Privacy notice (timestamp + version) and opens M-2.1. A small line under the button reads "By tapping Get started, you agree to the Terms & Disclaimer and Privacy Notice (HIPAA)." with underlined links opening M-10.5. M-1.3 is kept in code but no longer in the flow. OPEN: legal to confirm a checkbox is not required.

---

## M-1.1 · Splash

| Meta | |
|---|---|
| Presentation | Root of pre-auth stack, status bar light |
| Entry | App launch when `consentAcceptedAt` is empty |
| Exit | Auto → M-1.2 (fade 400 ms) after 1.6 s; if consent exists (returning user) → Main, tab `ask` |

**Purpose:** brand moment while the app "loads".

**Layout**
1. Full-bleed brand background.
2. Centered logo mark + "Your Oracle Clinician" wordmark (fade + slight scale-in 600 ms).
3. Tagline under the wordmark: "Your trusted guide through every step of your healthcare journey" (fades in 300 ms after the wordmark).
4. Small "by Deborah Maragopoulos FNP" at the bottom safe area.

**Interactions:** none (tap does nothing; no skip needed at 1.6 s).

**States:** default only. Reduced motion → no scale, plain fade.

**Acceptance**
- [ ] Never shows for a user who already consented (they land on Main).
- [ ] Duration ≤ 1.6 s; transition is a crossfade.

---

## M-1.2 · Welcome

| Meta | |
|---|---|
| Presentation | Pre-auth stack (replaces Splash) |
| Entry | From M-1.1 |
| Exit | Continue → M-1.3 (push). Sign in → M-4.3 in sign-in mode (modal) |

**Purpose:** a human, warm first contact; collect only the first name; disclose that this is an AI version of Deborah.

**Layout (Figma tags)**
1. **Deborah portrait** (large, rounded or arched crop; placeholder image). Subtle gentle zoom on enter.
2. **Welcome note** in Deborah's voice, 2–3 short sentences, ends with the AI disclosure sentence. Source: `persona/deborah.json` + `legal/consent.json.aiDisclosure` (short form). Status placeholder.
3. **Name input** — label "What should I call you?", placeholder "First name", `autocapitalize="words"`, `autocomplete="given-name"`, max 30 chars, Enter submits.
4. **Continue** (primary, full width) — disabled until trimmed name length ≥ 1.
5. **"Already have an account? Sign in"** link.

**Interactions**
| Trigger | Result |
|---|---|
| Type name | Button enables; live "Hi, {name}" micro-echo under the input (optional vanity, 200 ms fade) |
| Continue / Enter | `session.setName(name)`; push M-1.3 |
| Sign in | Present M-4.3 in `mode: 'signin'`; success → restore scenario-like history (uses S11 world) → Main |
| Keyboard open | Content scrolls so input + button stay visible above keyboard |

**States:** default · name filled · keyboard open · returning from M-1.3 via back (name preserved).

**Validation:** trim whitespace; letters, spaces, hyphens, apostrophes allowed; otherwise inline error "Just your first name is perfect."

**Acceptance**
- [ ] Only one field on the screen.
- [ ] AI disclosure sentence visible without scrolling at 393×852.
- [ ] Name persists if user goes back and forth.

**Open:** real portrait photography; final welcome copy from Deborah.

---

## M-1.3 · Before we begin (consent)

| Meta | |
|---|---|
| Presentation | Push (pre-auth stack); header with back + title "Before we begin" |
| Entry | M-1.2 Continue |
| Exit | "I agree, let's start" → `resetTo(main, M-2.1)` with fade |

**Purpose:** click-to-accept disclaimer and AI disclosure required by the brief and SOW, presented calmly and scannably.

**Layout**
1. **Plain-language summary** card: 4–5 short bullets — "This app is… / This app is not…" (education & wellness guidance; not diagnosis, not prescriptions, not emergency care; in an emergency call 911).
2. **AI disclosure** card: "You're talking to an AI trained only on Deborah's published work."
3. **Checkbox** "I have read and agree to the **Terms & Disclaimer**" — link opens M-10.5 as a modal (read-only, scrollable, "Done").
4. **Privacy row** "How your health data is protected (HIPAA / CCPA)" — opens privacy text in the same modal (tab or anchor).
5. Spacer.
6. **"I agree, let's start"** primary button — disabled until checkbox checked.

**Interactions**
| Trigger | Result |
|---|---|
| Tap checkbox or its label | Toggle; button enables |
| Terms / Privacy links | Modal with full text; closing returns with checkbox state untouched |
| I agree | `session.acceptConsent({ version })` stores timestamp + version; navigate to Main → M-2.1 empty |
| Back | Return to M-1.2 |

**States:** unchecked (button disabled) · checked · reading terms (modal).

**Acceptance**
- [ ] Impossible to reach Main without accepting.
- [ ] Consent timestamp + version saved in store (visible in M-10.5 "Accepted on …").
- [ ] Summary readable in under 20 seconds (≤ 60 words).

**Open:** attorney-drafted copy (brief, SOW). Whether the privacy notice needs its own checkbox (legal).

---

## Onboarding order (design direction 2026-10-15, onboarding plan P-01 to P-10)

**Splash (M-1.1) → Welcome (M-1.2) → sign-up sheet (M-1.4: email + password, 6-digit code, You're in) →
Onboarding profile (M-1.8) → Deborah's welcome (M-1.9) → first conversation (M-2.1).**
This reverses the 12 Oct meeting's "no account before Deborah" (requirement A), as directed on 15 Oct. The account
exists before the chat, so there is no save-your-profile card or guest sign-up sheet anywhere after it (P-10).

Two profiles, built at different times:
- **Onboarding profile** (M-1.8, before the chat): who it's for, relationship and first name for someone else,
  date of birth, consent for someone else, sex at birth, gender identity, then age×gender intake branches from the
  PDF. Saved straight to the profile (decision D-4).
- **Health profile** (in the chat): stage, medications, allergies, conditions, symptoms. Asked only when needed,
  saved only through Review and Confirm (F02b).

## M-1.8 · Onboarding profile

Full screen, one step at a time, the tree grows as you go (`data/intake/healthBasics.json`, `showIf` branches):

| Branch | Steps | Then |
|---|---|---|
| Myself, 13+ | Who → date of birth → sex at birth → gender identity → age×gender bank (e.g. Female: periods, reproductive, peri HRT, meds, supplements, Genesis Gold) | M-1.9 "Start chatting" → chat as you |
| Myself, under 13 | Who → date of birth | **M-1.10** Ask a parent (PDF age gate) |
| Someone else, 18+ | Who → relationship → first name → DOB → consent → sex at birth → gender identity → adult bank | M-1.9 "Start talking about {name}" → switch profile → chat about them |
| Someone else, 13–17 | … → teen consent → sex → identity → teen bank | same; teen script, no product |
| Someone else, under 13 | … → guardian attestation → sex → identity → child basics | same; minor rules, no product |

- Full date of birth (D-1); **sex at birth** then **gender identity** are both mandatory (D-2).
- Consent copy by age group lives in `legal/consent.json › profileConsent` (placeholder pending legal review).
- Someone else is allowed on any plan as the first person added (D-3); M-6.1 still asks to upgrade for more.
- Boys under 18 get only neutral how-long / how-often questions in chat (no cycle questions). OPEN: child and male-teen banks.

## M-1.10 · Ask a parent

Root screen in the pre-auth stack, replacing M-1.8 when **your own** date of birth is under 13. Deborah's orb, "Let's bring in a parent", a short line that a
parent or guardian sets things up for anyone under 13, and **Back to the start** (→ M-1.2).
OPEN (O-2): "Can someone under 13 sign up for themselves?" Documented default: no (PDF). A parent can already add a teen or child as "someone I care for". Copy is placeholder pending legal review.

## M-2.1 · First-chat disclaimer

One quiet dismissible line above the suggestions on the empty chat: "Not a substitute for professional care. In an emergency, call local services." (`legal/consent.json › careLine`, placeholder). Shown once: dismissing it or sending the first message retires it (`disclaimerSeenAt`).

## Health profile in chat

The profile is built around the problem: fields are asked only when they become relevant, as intake questions (`conversation/intake.json`).

| When | Fields | Rule |
|---|---|---|
| First time the chat asks about health | **Consent to process health data** ("Yes, that's okay" / "Not now") | Separate from the T&C; stored as `healthConsentAt`. No Skip. "Not now" drops every health question in that consultation; the answer stays general with no supplement card. OPEN: ask again next consultation (default) or only from Account › Privacy? |
| Before any answer that recommends a supplement or medication | Date of birth, sex at birth, current medications & supplements, allergies (`safetyGates`) | Skipping is allowed, but any missing gate removes the supplement card from that answer. Date of birth also sets the age band, so the topic's age question isn't repeated. |
| Later, when the topic needs it | Known conditions (topic intake), height & weight (thyroid script) | Topic intake stays capped at 3 questions. |
| Once | Country | Inferred from the device locale; only asked to confirm ("Yes, United States" / "Somewhere else…"). No Skip. |

Questions already answered are never asked again. Consent and the country check aren't numbered in the "n of N" footer. Scenario replays skip all of this so seeded histories stay unchanged.

## 4 · After the first useful answer

- **Save your profile** card in the chat right after the first answer, shown once (`saveProfileOfferedAt`) and only without an account: Continue with Apple, Continue with Google, Continue with email, Not now. A name-only user is anonymous; health data needs an account behind it.
- The buttons open M-4.3 (`returnTo: 'chat'`). Email asks for email, password (8+ characters) and an optional last name, then the code check. On success the modal closes, the card reads "Profile saved to …" and a toast confirms.
- **Notification permission** (M-2.8) is asked right after the card is resolved (saved or Not now), never at launch.
