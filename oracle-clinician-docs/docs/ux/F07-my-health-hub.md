# F07 — My Health hub

**Goal:** a personal home for the active profile — what Deborah and Maria are working on, progress between consultations, records, and Deborah's content picked for her. Replaces a generic Explore tab.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
**Scenarios:** S11 (empty), S08 (populated), S09 (daughter's hub)

```
Tab My Health ─► M-7.1 (no consultations) | M-7.2 (has consultations)
M-7.2 ─ Focus card ─► Ask tab, that conversation
      ─ Plan card ─► M-7.3 ─ Tell Deborah ─► Ask tab, check-in
      ─ Check-in card ─► Ask tab, check-in (if due) / schedule reminder (M-10.4)
      ─ History | Visit Notes | Labs ─► M-9.1 (segment)
      ─ For you item ─► M-7.4 ─ Ask about this ─► Ask tab (prefilled) · product ─► M-2.7
      ─ Browse library ─► M-7.5 ─► M-7.4 · community (external) · M-7.6 ─► M-8.2
```

---

## M-7.1 · My Health — first time (empty state of the hub)

**Shown when** the active profile has no completed consultation.

**Layout:** header "My Health" + avatar · illustration/empty block: "Your health picture builds as you talk with Deborah. Nothing here yet." · primary **Start my first consultation** (→ Ask tab, focused composer) · "Popular starting points from Deborah" + 2–3 `ContentCard`s (newest library items) · tab bar.

**Acceptance:** [ ] Tab is never blank. [ ] Becomes M-7.2 automatically after the first answer.

---

## M-7.2 · My Health hub

| Meta | |
|---|---|
| Presentation | Tab root (health), large title "My Health" |
| Entry | Tab bar; M-5.4 flows; scenarios |

**Layout (top → bottom)**
1. Header: avatar (→ M-6.1), title.
2. **FocusCard** — "Current focus: {topic}" · "From your consultation on {date}" · chevron. Source: latest counted conversation summary.
3. **PlanProgressCard** — "Your 90-day plan · Day {n} of 90" · thin progress bar · "{x} of {y} habits this week". Hidden if no plan.
4. **CheckInCard** — "Next check-in with Deborah: in {n} days" (or "Due today" with button **Check in now**). If reminders off: "Turn on check-in reminders" → M-10.4.
5. **QuickLinks** row: **History · Visit Notes · Labs** (each shows its count as plain text, e.g. "Labs · 1").
6. "For you from Deborah" + 2–3 **ContentCard**s with reason line ("Because you asked about sleep").
7. Link **Browse all of Deborah's library**.
8. Tab bar.

**States:** loading (skeleton cards 400 ms on first open) · populated · daughter profile (her focus, her plan, teen-appropriate content) · plan complete (day > 90: "You finished your 90 days — tell Deborah how it went").

**Interactions:** each card tappable as described in the map; pull-to-refresh (visual only, 600 ms).

**Acceptance:** [ ] All content follows the active profile. [ ] Day counter uses simulated clock (fast-forward updates it). [ ] Every card has a destination.

**Open:** habit tracking/90-day plan is a design proposal, not in the brief — needs Deborah's approval.

---

## M-7.3 · Your 90-day plan

**Presentation:** push. **Layout:** goal card (from answer, Deborah's words) · "This week" habit list (`HabitRow`: checkbox, text, small "from section 6" source tag) · product row "Genesis Gold · Day {n} of 90 · **Reorder →**" (→ M-2.7) · primary **Tell Deborah how it's going** (→ Ask tab, `mode: 'checkin'`).

**Interactions:** tap habit → toggles done for today with a gentle check animation (no streaks, no guilt copy); long-press → "Remove habit".

**Acceptance:** [ ] Habits generated from the answer's `habitsForPlan`. [ ] Toggling updates hub progress.

---

## M-7.4 · For-you content detail

**Presentation:** push; header back + share. **Layout:** media block (video: poster + play button → plays a looping placeholder or shows "Video plays here (demo)"; article: readable text column) · reason chip "Why you're seeing this: you asked about {topic}" · title, date, summary · primary **Ask Deborah about this** (→ Ask tab with composer prefilled "I watched '{title}' — …") · related product row (if any) → M-2.7.

---

## M-7.5 · Deborah's library

**Presentation:** push. **Layout:** search field · Segmented control (For you · All · New) + "Topic" select row · list of `ContentCard`s (type icon, title, duration/read time, date) · **Join the community (Facebook group) →** (external-link icon; SystemAlert "Leave the app to open Facebook?" → toast demo) · **About Deborah →** (M-7.6).

**States:** default ("For you" selected) · filtered · search with results · no results ("Nothing found. Try 'sleep' or ask Deborah directly." + button to Ask).

---

## M-7.6 · About Deborah

**Presentation:** push. **Layout:** portrait · name + credentials ("Deborah Maragopoulos FNP — The Hormone Queen®", 30+ years) · philosophy paragraph · books list · primary **Book a consultation with Deborah** (→ M-8.2).
**Open:** real photography, approved bio.
