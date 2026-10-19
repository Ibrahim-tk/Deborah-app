# F02f — Family chat: conversation model + third-person script

> Status: **placeholder** draft for design review. All clinical wording needs Deborah's approval.
> No dosing, diagnoses or prescriptions. Safety behaviours (F03) always override this script.

## 1. Chat model: three building blocks

Every chat turn is one of three blocks. Nothing else.

| Block | Who | Looks like | Component (mobile) |
|---|---|---|---|
| **Query** | Client (the parent) | Purple bubble, right | `patterns/chat/MessageBubble` (role `user`) |
| **Answer** | Deborah | Plain open text, no bubble | `patterns/chat/MessageBubble` (role `deborah`), `AnswerSections` for long answers |
| **Widget** | Deborah asks for structured input or shows data | A design-system widget placed under an answer | Any of `patterns/widgets/*` |

Rules:
- **Widgets aren't tied to a question type.** A slot says "a widget goes here" plus the data it needs or shows. The widget is chosen per slot.
- **Who picks the widget:** for each slot below marked `WIDGET ▸ ?`, Claude asks the designer *"Which widget do you want here?"* before building. The candidates listed are only suggestions from the current inventory.
- **Data shown back** (for example, meds the parent listed) is a widget too: "visualise this data as X".
- **Third person throughout:** Deborah talks *to* the parent *about* the member, using the member's name and pronouns (`shared/engine/perspective.ts`).
- **Every widget answer echoes back as a Query bubble** (for example, "No, she isn't"), so the transcript reads as a conversation.

Slot notation used in the script:

```
WIDGET ▸ ?          purpose · data in / out · candidates
```

## 2. Script — "Emma is exhausted all the time"

Persona: parent (owner) asks about **Emma, 15, she/her**. Opener from the family quick start.

### Opening

**Query:** Why is Emma so exhausted all the time?

**Answer:** That's a real worry, and you're right to look into it. Tiredness in teens is common, but when it doesn't lift with sleep it's usually telling us something — about her sleep, her cycle, what she's eating, or how much she's carrying right now. Let me ask a few things so I understand Emma's days.

**Answer:** First — how long has she been feeling like this?

`WIDGET ▸ ?` duration · single choice: *A few weeks / 1–3 months / Longer than 3 months / Not sure* · candidates: `FullChoicePills`, `QuestionChoices`

### Sleep

**Query:** 1–3 months

**Answer:** A couple of months is long enough that it's worth taking seriously. Is Emma getting to sleep at a reasonable hour, or is she often up late — on her phone, studying, or just lying awake?

`WIDGET ▸ ?` sleep pattern · single choice: *Falls asleep fine / Up late on screens / Lies awake / Wakes in the night* · candidates: `FullChoicePills`, `InlineChoicePills`

**Query:** Lies awake

**Answer:** Lying awake usually means her mind or body isn't winding down. That can come from stress, from caffeine late in the day, or from hormones shifting. Does she seem more stressed or low than usual lately?

`WIDGET ▸ ?` mood · scale 1–5 *(very low → doing well)* · candidates: `MoodScale`, `ScaleCheck`

### Cycle (shown only if sex at birth = Female or Intersex, age ≥ 10)

**Answer:** Thank you. I'd also like to understand her cycle, because periods can affect energy a lot. Has Emma started her periods?

`WIDGET ▸ ?` yes / no · candidates: `FullChoicePills` (yes/no), `QuestionChoices`

- **Yes →** **Answer:** Are they fairly regular, or do they come and go? And are they heavy?
  `WIDGET ▸ ?` regularity + flow · two short choice sets · candidates: `QuestionChoices` ×2, `ChoicePills`
  - If *heavy* → **Answer:** Heavy periods are one of the most common reasons teens feel drained, because they can lower iron over time. That's something her provider can check with a simple blood test. *(placeholder — Deborah to approve)*
- **No →** **Answer:** That's helpful to know. At 15 that's still within the normal range for many girls, but it's worth mentioning to her provider alongside the tiredness.

### Medications — yes / no first, never "add your medications"

**Answer:** Some medicines and supplements can make people tired, or affect sleep. Is Emma taking anything regularly right now — prescriptions, over-the-counter medicines, or supplements?

`WIDGET ▸ ?` yes / no · candidates: `FullChoicePills` (Yes / No / Not sure)

- **No →**
  **Query:** No, she isn't.
  **Answer:** Good — that rules one thing out. → continue to *Food & energy*.

- **Not sure →**
  **Query:** I'm not sure.
  **Answer:** That's fine. If you can check her bathroom cabinet or ask her later, you can add anything from her profile. For now I'll carry on. → *Food & energy*. *(Records the meds as "unknown". Raises "check medications" in the visit brief.)*

