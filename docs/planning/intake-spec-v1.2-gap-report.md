# Intake Spec v1.2 — Gap Report (internal)

Compared: *Your Oracle Clinician — Intake Form Specification v1.2 (Oct 2026)* vs. this repo (`main`, 2026-10-27).
Effort = prototype dev-days (frontend + JSON + mock engine). 1 day ≈ 6 focused hours. Backend items are out of scope for this repo (CLAUDE.md rule 1) and listed only so nobody assumes they exist.

Legend: ✅ done · 🟡 partial / differs · ❌ missing

---

## 1. Scorecard

| Spec area | Status | Effort |
|---|---|---|
| Sign-up fields | 🟡 | 0.5 d |
| Freemium (3 free questions) | ✅ | — |
| Profile routing (self / dependent by age) | ✅ | — |
| **Gender & Sex v1.2 core questions** | 🟡 | 1 d |
| **Organ inventory** | ❌ | 1.5 d |
| **Hormone + surgical history (gender-affirming)** | ❌ | 1.5 d |
| Anatomy-based branching (replace sex/gender routing) | ❌ | 2 d |
| Adult Female: menopause / HRT | 🟡 | 1 d |
| Adult Female: reproductive history | 🟡 | 1 d |
| Symptom checklist with Yes / No / N/A + pre-set N/A | ❌ | 1.5 d |
| Adult Male fields | 🟡 | 0.5 d |
| Meds / supplements / Genesis Gold / allergies | 🟡 | 0.5 d |
| Lifestyle block | 🟡 | 0.5 d |
| Family & personal history (self + family) | ❌ | 1.5 d |
| Adolescent intake | 🟡 | 1.5 d |
| Pediatric intake | 🟡 | 1.5 d |
| **Proxy pathway A/B/C/D picker per session** | 🟡 | 2 d |
| Pathway banners + tone + escalation table | 🟡 | 1.5 d |
| Consult context (chief complaint etc.) | 🟡 | 1 d |
| Profile review instead of re-entry | ✅ | — |
| Printable advocacy summary | ✅ | — |
| Privacy controls for sensitive fields | 🟡 | 0.5 d |
| **Total (prototype)** | | **≈ 22 d** |

---

## 2. What already matches ✅

| Item | Where |
|---|---|
| 3 free questions, then gate | `src/shared/engine/counting.ts:4` (`FREE_LIMIT = 3`), `screens/plans/FreeLimit` |
| Profile for self / Parent / Child / Partner / Someone else | `src/shared/data/intake/healthBasics.json` (`profileFor`, `relationship`) |
| Sex at birth incl. Intersex | `healthBasics.json` `sex` |
| Pronouns question | `healthBasics.json` `pronouns` |
| Reproductive status (pre / peri / post / surgical / pregnant) | `healthBasics.json` `reproductive` |
| Hysterectomy → ovaries removed (Yes / No / Partial), age at last period, HRT status (Yes / Previously / No) | `healthBasics.json` |
| Fertility concerns, puberty age (male) | `healthBasics.json` |
| Meds, supplements, Genesis Gold | `healthBasics.json` |
| Elderly proxy flow (Pathway C): UTI/sepsis same-day escalation, 911 sheet, "Asking about … · Proxy session" banner, triage script | `src/shared/data/conversation/flows/proxyConsult.json` |
| Returning consult never re-asks profile | `flows/returningConsult.json` |
| Teen sign-up (13–17) | scenario `S20-teen-onboarding` |
| Provider-ready summary / Visit Brief PDF | `screens/records/VisitBrief`, `PdfPreview` |
| Social login buttons | `ui/SocialButton` |

---

## 3. Discrepancies (built, but differs from spec) 🟡

