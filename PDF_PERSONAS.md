# PDF persona matrix (Health Intake Logic)

Source: *Genesis Health (2).pdf* — **Health Intake Logic wrt Age & Gender Clinician**.

Auto-run: shell **▶ Journeys → Run all PDF personas** (or pick one). Each run loads `S01`, burst-fills sign-up + OTP on the M-1.4 sheet (Splash/Welcome/verify delays collapsed), fills Health Basics for that gender × age, then stops at **Ask Deborah** (`M-2.1`) or the **under-13 gate** (`M-1.10`).

Canonical ages (birth year = current year − age): under 13 → 8 · 13–17 → 15 · 18+ → 28 · 60+ → 66.

| Id | Gender | Age band | Expected Health Basics steps | End |
| --- | --- | --- | --- | --- |
| `female-lt13` | Female | under 13 | `profileFor`, `birthYear` | Gate |
| `female-teen` | Female | 13–17 | … `gender`, `reproductiveTeen`, `medications`, `supplements`, `genesisGold` | Ask Deborah |
| `female-adult` | Female | 18+ | … `gender`, `reproductive`, meds block | Ask Deborah |
| `female-senior` | Female | 60+ | same as adult | Ask Deborah |
| `male-lt13` | Male | under 13 | `profileFor`, `birthYear` | Gate |
| `male-teen` | Male | 13–17 | … `gender`, `pubertyStart`, `pubertyNotes`, meds block | Ask Deborah |
| `male-adult` / `male-senior` | Male | 18+ / 60+ | … `gender`, meds block | Ask Deborah |
| `non-binary-lt13` | Non-binary | under 13 | gate path | Gate |
| `non-binary-teen` | Non-binary | 13–17 | reproductiveTeen + puberty + meds | Ask Deborah |
| `non-binary-adult` / `non-binary-senior` | Non-binary | 18+ / 60+ | reproductive + meds | Ask Deborah |
| `transgender-lt13` | Transgender | under 13 | gate path | Gate |
| `transgender-teen` | Transgender | 13–17 | reproductiveTeen + puberty + `transIdentity` + meds | Ask Deborah |
| `transgender-adult` / `transgender-senior` | Transgender | 18+ / 60+ | reproductive + meds | Ask Deborah |
| `intersex-*` | Intersex | all | mirrors non-binary columns | Gate / Ask Deborah |
| `prefer-not-lt13` | Prefer not to say | under 13 | gate path | Gate |
| `prefer-not-teen` | Prefer not to say | 13–17 | puberty + meds | Ask Deborah |
| `prefer-not-adult` / `prefer-not-senior` | Prefer not to say | 18+ / 60+ | meds only | Ask Deborah |

**Rules**

- Self under 13 → “Ask adult to add you as a family member” (`M-1.10`). Teens 13–17 continue intake.
- All questions mandatory except the free-text after puberty (`pubertyNotes`).
- Branching lives in [`src/shared/data/intake/healthBasics.json`](src/shared/data/intake/healthBasics.json) (`showIf`); catalogue in [`src/shell/nav/JourneyRunner/pdfPersonas.ts`](src/shell/nav/JourneyRunner/pdfPersonas.ts).
- Headless check: `node --test scripts/test-journey-contracts.cjs` (PDF persona contract).

Dependent under-13 child basics (parent/guardian names, child meds & allergies) appear when `profileFor=dependent` and age &lt; 13 — covered by Health Basics `showIf`, not the 24 self-persona auto-runs.
