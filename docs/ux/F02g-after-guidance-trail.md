# F02g — After-guidance trail (M-2.1)

**Goal:** After the seven answer frameworks and a short educational note, the thread follows one fixed trail so save-to-profile, consult, and next steps never compete for the same slot.

**UI:** `AnswerSections` → `ClosingLine` → `SaveHealthProfile` → bridge lines → `EscalationCard` → follow-up ask + two pills  
**Related:** [F02e-guidance.md](F02e-guidance.md) · [F02b-profile-aware-chat-intake.md](F02b-profile-aware-chat-intake.md) · [F08-book-deborah.md](F08-book-deborah.md)

**Status:** Designer direction 2026-10-21. Prototype applies this trail on scripted First Consult and free Conversation once guidance is given.

---

## Stack (top → bottom)

| # | Block | When | Pattern |
|---|---|---|---|
| 1 | Seven frameworks | Always after a full answer | `AnswerSections` (§1–§7). Product may sit in §6 when the answer carries one. |
| 2 | Small note | Always | Closing / disclaimer (`ClosingLine` + word-section footer). Educational, not clinical. |
| 3 | Save health profile | When this turn changed or suspected a change to the health profile | `SaveHealthProfile` — checkbox list (“Add this to your health profile”), not the old account `SaveProfileCard`. |
| 4 | Bridge copy | Always after the save card (or in its place if no facts) | **1–3 short lines** of Deborah voice. Soft handoff into consult / next step. |
| 5 | Consult ad | When she may want a human consult (including free-text “talk to me” paths) | `EscalationCard` — branded “Talk with Deborah directly” hero. |
| 6 | Follow-up ask + two pills | Always at the end of this trail | One question line + **exactly two** suggestion pills. |
| 7 | Genesis Gold learn-more | **All chats in this prototype flow** (for now) | One of the two pills is always **Learn more about Genesis Gold®**. The other is visit notes when applicable, otherwise a second soft follow-up. |

Composer starters / suggested questions under the input may still appear; they are not part of this trail.

---

## Save health profile (`SaveHealthProfile`)

- Title: **Add this to your health profile**
- One row per fact: small checkbox · label · one-line value
- Primary: **Save to my profile** (saves ticked rows only)
- × closes without saving
- Checkboxes use the compact `Checkbox` size (`sm`) — smaller than the default form control
- Prototype: if the engine has no pending facts yet, seed the same demo facts used in Sandra’s consult so every guidance turn can show the card

Do **not** use `SaveProfileCard` (“Save this to your profile?” / account providers) in this trail.

---

## Bridge lines (1–3)

Plain Deborah text after the save card. Examples (placeholder):

- “You’re noticing a pattern, and it’s worth keeping hold of.”
- “I’ve noted what we covered today so it’s ready if you need it later.”

Keep to three lines max. No third CTA here.

---

## Consult ad

`EscalationCard` (`sheet={false}`): aurora hero, Deborah cut-out, **Talk with Deborah**. Tap opens the request-sent sheet. Used instead of ActionTile / “Book a consult…” OptionRows.

---

## Follow-up ask + two pills

**Ask (default):**  
“Would you like to learn more about Genesis Gold®, or would visit notes be more useful right now?”

| Pill | Action |
|---|---|
| Learn more about Genesis Gold® | Product / learn-more path (`exit_product` / shop) |
| Create visit notes | Opens visit-notes / brief when applicable |

If visit notes do not apply (e.g. red-flag / no answer to save), the second pill is a soft follow-up (e.g. “Ask a follow-up”) instead — still only two pills.

---

## What this replaces

- `SaveProfileCard` / `SaveToProfile` in the post-answer stack
- `BookTile` / GuidanceNextSteps “Book a consult…” row as the primary consult CTA
- Long “What’s next?” OptionRow lists crowding the trail (booking and Genesis Gold live in the ad + pills)

---

## Acceptance

- [ ] After guidance, order matches the table above on First Consult and free Conversation
- [ ] Save card is the checkbox widget; checkboxes are compact `sm`
- [ ] EscalationCard appears below the bridge lines
- [ ] Exactly two pills; one is always Learn more about Genesis Gold® in this prototype pass
- [ ] No duplicate “Save this to your profile?” account card in the same trail
