# F02b · Profile-aware chat intake (female & male journeys)

> **Status: BUILT as placeholder (core experience, 2026-10-15).** The journeys run from
> `src/shared/data/conversation/chatIntake.json` through `src/shared/engine/journey.ts`. Every question, option and
> red flag is still placeholder copy and needs Deborah's clinical sign-off (CLAUDE.md › clinical copy).
> Changes from the draft below: medications and allergies are asked as product safety gates *after* the topic
> questions; height and weight are no longer gates; the female stage is asked in chat (Basic details no longer
> asks it); a non-emergency red flag leads to a provider-directed seven-section answer after review, with no product or consultation charge. Emergency selections keep the urgent safety intervention.

## 1. The idea

Real Deborah never asks a woman about her prostate or a man about his periods, and she never asks again
what you already told her. The simulated Deborah should behave the same way:

1. **Health profile first** (M-1.8, `data/intake/healthBasics.json`) collects the persistent basics:
   who it's for, year of birth, sex at birth, identity, hormonal stage, HRT, medications, supplements,
   allergies, conditions.
2. **The chat reads that profile as context.** When a consultation starts, Deborah picks a *journey*
   from the profile (female or male, then a sub-path), and asks **only the few questions that journey
   still needs**, one at a time, inside the Ask Deborah chat.
3. **Never re-ask.** Anything the profile already answers is skipped, and Deborah *says* what she
   already knows ("I know you're postmenopausal and on levothyroxine…") so the user feels remembered.

### Conversation rules (both journeys)

| Rule | Detail |
|---|---|
| Journey choice | `sexAtBirth` decides female vs male. Intersex → female path with the male hormone chips (see §5). |
| Sub-path | Female: by `reproductive` (cycling / peri / post / pregnant / not sure). Male: by age band (<40 / 40–54 / 55+). |
| Topic first | Deborah first asks what's going on (or uses the starter the user tapped). The topic narrows the questions. |
| Max questions | **3 clarifiers per topic** + 1 red-flag screen. Then she answers. "Show me what you found" skips ahead any time. |
| One at a time | Each question is its own Deborah message with option rows (DESIGN.md: rows, not pills) and a Skip. |
| Red flags first | The red-flag screen is always the last question before the answer. Any red flag → safety card (F03), no hormone-only answer. |
| Safety gates | Pregnant / breastfeeding → no supplement or product suggestions; Deborah answers educationally and points to her provider. Medication on file → interaction note in §6 of the answer. |
| Free limit | Questions never count; only the answer counts (F04 rule unchanged). |

## 2. What the chat already knows (from the profile)

| Profile field | Example | Used for |
|---|---|---|
| `profileFor` | Myself | Wording ("you" vs "Emma") |
| `birthYear` → age band | 1964 → 62 | Male sub-path; screening relevance |
| `sexAtBirth` | Female | Journey |
| `genderIdentity` | Woman | Pronouns only, never the journey |
| `reproductive` | Postmenopausal | Female sub-path |
| `hrt` | No | Skips HRT questions; changes answer framing |
| `medications` | Levothyroxine | Skip "any meds?"; thyroid branch; interaction notes |
| `supplements` | Magnesium | Skip; interaction notes |
| `allergies` | None | Product safety gate |
| `conditions` | Hypothyroidism, PCOS… | Branch selection (e.g. PCOS → cycle/insulin questions) |

---

## 3. Female journey

**Opener (all female paths):**
> "Thanks, Linda. I already know you're postmenopausal and take levothyroxine. What's been bothering you most lately?"

Options: Sleep · Energy · Hot flashes or sweats · Mood or anxiety · Weight · Something else (type)

### 3a. Cycling (regular periods)

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | How regular are your periods? | Like clockwork · A few days off · Unpredictable · Very heavy or painful | Always on this path |
| 2 | When do you feel worst in your cycle? | The week before my period · During my period · Mid-cycle · No pattern | Topic is mood, sleep, energy or weight |
| 3 | Are you using hormonal birth control? | No · Pill · IUD (hormonal) · Implant or injection · Other | Birth control **not** already in meds |
| 4 | Have you been trying to conceive, or might you be pregnant? | No · Trying · Possibly | Age < 45 |
| — | PCOS on file → instead of Q1: Have your cycles been longer than 35 days lately? | Yes · No · Not sure | `conditions` has PCOS |

