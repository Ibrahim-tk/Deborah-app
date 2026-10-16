# xref — screen registry (mobile ↔ web ↔ Figma ↔ spec)

Keep this table in sync with `apps/mobile/navigation/registry.ts`. Every screen in this table is built as of phase 6. A future screen not built yet is registered as `planned` and renders a placeholder that names its phase. Web column fills in when the web spec exists. Paths are relative to `src/apps/<app>/screens/`.

| ID | Concept | Flow | Mobile file | Web ID / file | Figma | Spec | Status |
|---|---|---|---|---|---|---|---|
| M-1.1 | Splash | F01 | `onboarding/Splash` | W-1.1 — not built | [F01](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184) | [ux/F01-onboarding.md](ux/F01-onboarding.md) | built (phase 3) |
| M-1.2 | Welcome | F01 | `onboarding/Welcome` | W-1.2 — not built | [F01](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184) | [ux/F01-onboarding.md](ux/F01-onboarding.md) | built (phase 3) |
| M-1.3 | Consent | F01 | `onboarding/Consent` | W-1.3 — not built | [F01](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184) | [ux/F01-onboarding.md](ux/F01-onboarding.md) | built (phase 3) |
| M-1.4 | Create your profile (sheet: email + password, code, you're in) | F01 | `onboarding/CreateProfile` | W-1.4 — not built | — | [ux/F01-onboarding.md](ux/F01-onboarding.md) (OPEN: add) | built |
| M-1.8 | Onboarding profile (who → relationship, name → DOB → medical-advocate consent sheet → sex at birth → gender identity → age×gender bank) | F01 | `onboarding/HealthBasics` (+ `parts/ConsentSheet`) | W-1.8 — not built | — | [ux/F01-onboarding.md](ux/F01-onboarding.md#m-18--onboarding-profile) | built (onboarding plan) |
| M-1.10 | Ask a parent (age gate, under 18) | F01 | `onboarding/AskParent` | W-1.10 — not built | — | [ux/F01-onboarding.md](ux/F01-onboarding.md#m-110--ask-a-parent) | built (core experience) |
| M-1.9 | Deborah's welcome: "Start chatting" or "Start talking about {name}" (sheet over the last step) | F01 | `onboarding/DeborahWelcome` | W-1.9 — not built | — | [ux/F01-onboarding.md](ux/F01-onboarding.md) (OPEN: add) | built |
| M-2.0 | Home (landing, first-visit greeting sheet) | F02 | `consultation/Home` | W-2.0 — not built | — | design direction 2026-10-08 (OPEN: add to ux/F02) | built |
| M-2.9 | Scan a label (intake V2 Step E) | F02 | `consultation/ScanLabel` | W-2.9 — not built | — | intake V2 brief (OPEN: add to ux/F02) | built |
| M-2.10 | Build your health profile (intake V2 card on its own) | F02 | `consultation/HealthProfile` | W-2.10 — not built | — | intake V2 brief (OPEN: add to ux/F02) | built |
| M-2.11 | Profile question (deferred fields) | F02 | `consultation/ProfileQuestion` | W-2.11 — not built | — | intake V2 brief (OPEN: add to ux/F02) | built |
| M-2.13 | What Deborah noted (Review and Confirm edit sheet) | F02 | `consultation/ReviewFacts` | W-2.13 — not built | — | [ux/F02b-profile-aware-chat-intake.md](ux/F02b-profile-aware-chat-intake.md#review-and-confirm) | built (core experience) |
| M-2.14 | Complete Intake (placeholder full questionnaire shell) | F02 | `consultation/CompleteIntake` | W-2.14 — not built | — | Client discovery 2026-10-16 | built (additive; Dropbox fields deferred) |
| M-2.15 | Terms updated (returning-user re-consent) | F10 | `account/PolicyUpdate` | W-2.15 — not built | — | Client discovery 2026-10-16 | built (additive) |
| M-2.12 | First consultation (scripted, genesis_first_consult_v1) | F02 | `consultation/FirstConsult` | W-2.12 — not built | — | `src/shared/data/conversation/flows/firstConsult.json` (OPEN: add to ux/F02) | built |
| M-2.1 | Conversation (all chat states) | F02 | `consultation/Conversation` | W-2.1 — not built | [F02](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361) | [ux/F02-consultation.md](ux/F02-consultation.md) | built (phases 3–6) |
| M-2.7 | Shop — in-app browser | F02 | `consultation/InAppShop` | W-2.7 — not built | [F02](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361) | [ux/F02-consultation.md](ux/F02-consultation.md) | built (phase 3) |
| M-2.8 | Follow-up opt-in | F02 | `consultation/FollowUpOptIn` | W-2.8 — not built | [F02](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361) | [ux/F02-consultation.md](ux/F02-consultation.md) | built (phase 3) |
| M-4.1 | Free limit | F04 | `plans/FreeLimit` | W-4.1 — not built | [F04](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353) | [ux/F04-plans-account.md](ux/F04-plans-account.md) | built (phase 5) |
| M-4.2 | Choose plan | F04 | `plans/ChoosePlan` | W-4.2 — not built | [F04](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353) | [ux/F04-plans-account.md](ux/F04-plans-account.md) | built (phase 5) |
| M-4.3 | Create account / Sign in | F04 | `plans/CreateAccount` | W-4.3 — not built | [F04](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353) | [ux/F04-plans-account.md](ux/F04-plans-account.md) | built (phase 5) |
| M-4.4 | Store payment | F04 | `plans/StorePayment` | W-4.4 — not built | [F04](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353) | [ux/F04-plans-account.md](ux/F04-plans-account.md) | built (phase 5) |
| M-4.5 | Plan success | F04 | `plans/PlanSuccess` | W-4.5 — not built | [F04](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353) | [ux/F04-plans-account.md](ux/F04-plans-account.md) | built (phase 5) |
| M-5.1 | Lock screen notification | F05 | `(shell) src/shell/device/LockScreen` | — (device layer, mobile only) | [F05](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547) | [ux/F05-followup-labs.md](ux/F05-followup-labs.md) | built (phase 5) |
| M-5.3 | Add lab results | F05 | `followup/AddLabs` | W-5.3 — not built | [F05](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547) | [ux/F05-followup-labs.md](ux/F05-followup-labs.md) | built (phase 5) |
| M-5.4 | Confirm lab results | F05 | `followup/ConfirmLabs` | W-5.4 — not built | [F05](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547) | [ux/F05-followup-labs.md](ux/F05-followup-labs.md) | built (phase 5) |
| M-6.1 | Profile switcher | F06 | `profiles/ProfileSwitcher` | W-6.1 — not built | [F06](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203) | [ux/F06-family-profiles.md](ux/F06-family-profiles.md) | built (phase 6) |
| M-6.2 | Add family member | F06 | `profiles/AddMember` | W-6.2 — not built | [F06](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203) | [ux/F06-family-profiles.md](ux/F06-family-profiles.md) | built (phase 6) |
| M-6.3 | Upgrade to Family | F06 | `profiles/UpgradeFamily` | W-6.3 — not built | [F06](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203) | [ux/F06-family-profiles.md](ux/F06-family-profiles.md) | built (phase 6) |
| M-6.5 | Profile details | F06 | `profiles/ProfileDetails` | W-6.5 — not built | [F06](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203) | [ux/F06-family-profiles.md](ux/F06-family-profiles.md) | built (phase 6) |
| M-6.6 | Manage profiles | F06 | `profiles/ManageProfiles` | W-6.6 — not built | [F06](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203) | [ux/F06-family-profiles.md](ux/F06-family-profiles.md) | built (phase 6) |
| M-7.1 | My Health — empty (state) | F07 | `myhealth/MyHealthHub` | W-7.1 — not built | [F07](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280) | [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | built (phase 6) |
| M-7.2 | My Health hub | F07 | `myhealth/MyHealthHub` | W-7.2 — not built | [F07](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280) | [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | built (phase 6) |
| M-7.3 | 90-day plan | F07 | `myhealth/NinetyDayPlan` | W-7.3 — not built | [F07](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280) | [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | built (phase 6) |
| M-7.4 | Content detail | F07 | `myhealth/ContentDetail` | W-7.4 — not built | [F07](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280) | [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | built (phase 6) |
| M-7.5 | Deborah's library | F07 | `myhealth/Library` | W-7.5 — not built | [F07](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280) | [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | built (phase 6) |
| M-7.6 | About Deborah | F07 | `myhealth/AboutDeborah` | W-7.6 — not built | [F07](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280) | [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | built (phase 6) |
| M-8.2 | Booking info | F08 | `booking/BookingInfo` | W-8.2 — not built | [F08](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470) | [ux/F08-book-deborah.md](ux/F08-book-deborah.md) | built (phase 6) |
| M-8.3 | Scheduler | F08 | `booking/Scheduler` | W-8.3 — not built | [F08](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470) | [ux/F08-book-deborah.md](ux/F08-book-deborah.md) | built (phase 6) |
| M-8.4 | Booking confirmed | F08 | `booking/BookingConfirmed` | W-8.4 — not built | [F08](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470) | [ux/F08-book-deborah.md](ux/F08-book-deborah.md) | built (phase 6) |
| M-9.1 | Records | F09 | `records/Records` | W-9.1 — not built | [F09](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598) | [ux/F09-records.md](ux/F09-records.md) | built (phase 6) |
| M-9.2 | Consultation detail | F09 | `records/ConsultationDetail` | W-9.2 — not built | [F09](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598) | [ux/F09-records.md](ux/F09-records.md) | built (phase 6) |
| M-9.4 | Note editor | F09 | `records/NoteEditor` | W-9.4 — not built | [F09](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598) | [ux/F09-records.md](ux/F09-records.md) | built (phase 6) |
| M-9.5 | Lab report | F09 | `records/LabReport` | W-9.5 — not built | [F09](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598) | [ux/F09-records.md](ux/F09-records.md) | built (phase 6) |
| M-9.6 | PDF preview | F09 | `records/PdfPreview` | W-9.6 — not built | [F09](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598) | [ux/F09-records.md](ux/F09-records.md) | built (phase 6) |
| M-9.7 | My Visit Notes | F09b | `records/VisitBrief` | W-9.7 — not built | — | [ux/F09b-visit-brief.md](ux/F09b-visit-brief.md) | built (Miro Step 5) |
| M-10.1 | Account | F10 | `account/Account` | W-10.1 — not built | [F10](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695) | [ux/F10-account-privacy.md](ux/F10-account-privacy.md) | built (phase 6) |
| M-10.2 | Privacy & data | F10 | `account/PrivacyData` | W-10.2 — not built | [F10](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695) | [ux/F10-account-privacy.md](ux/F10-account-privacy.md) | built (phase 6) |
| M-10.3 | Subscription | F10 | `account/Subscription` | W-10.3 — not built | [F10](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695) | [ux/F10-account-privacy.md](ux/F10-account-privacy.md) | built (phase 6) |
| M-10.4 | Notifications | F10 | `account/Notifications` | W-10.4 — not built | [F10](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695) | [ux/F10-account-privacy.md](ux/F10-account-privacy.md) | built (phase 6) |
| M-10.5 | Terms & disclaimer | F10 | `account/Legal` | W-10.5 — not built | [F10](https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695) | [ux/F10-account-privacy.md](ux/F10-account-privacy.md) | built (phase 3; Account entry phase 6) |

## Patterns with platform counterparts

| Pattern | Mobile | Web | Spec |
|---|---|---|---|
| AnswerSections | `patterns/chat/AnswerSections` | not built | ux/F02-consultation.md#answer-sections |
| EmergencyInterrupt | `patterns/safety/EmergencyInterrupt` | not built | ux/F03-safety.md |
| MedicationSafetyCard | `patterns/safety/MedicationSafetyCard` | not built | ux/F03-safety.md |
| CrisisSupportCard | `patterns/safety/CrisisSupportCard` | not built | ux/F03-safety.md |
| ProductCard | `patterns/commerce/ProductCard` | not built | ux/F02-consultation.md#answer-sections |
| PlanCard | `patterns/commerce/PlanCard` | not built | ux/F04-plans-account.md |
| QuickReplies | `patterns/chat/QuickReplies` | not built | ux/F05-followup-labs.md (check-in) |
| LabValueRow | `patterns/health/LabValueRow` | not built | ux/F05-followup-labs.md#m-54--check-your-results |
| ProfileSwitcherList / ProfileBanner | `patterns/profile/*` | not built | ux/F06-family-profiles.md |
| FocusCard / PlanProgressCard / CheckInCard / QuickLinks / ContentCard / HabitRow | `patterns/health/*` | not built | ux/F07-my-health-hub.md |
| ConsultationRow / NoteRow / EmptyState | `patterns/health/*` | not built | ux/F09-records.md |
| InlineConsent / QuestionChoices / ChoicePills (wrapping) / InlineChoicePills (chat) / FullChoicePills (stacked intake) / FullChoicePillsGrid (2-col sex / gender) / BookDeborah / ConfirmCard / SlotPicker / MoodScale / ScaleCheck / ReminderCard / UploadCard | `patterns/widgets/*` | not built | Widget lab `/wid` + V2 Conversation / IntakeQuestion / FlowChoice / Health Basics (one source; edit widget → reflects in app) |
| Design system (every token, ui primitive and pattern, rendered live) | `screens/lab/DesignSystem` | not built | Route `/design-system` (design tool, 2026-10-15); sources DESIGN.md · deborah-design-system.md |
