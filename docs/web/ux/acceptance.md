# Web acceptance (Phase 3)

Prototype gates for the desktop twin. Same story as mobile; only chrome differs.

Smoke run: **2026-10-22** on `/internal` → Web (`localhost:5175`).

## Hard gates

- [x] Zero `@mobile` imports under `src/apps/web`
- [x] Composer look unchanged vs mobile (R01 Home shows frozen composer dock)
- [x] Sheets and modals are centered dialogs (Esc / scrim when dismissible; Tab stays inside)
- [x] Stage behind a dialog is `inert` (S06 free-limit sheet: `inert` on navigator base)
- [x] Rail always visible on main; no drawer toggle on Home

## Flow checklist (F01–F11)

| Flow | Smoke path | Pass |
|---|---|---|
| F01 Onboarding | S01 Welcome → Before we begin / Health basics | [x] M-1.2 · M-1.8 |
| F02 Consultation | R01 Home + rail + composer | [x] |
| F03 Safety | S13 Safety test bench UI (Emergency / Med / Crisis / OOS) | [x] bench present; interrupt send not auto-run |
| F04 Plans | S06 Free limit → Choose plan 2-col | [x] sheet 520 · modal 800 · `354×2` |
| F05 Labs | S08 Records Labs pane | [x] Immunity lab in pane |
| F06 Family | Family profiles split → Profile details | [x] `400+778` |
| F07 My Health | Screen → My Health / Healing plan | [x] M-7.2 · M-7.3 in tree |
| F08 Booking | Consult with Deborah → Pick a time | [x] M-8.2 · M-8.3 (scheduler slots) |
| F09 Records | Records Labs ≥960 → lab in pane | [x] |
| F10 Account | Settings → Privacy & data | [x] M-10.1 · M-10.2 visible |
| F11 Documents | Documents library split | [x] `400+778` |

## Keyboard / motion

- [x] Esc dismisses Choose plan modal
- [x] Stage `inert` while dialog open
- [x] Rail focusable (Ask Deborah takes focus)
- [x] `prefers-reduced-motion` rules present on Sidebar / modal / BottomSheet (MQ off in this browser)

## Layout patterns

| Pattern | Smoke |
|---|---|
| `L-shell` | [x] |
| `L-chat-stage` | [x] |
| `L-home` / `L-hub` | [x] |
| `L-master-detail` | [x] |
| `L-modal` | [x] |
| `L-settings` | [x] Account / Privacy |
| `L-form-flow` / `L-onboarding` | [x] Booking scheduler · Welcome |