| # | Spec says | We have | Fix | Effort |
|---|---|---|---|---|
| D1 | Gender options: Woman · Man · Non-binary · Agender · Not listed (write in) · Prefer not to say | Male · Female · Trans woman · Trans man · Intersex · Non-binary · Other | Replace option list. Intersex belongs to sex-at-birth only, not gender. "Trans" is derived from gender ≠ sex at birth, not a separate option | 0.25 d |
| D2 | Sex at birth includes **Prefer not to say** | Male · Female · Intersex | Add option; must never block progress | 0.25 d |
| D3 | Pronouns wording "What pronouns should I use for you?" + Write in | "What are your preferred pronouns?" + Other | Copy + label change | 0.1 d |
| D4 | Branching keyed on gender values `trans-man` / `trans-woman` | `showIf` rules at `healthBasics.json:355–494` use those values | Rewrite rules to anatomy (see §4, M3). Breaks once D1 lands | inc. in M3 |
| D5 | HRT type: Estrogen only / Progesterone only / Combined / Testosterone / Bio-identical / Synthetic / write in | 4 options | Add 3 options + write-in; add delivery method, duration, helped/not helped, why stopped | 0.75 d |
| D6 | Proxy picker shown **every new session**: Myself / My child / My elderly parent / My partner or another adult | Profile switcher + relationship on profile; flow picked per profile | Add session-start picker; store `pathway` on the conversation object | see M8 |
| D7 | Sign-up: password min 8 + 1 uppercase + 1 number | Only "8 characters" rule found in `CreateAccount.tsx:188`, `GuestAuth.tsx:135` | Add uppercase + number check | 0.1 d |
| D8 | Sign-up: "How did you hear about us?" dropdown + "Existing Genesis Gold customer?" | Referral only from URL param (`Splash.tsx:22`), no Genesis Gold customer question | Add two optional fields | 0.25 d |
| D9 | Teen intake must **not** ask sexual activity / contraception / fertility | `healthBasics.json` teen path reuses `reproductiveTeen` with full adult status list (incl. "Pregnant / Postpartum", "Post-menopausal") | Trim teen list; audit chatIntake `birth-control` is gated off for <18 | 0.25 d |
| D10 | Teen intersex question uses simple wording + "I'm not sure" / "I don't understand" | Same adult wording | Add teen variant | 0.25 d |
| D11 | Average nightly sleep (hours) is **required** | Asked only in chat (`chatIntake.json` `sleep-hours`) | Decide: keep chat-only (spec conflict) or add to profile | 0.25 d |

---

## 4. Missing ❌ (must build)

