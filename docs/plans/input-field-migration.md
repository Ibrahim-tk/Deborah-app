# Input field migration + focus style — plan

Status: **done** (2026-10-20): field variants + neutral focus in `ui/Input`; all 13 raw fields migrated (`ui/CodeInput` on Base UI OTPField for codes); purple field-focus rules removed. Not yet: the Design System "Fields" row. Goals: (1) every text-entry field in the app uses the shared MUI Base UI
field (`ui/Input` / `ui/TextArea`); (2) tapping a field no longer shows the purple border / ring.

## 1. Today

- **Already shared (`ui/Input` / `ui/TextArea`), 24 places:** Welcome, Create profile + Forgot password, Health basics,
  Create account, Profile question, First consultation text step, What Deborah noted, Check your results / lab rows,
  Library search, Note, Visit Notes follow-up, Log your visit, Upload a document, Add family member, Profile
  (basics + health), Delete-account confirm, Add medicine sheet, intake profile card, chat Composer.
- **Raw fields still hand-built, 13:**

| # | Field | File | Screen(s) |
|---|---|---|---|
| 1 | Phone number | patterns/widgets/PhoneField | M-1.4 Create profile, M-4.3 Create account, M-10.1 Settings |
| 2 | Country search (in phone picker) | ui/Combobox | same as #1 |
| 3 | Symptom search | patterns/chat/SymptomPicker | M-2.1 Conversation, M-2.12 First consultation |
| 4 | "Other" answer in chat | patterns/chat/ComposerOptions/AnswerPanel | M-2.1, M-2.12 |
| 5 | Describe / other (in a pill) | patterns/widgets/PillDescribeField | M-1.8 Health basics, chat intake |
| 6 | Add your own chip | screens/onboarding/HealthBasics/parts/ChipPicker | M-1.8 Health basics |
| 7 | Verification code (6 boxes) | screens/plans/CreateAccount/parts/CodeStep | M-4.3 Create account (also M-1.4 code step) |
| 8 | Chief complaint (textarea) | screens/records/VisitBrief/parts/BriefDocument | M-9.7 My Visit Notes |
| 9–13 | Test / reason, question / why, medication / dose | screens/records/VisitBrief/parts/BriefLists | M-9.7 My Visit Notes |

- **Purple focus today** comes from: `ui/Input` (border + ring), `ui/Combobox` search, `PhoneField`, Add-medicine
  reason box, SymptomPicker search, Code boxes, Note / Log your visit textareas, Complete intake and Profile text
  fields, and the global `.phone-root :focus-visible` outline (hits the raw Visit Notes fields).

## 2. Target

### A. Extend the shared field once (component first)
`ui/Input` gains what the raw fields need, still on Base UI `Field`:
- `variant`: `default` · `search` (pill with leading search icon — symptom + country search) · `inline` (borderless,
  for fields inside pills / chips / chat answer: PillDescribeField, ChipPicker, AnswerPanel).
- passes through `enterKeyHint`, `onKeyDown`, `autoFocus`, `inputMode` (already via rest props).
- New `ui/CodeInput` on **Base UI `OTPField`** (`@base-ui/react/otp-field`, already installed) for the 6-digit code:
  paste, auto-advance, `one-time-code` autofill built in.
- `ui/Select` stays (Visit Notes list selects move to it as part of #9–13).

### B. One focus style for every field (no purple)
Focus = **quiet, neutral**: field border goes from hairline to a slightly darker neutral ink (≈ ink 24%),
no ring, no purple. Defined once in `ui/Input` / `ui/TextArea` (new token `--field-border-focus`), so every field
inherits it. Error state (red) stays. Keyboard focus on **buttons, rows, pills** keeps its outline — the global
`.phone-root :focus-visible` rule is narrowed to `:not(input, textarea)` instead of removed.

### C. Migrate the 13 raw fields (in this order)
1. PhoneField number input → `ui/Input` (leading dial code, trailing country button already supported).
2. Combobox country search → `variant="search"` styles (it stays Base UI `Combobox.Input`, sharing the field CSS).
3. SymptomPicker search → `ui/Input variant="search"`.
4. Visit Notes chief complaint → `ui/TextArea`; list fields → `ui/Input`; list `<select>` → `ui/Select`.
5. AnswerPanel, PillDescribeField, ChipPicker → `ui/Input variant="inline"`.
6. CodeStep → `ui/CodeInput` (OTPField).

### D. Remove the purple focus rules
Delete or neutralise the field focus rules listed in §1 (Input, Combobox, PhoneField, NamedReasonList reason box,
SymptomPicker, CodeStep, NoteEditor, LogVisit, CompleteIntake, ProfileDetails). Leave the `--color-border-selected`
token alone — it also marks **selected** options, pills and cards.

## 3. Order of work
1. A + B in `ui/Input` / `ui/TextArea` (focus style lands app-wide immediately for the 24 shared uses).
2. C, one field at a time (PhoneField first — it's the screenshot).
3. D clean-up, then a "Fields" row on the Design System page showing default / focus / error / search / inline / code.

## 4. Decisions (designer, 2026-10-20)
- Focus look: **darker neutral border, no ring, no purple.**
- Code entry: **Base UI `OTPField`** as the new `ui/CodeInput`.
