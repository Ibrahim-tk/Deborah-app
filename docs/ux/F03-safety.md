# F03 — Safety & guardrails

**Goal:** honest, immediate, system-level safety behaviour wherever Deborah responds. These are **states/patterns inside M-2.1**, not screens.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-180
**Engine:** `docs/07-ai-simulation.md §3` · **Scenario:** S13 Safety test bench (dev option rows insert test phrases)

**Precedence:** emergency > crisis > medication (additive) > out-of-scope > escalation > normal.
**Never:** counted as a consultation, gated by the free limit, accompanied by a product card.

---

## Pattern · EmergencyInterrupt (Figma 3.1)

**Trigger:** emergency patterns in any user message (also during intake or check-in).

**Layout**
1. Full-width card, strongest emphasis in the system (thick border / danger tone), alert icon.
2. Title "This could be an emergency." Body "Please call 911 now or go to the nearest emergency room. Don't wait."
3. **Call 911** — primary, largest button on screen (`tel:911`; in prototype → SystemAlert "Call 911?" [Cancel] [Call] → toast "Calling… (demo)").
4. **Find nearest ER** — secondary (prototype → toast "Opens Maps (demo)").
5. **I'm safe — this isn't happening now** — link.

**Behaviour**
| Trigger | Result |
|---|---|
| Appears | Any streaming answer is cancelled; thinking stops; composer locked with note "Please get help first." Conversation `status: 'safety'`. |
| Call 911 / Find ER | Simulated; composer stays locked |
| I'm safe | Logs acknowledgement; card collapses to a compact "Emergency guidance shown" text line with alert icon; composer unlocks; Deborah: "Thank you for letting me know. What would you like to talk about?" |

**Acceptance:** [ ] Appears before any other Deborah content for that message. [ ] Not counted. [ ] Works on trial with 0 left.

---

## Pattern · MedicationSafetyCard (Figma 3.2)

**Trigger:** medication patterns. **Additive** — the normal flow continues after the card.

**Layout:** medicine icon · title "Medication safety" · body "I can't prescribe or tell you to start or stop a medication. Please check with your prescriber or pharmacist first." · link row **Check interactions on drugs.com →** (opens M-2.7-style in-app browser with the drugs.com URL label; mock page).

**Behaviour:** card renders as its own Deborah message; then the engine continues (intake answer, follow-up reply or answer). Shown at most once per conversation unless a new medication name appears.

**Acceptance:** [ ] Never contains dosing. [ ] Appears even inside intake when the user types a medication.

---

## Pattern · CrisisSupportCard (Figma 3.3)

**Trigger:** crisis patterns.

**Layout:** calm tone (not alarm red) · "You're not alone. If you're having thoughts of harming yourself, please reach out right now." · **Call or text 988** (primary; simulated SystemAlert) · **More ways to get support** (expands inline list: crisis text line, talk to someone you trust, emergency 911) · **Keep talking with Deborah** link.

**Behaviour:** conversation continues afterwards; product cards suppressed for the rest of this conversation; next Deborah reply is gentle and short (generic script line).

**Open:** exact behaviour and copy with Deborah + attorney (SOW requires crisis safeguards). Non-US users (out of scope for prototype).

---

## Pattern · OutOfScopeReply (Figma 3.4)

**Trigger:** out-of-scope patterns, or no script match with low confidence for clearly non-health topics.

**Layout:** Deborah bubble with honest scope line · **EscalationCard (compact)** "Want my personal opinion? Book a consultation with me →" (→ M-8.2) · "Things I can help with:" + 3 in-scope option rows (from suggestions).

**Acceptance:** [ ] Not counted. [ ] Options start a normal consultation.

---

## Pattern · EscalationCard (used by F08 8.1)

**Trigger:** escalation phrases, or `unresolvedConsultations ≥ 3` on the same topic (S12).

**Layout:** Deborah line "It sounds like your situation deserves a personal look. I'd like you to talk with me directly." · primary **Book a consultation with Deborah** (→ M-8.2) · secondary text "Not now".

---

## Dev-only: Safety test bench (S13)
Above the composer, a dashed "DEV" option list (only in S13): *Emergency*, *Medication*, *Crisis*, *Out of scope*, *Escalation*. Tapping inserts a canonical test phrase into the composer. Hidden in every other scenario.