| # | Item | Notes | Effort |
|---|---|---|---|
| M1 | **Organ inventory** (multi-select: Uterus · Cervix · Ovaries · Testes · Prostate · Breast tissue · None · Prefer not to say) + helper text | New `HealthProfile.organs` field in `src/shared/types/health.ts`, step in `healthBasics.json`, shown in My Health hub + edit | 1.5 d |
| M2 | **Hormone history** (Currently / Past / Never / Prefer not) → which hormones (T, E, P, anti-androgen, blockers, other) → provider overseeing? | Trigger: gender ≠ sex at birth, Intersex, Non-binary, Agender, Not listed. **Surgical history** (chest, hysterectomy, gonads, vaginoplasty, phallo/meta, other) same trigger | 1.5 d |
| M3 | **Anatomy routing** | Question banks chosen by organs + sex at birth + reproductive status. Uterus/ovaries → menstrual set; prostate/testes → male set; mixed → both. Never by gender alone. Touches `engine/showIf.ts`, `engine/intake.ts`, `chatIntake.json` banks (`female-*`, `symptoms-male`, `red-flags-*`) | 2 d |
| M4 | **Intersex detail** free text ("If you know the name of your variation…") | Conditional on Intersex | 0.25 d |
| M5 | **Symptom checklist** (21 female / 19 male items) with Yes / No / N/A, 1–10 severity on pain items, N/A pre-set for post-meno / surgical / no-uterus, user can override | Today: 6 grouped chat questions (`chatIntake.json` `symptoms-*`), no N/A, no per-item list | 1.5 d |
| M6 | **Family & personal history** grid (19 conditions × Self / Family, text on check; male omits endo, fibrocystic, early menopause) | Only free-text `familyHistory` in `types/domain.ts` | 1.5 d |
| M7 | Female reproductive history: menarche age, regular?, cycle days, bleeding days, pads on heaviest day, G/P/miscarriage/termination counts, PPD history, DES exposure, mother's menopause age | Partly asked in chat (`cycle-regularity`, `cycle-length`); rest missing | 1 d |
| M8 | **Pathway B (child) + D (partner) chats** and session picker | Only Pathway C flow exists. Need: B flow (parent-to-parent tone, "add a child's profile" prompt if none), D flow ("General information mode — not a personalized consultation" grey banner, no recommendations, "needs their own account") | 2 d |
| M9 | Escalation differs by pathway (table of 5 symptom patterns × A/B/C/D) | Only C has its own escalation. Add pathway to `engine/safety.ts` / `guardrails.ts` thresholds | 1.5 d |
| M10 | Adolescent fields: household (siblings, adults, pets), sleep times, fluids × 6, development, school/GPA, social & safety (friends, trusted adults, drugs, smoke, seatbelt, helmet, drives/drinks) | None of seatbelt / helmet / household exist | 1.5 d |
| M11 | Pediatric fields: birth weight, pregnancy/birth problems, feeding, milestones × 5, accidents, illnesses, appetite, school, safety, **recent exams** (vision / hearing / dental / immunizations) | Only DOB, guardian names, meds, allergies today | 1.5 d |
| M12 | Consult context fields: other issues, one health goal this year, why not achieved, # providers consulted, anything else | Chief complaint exists; others missing or chat-only | 1 d |
| M13 | Male extras: age stopped growing, has children, fertility factor, testicular self-exam | Not found | 0.5 d |
| M14 | Lifestyle: exercise, diet / daily intake, work schedule + stress 1–10, supportive partner/family/friends | `lifestyle` is an untyped `Record<string,string>` | 0.5 d |
| M15 | Privacy: user can edit/delete each sensitive answer; provider note lets user choose which identity fields appear before download | Edit exists generically; per-field include/exclude on Visit Brief missing | 0.5 d |

---

## 5. Not for this repo (backend / legal) — flag only

| Item | Owner |
|---|---|
| Stripe subscriptions, Shopify links | Tkxel backend |
| LangGraph pathway flag as system context variable | Tkxel AI |
| Encryption at rest/in transit, no analytics on gender/sex fields | Tkxel backend |
| Knowledge-base live sync (Google Drive) | Tayyab |
| T&C under-18 wording, COPPA, teen gender-care scope, MHMDA / GDPR review | Legal |
| Real OAuth for social login | Tkxel backend |

---

## 6. Recommended order

| Step | Items | Effort | Why first |
|---|---|---|---|
| 1 | D1–D4, M1, M2, M3, M4 | ≈ 6.5 d | v1.2 headline change; D1 breaks current branching, so do together |
| 2 | M8, M9, D6 | ≈ 3.5 d | Safety-critical: wrong pathway = wrong escalation |
| 3 | M5, M6, M7, D5 | ≈ 4.75 d | Core adult profile depth |
| 4 | M10, M11, D9, D10 | ≈ 3.5 d | Teen + child forms |
| 5 | M12–M15, D7, D8, D11 | ≈ 3.5 d | Polish |

## 7. Open questions (need a decision before building)

| # | Question |
|---|---|
| Q1 | Spec wants a long structured profile; repo uses a short "frictionless" intake + in-chat questions (F02b). Build full forms, or map spec fields into chat questions? Effort above assumes **chat/profile hybrid (current pattern)**; full standalone forms ≈ +40%. |
| Q2 | "Required" sleep hours, meds, supplements — keep as skippable in prototype? |
| Q3 | Spec badges/tags conflict with DESIGN.md "no pills, tags, badges or chips" — UI uses option rows; confirm OK. |
| Q4 | Teen hormone-question scope is legal/pending — show the questions or hide until attorney confirms? |
