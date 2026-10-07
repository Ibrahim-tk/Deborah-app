# F04 — Free limit, plans & account

**Goal:** convert after value has been delivered; create the account at this moment so first launch stays name-only.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
**Scenarios:** S05 (last free), S06 (exhausted), S10 (upgrade path)

```
3rd answer completes ─► (on next action or 4 s idle at answer end) M-4.1 sheet
M-4.1 See plans ─► M-4.2 (modal "plans") ─► [no account] M-4.3 ─► M-4.4 store sheet ─► M-4.5 ─► back to M-2.1 (composer restored)
                                           └ [has account] ─────────► M-4.4 ─► M-4.5
```

---

## M-4.1 · Free limit reached

| Meta | |
|---|---|
| Presentation | Sheet, medium; not dismissible by drag (explicit "Maybe later") |
| Entry | Trying to start a new consultation with 0 free left; or after the 3rd answer when the user next acts |
| Exit | See plans → M-4.2 · Maybe later → dismiss |

**Layout:** small Deborah avatar · title "You've used your 3 free consultations" · body "Your answers are saved. Choose a plan to keep talking with me." · primary **See plans** · link **Maybe later**.

**Behaviour:** If triggered by a send, the unsent text stays in the composer and is sent automatically after a successful purchase (M-4.5 "Continue my conversation"). After "Maybe later", composer shows a slim locked hint "Choose a plan to start a new consultation" (tap → M-4.1).

**Acceptance:** [ ] Never appears mid-answer or mid-intake. [ ] Safety messages still work after dismissal.

---

## M-4.2 · Choose your plan

| Meta | |
|---|---|
| Presentation | Full-screen modal, own stack `plans`; header × |
| Entry | M-4.1, M-6.3, M-10.3 (change plan) |

**Layout**
1. Title "Choose your plan", subtitle "Cancel anytime."
2. **Segmented** Monthly | Annual (annual shows "Save about 17 %" as plain text under the control; values from `plans.json`).
3. **PlanCard × 3** (Individual · Family · Premium): name, price per period, 2–3 feature lines, profile count. Selected = emphasised border + check. "Most chosen" as a plain Gold Ink text line on the `recommended` card, which also gets a Linen background.
4. Context line when entered from M-6.3: Family preselected.
5. Primary **Continue** (label includes price: "Continue — $39/month").
6. Footer links: Restore purchase · Terms · Privacy.

**Interactions:** select card · toggle billing (prices animate) · Continue → (no account ? push M-4.3 : present M-4.4) · Restore → toast "No purchases to restore (demo)".

**Acceptance:** [ ] One plan always selected (default from entry context, else recommended). [ ] Current plan (for subscribers) shows "Current plan" and Continue becomes "Switch plan".

**Open:** recommended plan; prices/annual pricing; Premium + family.

---

## M-4.3 · Save your health history (create account / sign in)

| Meta | |
|---|---|
| Presentation | Push inside plans modal (or own modal in sign-in mode from M-1.2) |
| Params | `{ mode: 'create' | 'signin' }` |

**Layout:** title "Save your health history" (sign-in: "Welcome back") · one-line why · **Continue with Apple** · **Continue with Google** · **Continue with email** · link "Why do I need an account?" (inline expandable: sync across devices, secure encrypted storage, your trial history moves with you).

**Email path (inline, same screen):** email field → Continue → **Verification code** step (6 boxes, auto-advance, any code accepted, "Resend" timer 30 s) → success.

**Behaviour:** Apple/Google show a 1.2 s simulated system sheet ("Continue as maria@…"). Success → `session.accountId` set; trial history migrated; continue to M-4.4 (create) or Main (sign-in).

**Acceptance:** [ ] MFA/verification step represented. [ ] No real auth calls.

---

## M-4.4 · Store payment (simulated)

| Meta | |
|---|---|
| Presentation | Sheet over the modal, styled like the iOS App Store subscription sheet |

**Layout:** app icon + name · plan + period + price · "Renews automatically" line · account row · **Double-click to pay** / **Subscribe** button → spinner 1.2 s → checkmark "Done".

**Behaviour:** success → `subscription.purchase(plan, billing)`, `renewsAt` set; push M-4.5. Cancel → back to M-4.2.

**Open (blocking for real build, not for prototype):** brief says Stripe, but in-app digital subscriptions on iOS/Android must use IAP. Likely IAP in-app + Stripe for web sign-ups.

---

## M-4.5 · You're all set

**Layout:** success mark (subtle confetti-free animation) · "You're all set, {name}" · "Unlimited consultations are unlocked." · primary **Continue my conversation** · secondary **Add a family member** (Family plan only → M-6.2).

**Behaviour:** Continue → dismiss modal, Conversation; if a message was held, send it now.
**Acceptance:** [ ] TrialCounter disappears everywhere.