- **Yes →**
  **Query:** Yes, she is.
  **Answer:** Thank you. What is she taking? Just the name is enough — and what it's for, if you know.
  `WIDGET ▸ ?` add entries · data out: `[{ name, reason }]` · candidates: `NamedReasonList` (Add medicine sheet)
  **Answer (follow-up, per entry):** How long has she been taking *{name}*?
  `WIDGET ▸ ?` duration · *< 1 month / 1–6 months / longer* · candidates: `InlineChoicePills`
  **Answer:** Did the tiredness start around the same time as any of these?
  `WIDGET ▸ ?` yes / no / not sure · candidates: `FullChoicePills`
  - *Yes* → **Answer:** That's important — please don't stop anything on your own, but do mention the timing to the provider who prescribed it. It's one of the first things they'll want to know. *(placeholder; never advise stopping or changing a dose)*
  - *No / Not sure* → **Answer:** Okay, noted.
  **Data shown back:** `WIDGET ▸ ?` summary of her meds · data in: entries + durations · candidates: `ConfirmCard`, `ReviewFactsCard`

### Food & energy

**Answer:** Last area. Does Emma usually eat breakfast, and does she get a proper meal at lunch?

`WIDGET ▸ ?` multi-select · *Skips breakfast / Light lunch / Snacks a lot / Eats well / Vegetarian or vegan* · candidates: `ChoicePills` (multi), `QuestionChoices`

**Query:** Skips breakfast · Vegetarian

**Answer:** That combination matters. Skipping breakfast can leave her running on empty by mid-morning, and a vegetarian diet needs a little planning to get enough iron and B12. Neither is a problem on its own, but together with lying awake and long-running tiredness, they're worth looking at.

### Answer (structured)

`AnswerSections` — third person throughout:
1. **What I'm hearing** — Emma has felt exhausted for 1–3 months, lies awake, often skips breakfast, eats vegetarian{, has heavy periods}{, started {med} around then}.
2. **What this may mean** — sleep that isn't restoring her, energy dips from meals, and possibly low iron or B12. *(placeholder)*
3. **Questions to ask her provider** — e.g. "Could we check her iron and B12?", "Could her {med} affect her sleep?" *(placeholder)*
4. **Small things to try this week** — a regular wind-down time, screens off an hour before bed, a simple breakfast. *(placeholder, non-clinical)*

`WIDGET ▸ ?` next step · candidates: `GuidanceNextSteps`, `BookDeborah`, `AnswerCTA`

**Closing (Answer):** You're doing the right thing by paying attention to this. Want me to save this to Emma's profile so it's ready for her next visit?

`WIDGET ▸ ?` save · candidates: `SaveProfileCard`, `ConfirmCard`

### Safety overrides (always on, F03)
If at any point the parent mentions fainting, chest pain, thoughts of self-harm, or very heavy bleeding, Deborah stops the script and shows the matching safety response. The script never resumes until that's handled.

## 3. Widget picks (designer, 2026-10-19)

| # | Slot | Widget |
|---|---|---|
| 1 | How long | `InlineChoicePills` |
| 2 | Sleep pattern | `InlineChoicePills` |
| 3 | Mood | `MoodScale` |
| 4 | Periods started? | `InlineChoicePills` |
| 5 | Regular? · Heavy? | `InlineChoicePills` ×2 |
| 6 | Taking anything? | `InlineChoicePills` (Yes / No / Not sure) |
| 7a | Medicine name | typed in the composer (no widget) |
| 7b | What it's for | `InlineChoicePills` + Other → type |
| 8 | How long on it | `InlineChoicePills` |
| 8b | Anything else? (loop back to 7a) | `InlineChoicePills` |
| 9 | Tiredness started around then? | `InlineChoicePills` |
| 10 | Meds recap | `ReviewFactsCard` |
| 11 | Food (multi) | `InlineChoicePills` multi-select |
| 12 | Next step | `GuidanceNextSteps` |
| 13 | Save to profile | `SaveProfileCard` |

## 4. Branch map (yes / no)

```
Opening ─ duration ─ sleep ─ mood ─┬─ [F/Intersex ≥10] periods? ─┬─ yes ─ regular/heavy ─┐
                                   │                             └─ no ──────────────────┤
                                   └─ (else) ────────────────────────────────────────────┤
                                                                                         ▼
                                        meds? ─┬─ no ──────────────────────────────┐
                                               ├─ not sure (flag) ─────────────────┤
                                               └─ yes ─ list ─ duration ─ timing? ─┤
                                                                                   ▼
                                                       food & energy ─ structured answer ─ next step ─ save
```

## 5. Open questions for design
- OPEN: Deborah to approve all clinical lines marked *(placeholder)*.
