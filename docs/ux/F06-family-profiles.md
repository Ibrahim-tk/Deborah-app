# F06 — Family profiles

**Goal:** Maria adds her daughter; every profile has its own intake, history, labs, plan and notes. Histories never mix.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203
**Scenarios:** S09 (family, daughter), S10 (individual wants family)

```
Avatar ─► M-6.1 switcher ─ tap profile ─► switch (ask & health stacks reset to that profile)
                        ├ + Add member ─► [family plan & < 5] M-6.2 ─► Create ─► switch to new profile ─► M-2.1 empty (teen suggestions)
                        │                 [other plans] M-6.3 ─► M-4.2 (Family preselected)
                        └ Manage profiles ─► M-6.6 list ─► M-6.5 details
```

---

## M-6.1 · Profile switcher

| Meta | |
|---|---|
| Presentation | Sheet, medium (large if > 3 profiles) |
| Entry | Avatar on any tab root; M-4.5 secondary; Account › Family profiles |

**Layout:** title "Who is this for?" · `ProfileSwitcherList` rows: avatar (initial), name, relationship label ("You", "Daughter"), check on active · **+ Add a family member** (dashed row; shows lock icon + "Family plan" as plain text when not on Family) · link **Manage profiles**.

**Interactions:** tap row → `switchProfile(id)`, dismiss, toast "Now asking for {name}", Conversation shows that profile's latest conversation/empty state. Add → M-6.2 or M-6.3. Manage → M-6.6.

**Acceptance:** [ ] Switching mid-stream doesn't move the stream. [ ] Active profile visibly marked.

---

## M-6.2 · Add family member

| Meta | |
|---|---|
| Presentation | Modal; header × + title "Add family member" |

**Layout:** First name · Relationship (Select: Daughter, Son, Partner, Parent, Other) · Date of birth (date picker) · Sex at birth (Select) · **Consent checkbox** "I am their parent/legal guardian and have their consent" (shown for under-18; for adults shows "They know I'm adding them and agree" — ASSUMPTION) · primary **Create profile** (disabled until valid).

**Validation:** name required; DOB required, not in future; under 13 → inline notice "Profiles for children under 13 need extra consent steps" + disabled (OPEN: COPPA rules — prototype blocks under 13).

**Behaviour:** create → `profiles.addProfile` → dismiss → switch to new profile → Conversation empty with greeting "Let's talk about {name}." and teen suggestion set.

**Open:** teen privacy (can the teen have her own login?), adult consent model (husband), whether male health is in scope.

---

## M-6.3 · Upgrade to Family

**Presentation:** sheet. **Layout:** "Family profiles are part of the Family plan" · "Up to 5 people, each with their own private history." · primary **Upgrade to Family** → M-4.2 (Family preselected; on success return to M-6.2) · link **Not now**.

---

## M-2.1 state · Chat for another profile (Figma 6.4)

- Header avatar shows the profile's initial; **ProfileBanner** "Asking for: Daughter (teen) · switch".
- Intake adapts (teen bank: cycle onset, regularity) and refers to the profile in third person ("How long has she been having periods?").
- Answers use the `teen-irregular-periods` script; **product card suppressed** (ASSUMPTION pending Deborah).

---

## M-6.5 · Profile details

| Meta | |
|---|---|
| Presentation | Push; header back + name + **Edit** |

**Layout:** Basics (name, age, relationship) · Health info from intake (conditions, medications, cycle notes) — each row editable · links: Consultations (n) → M-9.1 filtered · Visit Notes → M-9.1 notes · Lab results → M-9.1 labs · destructive **Delete this profile and its data** (not for self).

**Behaviour:** Edit toggles inline editing; Delete → SystemAlert "Delete {name}'s profile? This permanently deletes their history." [Cancel] [Delete] → remove → switch to self → toast.

## M-6.6 · Manage profiles (NOT IN WIREFRAMES)
Simple list of profiles with chevrons → M-6.5, count "n of 5", **Add a family member** row.
