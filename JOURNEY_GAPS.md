# Journey Gaps and Simulation Boundaries

Updated 15 October 2026. Based on code inspection; browser verification remains outstanding. No BUILD.md was found; the reference is docs/11-build-plan.md and docs/ux/.

## First-time onboarding

- Consent wording is placeholder pending legal review. Birth-year gates use calendar-year age, not an exact birthday.

Evidence: `src/apps/mobile/screens/onboarding/HealthBasics/`, `src/apps/mobile/screens/onboarding/DeborahWelcome/`.

## Self under 18 — age gate

- Consent wording is placeholder pending legal review. Birth-year gates use calendar-year age, not an exact birthday.

Evidence: `src/apps/mobile/screens/onboarding/HealthBasics/`, `src/apps/mobile/screens/onboarding/DeborahWelcome/`.

## Teen dependent onboarding

- Consent wording is placeholder pending legal review. Birth-year gates use calendar-year age, not an exact birthday.

Evidence: `src/apps/mobile/screens/onboarding/HealthBasics/`, `src/apps/mobile/screens/onboarding/DeborahWelcome/`.

## Child dependent onboarding

- Consent wording is placeholder pending legal review. Birth-year gates use calendar-year age, not an exact birthday.
- Child questions use the existing minor fallback; there is no dedicated child question bank. Add Family Member still blocks under 13.

Evidence: `src/apps/mobile/screens/onboarding/HealthBasics/`, `src/apps/mobile/screens/onboarding/DeborahWelcome/`.

## Adult partner onboarding

- Consent wording is placeholder pending legal review. Birth-year gates use calendar-year age, not an exact birthday.

Evidence: `src/apps/mobile/screens/onboarding/HealthBasics/`, `src/apps/mobile/screens/onboarding/DeborahWelcome/`.

## Add and switch family profiles

- Under-13 additions are blocked here, although dependent onboarding permits a placeholder guardian path.

Evidence: `src/apps/mobile/screens/profiles/`.

## Teen invitation and sharing

- No invitation delivery, acceptance screen, teen account role or sharing-permission model. Exact teen consent rules remain open.

Evidence: `docs/ux/F06-family-profiles.md`, `src/apps/mobile/screens/profiles/AddMember/`.

## Adult invitation and access permissions

- No recipient account, pending invitation, acceptance, revocation or scoped sharing permissions.

Evidence: `docs/ux/F06-family-profiles.md`, `src/apps/mobile/screens/profiles/AddMember/`.

## Lab attachment and confirmation

- No real OCR, upload, arbitrary medical-document parsing or file-content analysis.

Evidence: `src/apps/mobile/screens/followup/AddLabs/`, `src/apps/mobile/screens/followup/ConfirmLabs/`.

## Lab-informed answer and records

- No actual AI analysis or automatic general medical-document-to-profile extraction.

Evidence: `src/apps/mobile/screens/records/LabReport/`, `src/shared/engine/labs.ts`.

## Doctor visit notes

- No doctor-visit audio capture, transcription or audio-to-profile flow. Chat dictation is also canned simulation.

Evidence: `src/apps/mobile/screens/records/NoteEditor/`.

## Medication update and conflict limits

- No dedicated conflict detection, competing-source comparison or conflict-resolution workflow. Free-text extraction is limited.

Evidence: `src/apps/mobile/screens/consultation/ReviewFacts/`, `src/shared/store/slices/conversations.ts`.

## Conversation history and continuation

- No server history synchronization; PDF preview is not a generated PDF file.

Evidence: `src/apps/mobile/screens/records/ConsultationDetail/`, `src/apps/mobile/screens/records/Records/`.

## Account and privacy controls

- Export only records a request timestamp; legal text is placeholder.

Evidence: `src/apps/mobile/screens/account/`.

## Trial limit and plan selection

- Payment and subscription management are simulated.

Evidence: `src/apps/mobile/screens/plans/`, `docs/ux/F04-plans-account.md`.

## Escalation and booking

- No real telehealth availability or booking service.

Evidence: `src/apps/mobile/screens/booking/`, `docs/ux/F08-book-deborah.md`.

## Tooling and verification still in progress

- The development-only journey dashboard is not complete. Use the State menu or direct scenario links for manual testing.
- The /wid widget integration is being implemented; TypeScript passes, but its full visual and behavioral regression pass is outstanding.
- Dedicated S20/S21 seeds, shared family consent and reset cancellation changes are present in the working tree and require end-to-end verification.
- There are 12 pre-existing lint warnings from the baseline check; rerun lint after implementation.
- The account store is in memory; refresh reloads a scenario. Older architecture docs still describe persistence and need correction.
