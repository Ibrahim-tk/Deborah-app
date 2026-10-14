# F02c · Sign-up → profile → first consultation (scripted journey)

> **Status: DRAFT / placeholder copy.** Every Deborah line, option and answer needs Deborah's clinical
> sign-off (CLAUDE.md › clinical copy). Built in `data/conversation/flows/firstConsult.json`, played by M-2.12.

## The promise

Deborah reads the profile before she says a word. She **never asks what the profile already answers**
(age, sex at birth, hormonal stage, HRT, medications, supplements, allergies, conditions). She says what
she knows once, so the person feels remembered, and then only asks what the profile cannot tell her:
*what's bothering you, how much, how long* — and the safety screen.

## Journey

| # | Screen | What happens | Tone |
|---|---|---|---|
| 1 | M-1.2 Welcome → M-1.4 Sign up | Name, email or Apple. | Quiet, quick. |
| 2 | M-1.8 Health basics | Who it's for · birth year · sex · identity · hormonal stage · HRT · meds · supplements · allergies · conditions. Fast form, one per screen. | A form, not a chat. |
| 3 | M-1.9 Deborah's welcome | "Thank you, {name}… how are you feeling today?" → *Start my journey*. | Warm hand-off. |
| 4 | M-2.12 opener | **MoodScale**: "Hi {name}. Before we get into anything, how are you feeling today, honestly?" First tap asks health-data consent; the profile is saved then. | Personal. |
| 5 | Context | "Thank you for telling me. I've read everything you shared, so you won't need to repeat yourself." + the facts she knows (age · stage · meds) as plain text. | "I remember you." |
| 6 | Topic | "What would you most like help with right now?" (rows). | Open. |
| 7 | Q1 · symptoms | Multi-select pills: "Which of these have you noticed too?" ("None of these" exclusive). | Curious. |
| 8 | Q2 · impact | **ScaleCheck** 0–10: "How much is this getting in the way of your days?" | Validating. |
| 9 | Q3 · duration | Pills: "How long has this been going on?" | — |
| — | *(skipped)* | "Where are you with your periods?" — only asked when the profile has no hormonal stage. | Never repeats. |
| 10 | Safety screen | "Last one, just to be safe…" red flags (multi, "None of these" exclusive). Any flag → F03 safety card. | Calm. |
| 11 | Thinking | Steps name *her* inputs (symptoms · her medicine · her stage). | — |
| 12 | 7-section answer | §1 repeats back what she said with her own words, numbers and profile. Product only in §6, with a medication note when meds are on file. | Deborah's voice. |
| 13 | Follow-up | Suggested reply about her own medication → short conversational answer, added to visit prep. | — |
| 14 | Visit prep | One page of questions and tests for her provider. | Practical. |
| 15 | Labs | **UploadCard**: "If you have recent labs, I can read them alongside this." · *Maybe later*. | Optional. |
| 16 | Booking | **SlotPicker** → **ConfirmCard** ("Confirm booking"). · *Not right now* skips to 18. | Optional, no pressure. |
| 17 | Booked | "You're booked. I'll have your notes in front of me." | — |
| 18 | Check-in | **ReminderCard** toggle: sleep check-in in two weeks. Generic lock-screen copy. | Caring. |
| 19 | Close | "Sleep well tonight, {name}." → keep talking. | — |

## Profile → chat rules

| Profile field | Used as | Question skipped |
|---|---|---|
| name | `{name}` everywhere | — |
| birth year | `{age}` in §1, §4 | age |
| reproductive | `{stage}` in context, §1, thinking | "Where are you with your periods?" |
| medications / supplements | `{meds}` in context, §4, §6 note, follow-up | "Any medications?" |
| conditions | context line | "Any conditions?" |

## Open

- **OPEN:** only the *sleep / night sweats* answer is scripted; other topics reuse it. Live engine needed for the rest.
- **OPEN:** male journey (F02b §4) is not scripted for the first consult.
- **OPEN:** booking price and card on the ConfirmCard are placeholders (no payment, simulated).

## Returning user (signed in) — `returningConsult.json`, seed R01

Different on purpose: a new user is *met*; a returning user is *remembered*.

| # | What happens | Widget |
|---|---|---|
| 1 | "Welcome back, Maria… Last time we talked about your night sweats and broken sleep. How have the last two weeks felt?" | MoodScale |
| 2 | "Did the changes we talked about help?" (cooler room, earlier dinner, morning light) | Pills |
| 3 | Gentle acknowledgement, whatever she says. | — |
| 4 | "How would you rate your sleep this week?" — tracked against last time. | ScaleCheck |
| 5 | "I still have your estradiol patch and progesterone on file…" — memory, no re-asking. | — |
| 6 | "What's on your mind today?" → *Something new* → her message (2am heart flutters). | Pills |
| 7 | Safety check first, then 4 new questions, then she chooses when to see the answer. | Rows / free text |
| 8 | 7-section answer → Genesis Gold dosing by weight (asked only here) → saved to Visit Notes. | — |
| 9 | "Because the flutters are new, I'd like to hear about them myself." | SlotPicker → ConfirmCard |
| 10 | Check-in next week on the 2am wake-ups. | ReminderCard |

## Chat chrome (both)

- Header: back on the left, a **new chat** page icon on the right. The info button is gone.
  OPEN: "About Deborah / disclaimer" now live only in Settings and the composer footnote.
- Composer: a **Symptoms** button opens a sheet with search, common symptoms grouped by area, and
  "Add '…'" for anything rare. Picked symptoms go into the draft as one editable sentence.