### 3b. Perimenopause

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | How have your periods changed? | Closer together · Further apart · Heavier · Skipping months | Always on this path |
| 2 | Which of these are you noticing? (multi) | Hot flashes · Night sweats · Waking at 3am · Brain fog · Anxiety · Low libido | Always |
| 3 | How long has this been going on? | A few weeks · 1–6 months · 6+ months · Years | Always |
| 4 | Have you talked to anyone about HRT? | Not yet · Considering it · Tried and stopped | `hrt` = No / Not sure |

### 3c. Postmenopause

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | How long ago did your periods stop? | Under a year · 1–5 years · Over 5 years · Hysterectomy | Always on this path |
| 2 | Which of these are you noticing? (multi) | Night sweats · Poor sleep · Vaginal dryness · Urinary urgency · Joint aches · Weight around the middle | Always |
| 3 | How is your HRT working for you? | Well · Some symptoms back · Side effects · Thinking of stopping | `hrt` = Yes |
| 4 | Have you had a bone density scan? | Yes, normal · Yes, low · Never | Age 60+ or topic is joints/bones |

### 3d. Pregnant or breastfeeding (safety-gated)

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | Are you pregnant or breastfeeding right now? | Pregnant · Breastfeeding | Always |
| 2 | Is your midwife or OB aware of what you're feeling? | Yes · Not yet | Always |

Then: educational answer only, **no product card, no supplement doses**, strong "talk to your provider" framing.

### 3e. Not sure / doesn't apply

| # | Deborah asks | Options |
|---|---|---|
| 1 | When was your last period? | This month · 1–12 months ago · Over a year · I don't have periods |

The answer re-routes to 3a / 3b / 3c and is saved back to the profile.

### Female red-flag screen (always last)

> "Last one. Have you had any of these lately?" (multi, "None of these" is exclusive)

Bleeding after menopause · A new breast lump · Fever with night sweats · Weight loss I can't explain · Chest pain or fainting · None of these

A non-emergency red flag → review and truthful saved/not-saved confirmation → provider-directed seven-section answer. No product or trial charge. Emergency selections → existing F03 urgent intervention.

---

## 4. Male journey

**Opener (all male paths):**
> "Thanks, James. I know you're 52 and not on any medication. What's been bothering you most lately?"

Options: Energy · Sleep · Weight · Mood or stress · Libido · Something else (type)

### 4a. Energy, libido & testosterone (the core male path)

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | Which of these sound like you? (multi) | Tired by mid-afternoon · Lower sex drive · Fewer morning erections · Losing muscle · Less motivation | Topic is energy, libido or mood |
| 2 | How long have you felt this way? | Weeks · Months · Over a year | Always |
| 3 | Have you ever had your testosterone checked? | Yes, it was low · Yes, normal · Never | Testosterone **not** in meds |
| 4 | How is your TRT going? | Well · Symptoms back · Side effects | Testosterone **in** meds |

### 4b. Sleep

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | Has anyone told you that you snore or stop breathing in your sleep? | Yes · No · I sleep alone | Topic is sleep or energy |
| 2 | Do you wake up to urinate at night? | No · Once · Twice or more | Age 45+ |
| 3 | How many hours do you usually sleep? | Under 5 · 5–6 · 7–8 · Over 8 | Always |

### 4c. Weight & metabolism

| # | Deborah asks | Options | Shown when |
|---|---|---|---|
| 1 | Where do you carry most of the weight? | Around my waist · All over · It's been changing | Topic is weight |
| 2 | Has a doctor mentioned blood sugar or cholesterol? | Blood sugar · Cholesterol · Both · No | Type 2 diabetes / high BP **not** already in conditions |
| 3 | How much do you move in a typical week? | Rarely · 1–2 times · 3+ times | Always |

### 4d. Age-specific (added to any male topic)

| Age band | Extra question | Options |
|---|---|---|
| 40–54 | Any changes in how often you urinate, or a weaker stream? | No · Sometimes · Yes |
| 55+ | When did you last have a PSA or prostate check? | This year · 1–3 years ago · Never |

