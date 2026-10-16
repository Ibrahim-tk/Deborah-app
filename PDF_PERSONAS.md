# PDF persona matrix (Health Intake Logic)

Source: *Genesis Health (2).pdf* — **Health Intake Logic wrt Age & Gender Clinician**.

Auto-run: shell **▶ Journeys → Run all PDF personas** (or pick one). Each run loads `S01`, fills sign-up + OTP on the M-1.4 sheet at **0.5×** the normal journey step pace (~700 ms), then Health Basics for that gender × age, and stops at **Ask Deborah** (`M-2.1`) or the **under-13 gate** (`M-1.10`).

Canonical ages (birth year = current year − age): under 13 → 8 · 13–17 → 15 · 18+ → 28 · 60+ → 66.

## Mandatory fields (PDF)

1. **Age** (year of birth)
2. **Sex at birth** — Female · Male · Non-binary · Trans man · Trans woman · Intersex · Prefer not to say — **routes the intake banks** (Female bank is female-only)
3. **How do you identify?** — asked **last**, only for Non-binary · Trans man · Trans woman · Intersex. Skipped for Male / Female / Prefer not to say. Does not change routing.

Under-13 Myself opens the M-1.10 guardian sheet (Back to the start).

## Branch questions (as in the PDF)

| Path | Ages | Questions |
| --- | --- | --- |
| Under 13 (self) | &lt;13 | Ask adult to add you as a family member |
| Under 13 (dependent) | &lt;13 | Parent / guardian names → Medications & allergies → Allergies |
| Female | 13–17, 18+, 60+ | Reproductive status → Meds / Supplements / Genesis Gold |
| Male | 13–17 | When did you start puberty? → optional development notes → Meds block |
| Male | 18+, 60+ | Meds block |
| Non-binary / Intersex | 13–17 | Reproductive status → puberty start + optional notes → Meds block |
| Non-binary / Intersex | 18+, 60+ | Reproductive status → Meds block |
| **Trans man / Trans woman** | **13+ (all)** | **One question:** “What, if any, puberty has your body gone through or is going through?” → **Trans-woman** · **Trans-man** · **None yet** → then Meds block |
| Prefer not to say | 13–17 | Puberty start + optional notes → Meds block |
| Prefer not to say | 18+, 60+ | Meds block |

**Reproductive status options (PDF):** Pre-menopausal · Peri-menopausal · Post-menopausal · Surgically menopausal · Pregnant / Postpartum

**Meds block (PDF):** Medications Rx & OTC — name + reason, or None · Supplements — name + reason, or None · Taking Genesis Gold?

**Rule:** all questions mandatory except the free-text after puberty.

Branching lives in [`src/shared/data/intake/healthBasics.json`](src/shared/data/intake/healthBasics.json). Catalogue: [`src/shell/nav/JourneyRunner/pdfPersonas.ts`](src/shell/nav/JourneyRunner/pdfPersonas.ts). Headless check: `node --test scripts/test-journey-contracts.cjs`.
