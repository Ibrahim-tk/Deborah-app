# F08 — Book Deborah (human escalation)

**Goal:** when the app isn't enough, Maria can book Deborah herself. Never more than two taps from Conversation (`(i)` → Book).
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470
**Scenario:** S12

Entry points: EscalationCard (8.1), OutOfScopeReply, `(i)` menu, lab answer actions, M-7.6, Account.

```
EscalationCard ─► M-8.2 Booking info ─ Choose a time ─► M-8.3 Scheduler ─ Confirm ─► M-8.4 Confirmed ─► Back to chat / Add to calendar
```

---

## M-2.1 state · Escalation (Figma 8.1)
See F03 › EscalationCard. Appears after the normal reply when triggered.

## M-8.2 · Consult with Deborah

**Presentation:** push. **Layout:** header "Consult with Deborah" · **What to expect** card (length 50 min, video call, what to prepare: recent labs, medication list, questions — from `booking/slots.json`) · **Price** row (OPEN; show "Price shown at checkout" until known) · **Where do you live?** state Select (required) · checkbox **Share my app history with Deborah for this visit** (default off; explicit consent) · primary **Choose a time** (disabled until state chosen).

**Behaviour:** if `statesLicensed` is non-empty and the chosen state isn't in it → inline notice "Deborah can't see patients in {state} yet. Get notified when she can" + **Notify me** (toast). Empty list = accept all (prototype).

## M-8.3 · Pick a time (simulated scheduler)

**Presentation:** push (not a web view — a native-feeling mock). **Layout:** week strip (dates from simulated clock) · slot grid for selected day (from `slots.json`, unavailable greyed) · summary bar at bottom: "{day}, {time} · 50 min" + **Confirm booking**.

**Behaviour:** Confirm → 1 s processing → `booking.book()` → replace with M-8.4. Schedules a booking reminder notification 1 day before (simulated).

**Open:** real telehealth system and payment.

## M-8.4 · Booking confirmed

**Layout:** check animation · "Booked with Deborah" · date/time · "We'll remind you the day before." · actions **Add to calendar** (toast demo) · **View details** (read mode of this screen with Cancel booking → SystemAlert) · link **Back to chat**.

**Acceptance (flow):** [ ] Booking appears in M-7.2 CheckInCard area as "Upcoming: consult with Deborah". [ ] Booking reminder via Simulate events works.