(Still max 3 clarifiers in total; age questions replace the lowest-priority topic question.)

### Male red-flag screen (always last)

> "Last one. Have you had any of these lately?" (multi, "None of these" is exclusive)

Chest pain or shortness of breath · Blood in urine · A testicular lump · Weight loss I can't explain · Fever with night sweats · None of these

Non-emergency red flags use the provider-directed framework after review; emergency selections retain F03 intervention. Neither consumes a consultation.

---

## 5. Intersex and edge cases

| Case | Behaviour |
|---|---|
| Intersex | Female journey (cycle-based sub-path), with Testosterone / Low testosterone chips and both red-flag lists merged. OPEN: Deborah to define. |
| Identity ≠ sex at birth | Journey follows **sex at birth** (biology), wording follows **identity** (pronouns, "you"). Never mention the mismatch. |
| Profile for someone else | Same journeys, third person ("Is Emma using birth control?"). Under 18 → teen path (F06), not these. |
| Skipped profile fields | Deborah asks the missing basic first (e.g. "Where are you with your periods?"), once, then continues. |
| User types instead of tapping | The typed text is matched to an option where possible; otherwise saved as "Other" and the flow continues. |

---

## 6. Example transcripts

**Female, postmenopausal, on levothyroxine, topic "sleep":**
1. Deborah: "Thanks, Linda. I already know you're postmenopausal and take levothyroxine. What's been bothering you most lately?" → *Sleep*
2. "How long ago did your periods stop?" → *1–5 years*
3. "Which of these are you noticing?" → *Night sweats, Poor sleep*
4. "Have you had a bone density scan?" → *Skip*
5. Red-flag screen → *None of these*
6. Thinking ("your night sweats · your thyroid medicine · life after menopause") → 7-section answer.

**Male, 52, no meds, topic "energy":**
1. "Thanks, James. I know you're 52 and not on any medication. What's been bothering you most lately?" → *Energy*
2. "Which of these sound like you?" → *Tired by mid-afternoon, Lower sex drive*
3. "Have you ever had your testosterone checked?" → *Never*
4. "Any changes in how often you urinate, or a weaker stream?" → *No*
5. Red-flag screen → *None of these*
6. Thinking ("your energy · your hormones · your age") → 7-section answer.

---

## 7. How it would be built locally (no backend)

One JSON question bank, read by the existing engine with the **same `showIf` evaluator** the health
profile already uses (`shared/engine/showIf.ts`). Profile answers are the variables.

```jsonc
// src/shared/data/conversation/chatIntake.json (proposed)
{
  "status": "placeholder",
  "journeys": [
    {
      "id": "female-post",
      "when": { "sex": { "in": ["female", "intersex"] }, "reproductive": { "in": ["postmenopausal"] } },
      "opener": "Thanks, {name}. I already know {knownFacts}. What's been bothering you most lately?",
      "questions": [
        { "id": "years-since", "ask": "How long ago did your periods stop?", "options": ["Under a year", "1–5 years", "Over 5 years", "Hysterectomy"] },
        { "id": "post-symptoms", "ask": "Which of these are you noticing?", "multi": true, "options": ["Night sweats", "…"] },
        { "id": "hrt-check", "ask": "How is your HRT working for you?", "showIf": { "hrt": { "in": ["yes"] } }, "options": ["…"] },
        { "id": "bone-scan", "ask": "Have you had a bone density scan?", "showIf": { "ageBand": { "in": ["60+"] } }, "options": ["…"] }
      ],
      "redFlags": "female"
    },
    {
      "id": "male-core",
      "when": { "sex": { "in": ["male"] } },
      "questions": [
        { "id": "t-symptoms", "ask": "Which of these sound like you?", "multi": true, "options": ["…"] },
        { "id": "t-checked", "ask": "Have you ever had your testosterone checked?", "showIf": { "meds": { "notIn": ["Testosterone"] } }, "options": ["…"] }
      ],
      "redFlags": "male"
    }
  ],
  "redFlags": {
    "female": ["Bleeding after menopause", "A new breast lump", "Fever with night sweats", "Weight loss I can't explain", "Chest pain or fainting"],
    "male":   ["Chest pain or shortness of breath", "Blood in urine", "A testicular lump", "Weight loss I can't explain", "Fever with night sweats"]
  }
}
```

Flow at chat start:

1. Build the variables from the profile (`sex`, `ageBand`, `reproductive`, `hrt`, `meds`, `conditions`).
2. Pick the **first journey whose `when` matches**.
3. Keep the questions whose `showIf` passes and whose answer isn't already known; take the top 3.
4. Append the journey's red-flag screen.
5. Play them through the existing scripted-flow player (M-2.12 `useFlowPlayer`) or the main engine's intake
   step, then the normal thinking → 7-section answer.

Editing a question, adding a branch or changing who sees what is then a JSON change, not code.

---

## Review and Confirm

Meeting 2026-10-12 · B: the AI must not silently update the health profile.

- The engine never writes the profile. Every answer to a profile question, and anything picked up from what she
  typed (`extract.ts`), becomes a **pending fact** on the conversation (`Conversation.facts`). Pending facts count
  as known inside that conversation, so nothing is asked twice, but they are not on the profile.
- After a normal answer (or before the provider-review framework), Deborah shows the **ReviewFactsCard**: one row per fact with a checkbox,
  **Save to my profile** (ticked rows), **Edit** (opens M-2.13), **Don't save**. Afterwards it is one line saying
  what was saved.
- **M-2.13 · What Deborah noted** (large sheet): tap a fact to change it (the same options as the question, or text
  for facts from a message), then Save to my profile or Don't save.
- Only `confirmFacts` writes the profile. Confirmed facts are listed on the My Health Health profile card (M-7.2; M-2.10 removed 2026-10-20) with
  the date; list facts also fill the structured health profile marked "confirmed in chat".
- Declining health-data consent drops every pending fact in that conversation.
- Scenario replays (seeded histories) settle their facts: no card in seeded conversations.

## Decision nodes and sources

Every node traces to the 12 October meeting (MTG), a safety rule (SAFETY) or an existing spec (SPEC).

| Node | Decision | Source | Code |
|---|---|---|---|
| DN-01 | Welcome, first name | MTG-A | `M-1.2 Welcome` |
| DN-02 | Basic details: date of birth, sex, identity | MTG-A | `M-1.8`, `healthBasics.json` |
| DN-03 | Age gate: under 18 → M-1.10 | SPEC F06 · OPEN O-2 | `ageGroupFor` |
| DN-04 | Meet Deborah → first conversation | MTG-A | `M-1.9`, `firstConsultFor` |
| DN-05 | Health-data consent, decline drops facts | SPEC F01 | `InlineConsent`, `consentSteps` |
| DN-06 | Safety classify | SAFETY | `guardrails.classify` |
| DN-07 | Symptom group | MTG persona 1 · SPEC symptoms.json | `symptomGroupOf` |
| DN-08 | Journey | SPEC (this doc) | `journeyFor` |
| DN-09 | Missing basic (stage), product gates (medications, allergies) | MTG-A | `missingBasics`, `planConsultation` |
| DN-10 | Up to 3 clarifiers | MTG persona 1 · SPEC | `planClarifiers` |
| DN-11 | Red-flag screen, always last | SAFETY | `redFlagSteps` |
| DN-12 | Answer, product gate | SAFETY · SPEC F02c | `productAllowed` |
| DN-13 | Review and Confirm | MTG-B | `ReviewFactsCard`, `M-2.13`, `confirmFacts` |
| DN-14 | Leave: conversation kept, confirmed facts on profile | MTG persona 1 | `conversations` slice |

Test each path with scenarios **S14–S19** (group "Journeys") and Toggles › **Show journey readout**.

## 8. Open questions for Deborah

- **OPEN:** Is the male journey in scope at launch? Deborah's practice and copy are women-focused.
- **OPEN:** Exact wording and options for every question and red flag above.
- **OPEN:** Should the bone-density and PSA questions appear, or is screening out of scope for education-only guidance?
- **OPEN:** Intersex journey definition (§5).
- **OPEN:** Pregnancy: is any product guidance allowed (e.g. prenatal), or none at all?
