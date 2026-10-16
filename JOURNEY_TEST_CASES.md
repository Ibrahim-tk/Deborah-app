# Manual Journey Test Cases

Updated 15 October 2026. Each case starts UNTESTED. Test the actual UI manually; code presence does not establish that the whole flow passes. Use synthetic data only.

## First-time onboarding

- Persona: Sarah
- Goal: Create a local demo account and reach a first conversation as an adult.
- Starting point: [S01](http://127.0.0.1:5173/mobile?scenario=S01)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Account creation and email verification are simulated; any six digits work.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Welcome | Wait for Splash, enter Sarah and choose Get Started. | The sign-up sheet opens; it does not skip to the questions. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Create demo account | Enter sarah@example.com, demo-password-1 in both password fields, then Create account. Enter 444444. | You’re in appears, followed by Onboarding profile. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Choose profile basics | Choose Myself. Set DOB to 1998 (adult). Continue. Sex at birth Female → periods / hormonal stage / meds / supplements / Genesis Gold (no identity question for Male/Female). | Female sex skips identity; Female adult bank runs, then Ask Deborah. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Start chatting | Choose Start chatting. | Conversation opens with Sarah as the active profile. | ☐ Pass ☐ Fail ☐ Blocked |
| 5. Ask Deborah | Send “I’ve been having headaches lately”. Agree to health-data processing if asked. Answer each relevant question; use None where appropriate. | Questions reflect the selected profile. Facts remain pending until confirmation. | ☐ Pass ☐ Fail ☐ Blocked |
| 6. Review and Confirm | When the answer finishes, inspect what Deborah noted. Choose Save to my profile. | The facts become confirmed. No guest sign-up card appears. A first-answer reminder offer may follow. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Invalid email or mismatched passwords → inline error; Sign in → returning-user path; Self under 13 → Ask a parent; Family member → relationship, name, consent; Safety concern → safety response; Missing basic → question before answer; Edit → M-2.13 → Use this → Save; Don’t save → discard pending facts.

## Self under 13 — age gate

- Persona: Sarah
- Goal: Verify someone under 13 cannot start their own consultation.
- Starting point: [S03](http://127.0.0.1:5173/mobile?scenario=S03)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Local age gate; full date of birth.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Choose Myself | Choose Myself. | Date of birth wheel appears. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Under-13 birth date | Set DOB to an age under 13 and Continue. | Ask a parent replaces onboarding. No chat or self sex/identity basics are saved. | ☐ Pass ☐ Fail ☐ Blocked |

## Teen dependent onboarding

- Persona: Emily
- Goal: Create Maya’s profile and open a conversation about them.
- Starting point: [S20](http://127.0.0.1:5173/mobile?scenario=S20)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: One account holder manages the dependent. No invitation, separate login or sharing permissions.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Who is this for? | Choose Family member or dependent. | Relationship options appear. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Relationship and name | Choose Daughter, enter Maya, then Continue. | The next title refers to this person. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Age and consent | Set birth year to 2011. Continue, read and check the agreement, then Continue. | Age-appropriate guardian-teen consent is required. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Sex at birth | Sex at birth Female (identity skipped) → answer teen Female intake (periods, stage, meds, supplements, Genesis Gold). | Start talking about Maya appears. | ☐ Pass ☐ Fail ☐ Blocked |
| 5. Switch and chat | Choose Start talking about Maya; send “Her periods have been really irregular”. | Profile banner identifies Maya; questions use third person. No product recommendation is permitted. | ☐ Pass ☐ Fail ☐ Blocked |
| 6. Finish and inspect | Answer the questions, request the answer if prompted, and review any noted facts. | Only the dependent’s profile is updated on confirmation; the account holder remains name-only. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Unchecked agreement → Continue disabled.

## Child dependent onboarding

- Persona: Emily
- Goal: Create Leo’s profile and open a conversation about them.
- Starting point: [S20](http://127.0.0.1:5173/mobile?scenario=S20)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: One account holder manages the dependent. No invitation, separate login or sharing permissions.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Who is this for? | Choose Family member or dependent. | Relationship options appear. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Relationship and name | Choose Son, enter Leo, then Continue. | The next title refers to this person. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Age and consent | Set birth year to 2017. Continue, read and check the agreement, then Continue. | Age-appropriate guardian-child consent is required. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Sex at birth | Sex at birth Male (identity skipped) → child basics (guardians, meds, allergies). | Start talking about Leo appears. | ☐ Pass ☐ Fail ☐ Blocked |
| 5. Switch and chat | Choose Start talking about Leo; send “He has trouble falling asleep”. | Profile banner identifies Leo; questions use third person. No product recommendation is permitted. | ☐ Pass ☐ Fail ☐ Blocked |
| 6. Finish and inspect | Answer the questions, request the answer if prompted, and review any noted facts. | Only the dependent’s profile is updated on confirmation; the account holder remains name-only. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Unchecked agreement → Continue disabled.

## Adult partner onboarding

- Persona: Helen
- Goal: Create James’s profile and open a conversation about them.
- Starting point: [S21](http://127.0.0.1:5173/mobile?scenario=S21)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: One account holder manages the dependent. No invitation, separate login or sharing permissions.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Who is this for? | Choose Family member or dependent. | Relationship options appear. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Relationship and name | Choose Partner, enter James, then Continue. | The next title refers to this person. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Age and consent | Set birth year to 1974. Continue, read and check the agreement, then Continue. | Age-appropriate adult-agreement consent is required. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Sex at birth | Sex at birth Male (identity skipped) → adult meds / supplements / Genesis Gold. | Start talking about James appears. | ☐ Pass ☐ Fail ☐ Blocked |
| 5. Switch and chat | Choose Start talking about James; send “He has no energy by the afternoon”. | Profile banner identifies James; questions use third person. Male 40–54 journey applies. | ☐ Pass ☐ Fail ☐ Blocked |
| 6. Finish and inspect | Answer the questions, request the answer if prompted, and review any noted facts. | Only the dependent’s profile is updated on confirmation; the account holder remains name-only. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Unchecked agreement → Continue disabled.

## Health profile through conversation

- Persona: Sarah
- Goal: Build a health profile gradually without silent saving.
- Starting point: [S14](http://127.0.0.1:5173/mobile?scenario=S14)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Scripted questions and answers; local pending/confirmed facts.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Ask Deborah | Send “I’ve been having headaches lately”. Agree to health-data processing if asked. Answer each relevant question; use None where appropriate. | Questions reflect the selected profile. Facts remain pending until confirmation. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Answer relevant questions | Choose Regular cycles; answer the headache questions. Choose None for conditions, medicines or allergies when offered. | The female-cycling path is selected. Safety questions precede any product recommendation. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Review and Confirm | When the answer finishes, inspect what Deborah noted. Choose Save to my profile. | The facts become confirmed. No guest sign-up card appears. A first-answer reminder offer may follow. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Inspect health profile | Open the conversation’s Your health profile action/menu. | Confirmed information is shown with its conversation source. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Safety concern → safety response; Missing basic → question before answer; Edit → M-2.13 → Use this → Save; Don’t save → discard pending facts.

## Returning user consultation

- Persona: Maria
- Goal: Return to Home with history and start or continue a conversation.
- Starting point: [R01](http://127.0.0.1:5173/mobile?scenario=R01)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Seeded account and history; responses are scripted.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Returning Home | Inspect the Home summary and Continue option. | Past consultation and profile context are available; no onboarding form. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Continue or ask | Open Continue, or Ask Deborah. If the scripted first consult opens, follow its options. | Existing history is preserved and the chosen conversation opens. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Finish consultation | Follow the displayed questions and review any facts before saving. | An answer or explicit safety outcome is delivered; previously known basics are reused. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Continue → previous conversation; Ask → new/scripted consultation.

## Sign in and restore history

- Persona: Maria
- Goal: Reach returning Home through the sign-in entry.
- Starting point: [S01](http://127.0.0.1:5173/mobile?scenario=S01)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Any demo credentials and six digits restore R01; no real authentication.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Sign in | Wait for Welcome and choose Sign in. Enter maria@example.com and demo-password-1. | Sign-in mode has no confirm-password field. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Verify demo code | Submit and enter 444444. | Returning Home and R01 history load; onboarding does not appear. | ☐ Pass ☐ Fail ☐ Blocked |

## Review facts — save

- Persona: Elena
- Goal: Verify save behavior for pending health facts.
- Starting point: [S19](http://127.0.0.1:5173/mobile?scenario=S19)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Seeded answer with three pending facts; writes remain local.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Inspect pending facts | Read the Review and Confirm card. | Three facts are pending, not yet confirmed. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Resolve review | Choose Save to my profile. | Selected facts reach the correct profile and carry a confirmation source. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Check resulting profile | Open Your health profile from the chat header/menu. | The profile agrees with the choice you made. Discarded facts do not appear as confirmed. | ☐ Pass ☐ Fail ☐ Blocked |

## Review facts — edit

- Persona: Elena
- Goal: Verify edit behavior for pending health facts.
- Starting point: [S19](http://127.0.0.1:5173/mobile?scenario=S19)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Seeded answer with three pending facts; writes remain local.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Inspect pending facts | Read the Review and Confirm card. | Three facts are pending, not yet confirmed. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Edit a fact | Choose Edit, open a fact, select a different value, then Use this. | The revised value remains pending until Save. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Resolve review | Choose Save to my profile. | Selected facts reach the correct profile and carry a confirmation source. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Check resulting profile | Open Your health profile from the chat header/menu. | The profile agrees with the choice you made. Discarded facts do not appear as confirmed. | ☐ Pass ☐ Fail ☐ Blocked |

## Review facts — discard

- Persona: Elena
- Goal: Verify discard behavior for pending health facts.
- Starting point: [S19](http://127.0.0.1:5173/mobile?scenario=S19)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Seeded answer with three pending facts; writes remain local.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Inspect pending facts | Read the Review and Confirm card. | Three facts are pending, not yet confirmed. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Resolve review | Choose Don’t save. | Pending facts are discarded; existing profile fields are unchanged. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Check resulting profile | Open Your health profile from the chat header/menu. | The profile agrees with the choice you made. Discarded facts do not appear as confirmed. | ☐ Pass ☐ Fail ☐ Blocked |

## Add and switch family profiles

- Persona: Emily
- Goal: Add a teen through Family profiles and check isolated history.
- Starting point: [S09](http://127.0.0.1:5173/mobile?scenario=S09)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Managed profiles in one local account, not separate users.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open family profiles | Open the sidebar → Settings → Family profiles (or the profile switcher → Manage profiles). | Existing profiles and Add a family member are available. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Add Maya | Choose Add a family member. Enter Maya, Daughter, 2011-04-10 and Female. Read and check guardian consent. | The Create profile action enables only with required data and consent. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Create and switch | Choose Create profile. | Maya becomes active. Chat identifies Maya and uses minor rules. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Verify separation | Send a question, then use the profile switcher to return to the account holder. | The teen’s question is absent from the account holder’s chat. Switch back to confirm it remains on Maya’s profile. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Future DOB → error; Under 13 → blocked; Cancel with edits → discard confirmation.

## Teen invitation and sharing

- Persona: Emily
- Goal: Invite Maya to her own account and manage teen-controlled access.
- Starting point: Unavailable
- Implementation: NOT IMPLEMENTED
- Verification: UNTESTED
- Simulation: Unavailable. Managed dependent profiles do not provide a separate login.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Guardian setup | Use Teen dependent onboarding or Add and switch family profiles for the existing managed-profile portion. | A guardian-managed profile exists. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Send invitation | Unavailable in the current implementation. | Journey stops: no invite or recipient account exists. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Missing → invitation acceptance; Missing → teen-controlled sharing.

## Adult invitation and access permissions

- Persona: Helen
- Goal: Receive an invitation as an adult and approve what another person can access.
- Starting point: Unavailable
- Implementation: NOT IMPLEMENTED
- Verification: UNTESTED
- Simulation: Unavailable. The adult agreement checkbox is not recipient approval or access enforcement.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Adult agreement | Use Adult partner onboarding to inspect the existing account-holder agreement. | Only a managed dependent profile is created. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Recipient approval | Unavailable in the current implementation. | Journey stops before any recipient-controlled permission is claimed. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Missing → receive and accept; Missing → configure or revoke access.

## Lab attachment and confirmation

- Persona: Maria
- Goal: Experience the lab attachment interface and confirm sample results.
- Starting point: [S08](http://127.0.0.1:5173/mobile?scenario=S08)
- Implementation: PARTIALLY IMPLEMENTED
- Verification: UNTESTED
- Simulation: Photo view is simulated. PDF selection uses a real picker, but contents are never read or uploaded; all files map to the same sample.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open lab attachment | From My Health open records → Labs → Add. | Add your lab results opens. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Use sample photo | Choose Take a photo of the report, capture and use the simulated photo. | A processing state leads to sample results, regardless of an actual document. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Review results | Edit a sample value. Check the lab and collection date, then Looks right — send to Deborah. | The confirmed report belongs to the active profile; conversation opens. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Photo → simulated camera; PDF → local file picker; choose only synthetic data; Manual → empty values form.

## Lab-informed answer and records

- Persona: Maria
- Goal: Inspect a confirmed report and its lab-informed answer.
- Starting point: [S08](http://127.0.0.1:5173/mobile?scenario=S08)
- Implementation: PARTIALLY IMPLEMENTED
- Verification: UNTESTED
- Simulation: Seeded lab values and scripted analysis; not AI document understanding.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open stored labs | From My Health open records → Labs, then a report. | Stored confirmed values appear for this profile. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Ask about results | Choose Ask Deborah about these labs. | A lab-informed consultation opens or generates using the confirmed values. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Check output | Read the answer and its referenced lab values; handle any review card. | Lab references match the local report. Health facts are confirmed separately; no unreviewed document extraction is implied. | ☐ Pass ☐ Fail ☐ Blocked |

## Doctor visit notes

- Persona: Maria
- Goal: Write and retrieve a note from a provider visit.
- Starting point: [S08](http://127.0.0.1:5173/mobile?scenario=S08)
- Implementation: PARTIALLY IMPLEMENTED
- Verification: UNTESTED
- Simulation: Text editor and local autosave. No visit audio recording or transcription.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open Visit Notes | From My Health open records → Visit Notes → New note. | Note editor opens. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Write a note | Title: October follow-up. Choose After my visit. Enter “Discuss sleep diary at next appointment.” | Text is editable and locally autosaved. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Close and reopen | Close, find the note in Visit Notes, then reopen it. | Title, type and text remain on the active profile. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: More options → Delete → confirmation; Reset journey → note is removed with the seed reset.

## My Visit Notes — provider brief

- Persona: Maria
- Goal: Review a structured provider note, save/print it, and schedule the right follow-up.
- Starting point: [S24](http://127.0.0.1:5173/mobile?scenario=S24)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Assembled from the conversation answer + profile. HTML print preview (no real PDF file). Notifications are local timers.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open brief | Load S24 (or from S04 tap Discuss with provider). | M-9.7 shows header, sections 1–7, disclaimer. Chief complaint editable. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Save a copy | Edit chief complaint slightly. Tap Save a copy. | Toast; note appears under Visit Notes as “For my provider”. Appointment date prompt appears. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Follow-up | Choose No (no appointment date). | Toast about taking notes; 7-day check-in queued. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Download PDF → print preview of the same brief; S23 → Discuss with provider (if shown) or Visit Notes → “Let’s talk first — download turned off”.

## Medication update and conflict limits

- Persona: Elena
- Goal: Review and correct a proposed medication update.
- Starting point: [S19](http://127.0.0.1:5173/mobile?scenario=S19)
- Implementation: PARTIALLY IMPLEMENTED
- Verification: UNTESTED
- Simulation: Structured review/edit/confirm exists. General medication reconciliation and conflict resolution are not implemented.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Inspect medicines | In Review and Confirm inspect the medication fact. Choose Edit and open Medications. | You can change the pending medication value before saving. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Correct and confirm | Select the appropriate option or edit the text where offered. Choose Use this, then Save to my profile. | Only the confirmed value reaches the profile. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Check source | Open Your health profile and inspect medications and confirmation source. | The corrected value is present; there is no separate conflict-comparison screen. | ☐ Pass ☐ Fail ☐ Blocked |

## Conversation history and continuation

- Persona: Maria
- Goal: Read past conversations and continue the selected one.
- Starting point: [R01](http://127.0.0.1:5173/mobile?scenario=R01)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Local seeded transcript; PDF is an HTML preview and Share copies text.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open history | Use sidebar → My Health records, or My Health → records. Select Consultations. | Past conversations are listed. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Read transcript | Open a conversation. | The selected transcript and answer appear. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Preview export | Choose Download PDF, inspect preview, then Done. | An HTML print-style preview opens; no real PDF generation is claimed. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Continue | Choose Continue chat. | That conversation becomes active, preserving its messages. | ☐ Pass ☐ Fail ☐ Blocked |

## Account and privacy controls

- Persona: Maria
- Goal: Inspect settings, request a demo export and test local deletion.
- Starting point: [R01](http://127.0.0.1:5173/mobile?scenario=R01)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Export request, notifications and account deletion affect mock state only; no email or remote deletion occurs.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open Settings | Open sidebar → Settings. | Account details and settings rows appear. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Notifications and legal | Inspect Notifications and Terms & disclaimer, then return to Settings. | Reminder settings and accepted legal version are visible. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Request demo export | Open Privacy & data → Download my data → Request. | Requested date appears; no file or email is delivered. | ☐ Pass ☐ Fail ☐ Blocked |
| 4. Test local deletion | Choose Delete my account and all data. First cancel; repeat, continue, type DELETE and confirm. | Cancel preserves state. Confirm returns to Splash/Welcome with the local account cleared. Reset restores the seed. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Cancel → preserve state; Confirm → local reset.

## Follow-up reminder and check-in

- Persona: Maria
- Goal: Open a generic reminder and reply to the check-in.
- Starting point: [S07](http://127.0.0.1:5173/mobile?scenario=S07)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Simulated lock screen and notification delivery, not OS push.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Open reminder | Select the notification on the simulated lock screen. | The matching profile opens in check-in mode. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Reply to check-in | Choose a displayed reply and follow the branch. | A check-in reply, suggested next question or lab request follows. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Better → progress response; Same/worse → follow-up questions or labs.

## Trial limit and plan selection

- Persona: Maria
- Goal: Reach the trial gate and experience a simulated upgrade.
- Starting point: [S06](http://127.0.0.1:5173/mobile?scenario=S06)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Prices and payment are mock UI; no purchase or card transaction occurs.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Trial limit | Inspect the free-limit sheet. Choose the plan action. | Choose plan opens. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Choose plan | Choose Individual or Family, then continue through the simulated payment flow. | Existing account skips create-account. Payment completion shows success. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Return to chat | Choose the main continue action. | Conversation resumes and the local plan is updated. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Maybe later → return to app.

## Family plan gate

- Persona: Maria
- Goal: Check adding another person requires a Family plan.
- Starting point: [S10](http://127.0.0.1:5173/mobile?scenario=S10)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Simulated subscription gate.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Try adding a person | In the profile switcher choose Add a family member. | Upgrade to Family appears rather than the member form. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Inspect plan choice | Choose Upgrade to Family. | Family is preselected in Choose plan. | ☐ Pass ☐ Fail ☐ Blocked |

Alternate checks: Not now → close gate.

## Escalation and booking

- Persona: Maria
- Goal: Follow the human consultation path.
- Starting point: [S12](http://127.0.0.1:5173/mobile?scenario=S12)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Local availability, sharing checkbox and payment simulation; no real appointment.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Trigger escalation | Send “I still need help with my sleep”. Answer any displayed questions until the escalation offer. | A route to booking Deborah is offered. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Select a slot | Follow the booking offer, choose a displayed date/time and continue. | Booking details and history-sharing choice appear. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Confirm mock appointment | Review details; sharing is off unless selected. Complete the simulated booking. | A local confirmation appears, without making a real appointment. | ☐ Pass ☐ Fail ☐ Blocked |

## Emergency safety

- Persona: Maria
- Goal: Check the existing safety boundary.
- Starting point: [S13](http://127.0.0.1:5173/mobile?scenario=S13)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Scripted guardrail matching; clinical copy is placeholder.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Capture baseline | Note the free-consultation count and current profile. | Baseline is visible in the testing panel. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Send safety input | Send “I have chest pain and trouble breathing”. | Emergency response; no normal answer, product or consultation charge. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Verify outcome | Inspect the response and compare the consultation count. | The safety response does not count as a completed consultation. Reset before testing a different safety input. | ☐ Pass ☐ Fail ☐ Blocked |

## Medication safety

- Persona: Maria
- Goal: Check the existing safety boundary.
- Starting point: [S13](http://127.0.0.1:5173/mobile?scenario=S13)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Scripted guardrail matching; clinical copy is placeholder.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Capture baseline | Note the free-consultation count and current profile. | Baseline is visible in the testing panel. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Send safety input | Send “Can I stop taking my medication?”. | Medication safety response; no instruction to stop medication. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Verify outcome | Inspect the response and compare the consultation count. | The safety response does not count as a completed consultation. Reset before testing a different safety input. | ☐ Pass ☐ Fail ☐ Blocked |

## Out-of-scope question

- Persona: Maria
- Goal: Check the existing safety boundary.
- Starting point: [S13](http://127.0.0.1:5173/mobile?scenario=S13)
- Implementation: IMPLEMENTED
- Verification: UNTESTED
- Simulation: Scripted guardrail matching; clinical copy is placeholder.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Capture baseline | Note the free-consultation count and current profile. | Baseline is visible in the testing panel. | ☐ Pass ☐ Fail ☐ Blocked |
| 2. Send safety input | Send “Can you help me fix my car?”. | Scope explanation instead of invented health advice. | ☐ Pass ☐ Fail ☐ Blocked |
| 3. Verify outcome | Inspect the response and compare the consultation count. | The safety response does not count as a completed consultation. Reset before testing a different safety input. | ☐ Pass ☐ Fail ☐ Blocked |

## Guidance — happy path + What’s next

- Persona: Alex (demo onboarding) / Maria for manual S04
- Goal: End-to-end Miro Step 4 happy path through Book.
- Auto: **▶ Journeys → Ask Deborah guidance → Guidance · happy path + Book** (S01 onboarding E2E).
- Manual starting point: [S04](http://127.0.0.1:5173/mobile?scenario=S04)
- Implementation: IMPLEMENTED
- Verification: VERIFIED 16 Oct 2026 — auto `guidance-happy` finished at M-8.2; manual S04 → Book → M-8.2.
- Simulation: Live onboarding + scripted answer; OptionRows only.
- Chevron (auto spine): Welcome / signup / profile → Start chatting → headaches → health consent → Yes that’s it → other issues → type goal → meds → Yes that’s everything → red-flag None → 7 sections → Review Save → What’s next → Book a consultation → M-8.2 → toast Journey finished.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Onboarding | Auto: Splash → Welcome → sign-up → Myself / birth year / sex → Start chatting. | M-2.1 empty chat. | ☑ Pass ☐ Fail ☐ Blocked |
| 2. Opening + intake | Headaches → consent → Yes that’s it → other issues → type goal → meds → complete. | Reaches ready / Tell me what you think. | ☑ Pass ☐ Fail ☐ Blocked |
| 3. Guidance | Tell me what you think → 7 sections → Review Save. | What’s next under AnswerActions. | ☑ Pass ☐ Fail ☐ Blocked |
| 4. Book | Auto taps Book a consultation. | Demo team toast; M-8.2; Journey finished toast (not idle timeout). | ☑ Pass ☐ Fail ☐ Blocked |

## Guidance — early first look

- Persona: Maria
- Goal: Requesting an answer mid-intake yields an early first look, not a counted consultation.
- Auto: **▶ Journeys → Guidance · early first look** (S23).
- Manual starting point: [S23](http://127.0.0.1:5173/mobile?scenario=S23)
- Implementation: IMPLEMENTED
- Verification: VERIFIED 16 Oct 2026 — auto `guidance-early`: mid-intake ASK → early first look copy → finish intake → 7 sections → Review Save → Journey finished.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Request early | Auto types Tell me what you think mid-intake (or tap/type manually). | Deborah lists what’s still missing; free count unchanged. | ☑ Pass ☐ Fail ☐ Blocked |
| 2. Finish and ask again | Answer remaining questions, then request guidance. | Seven sections stream; consultation counts once; journey finished. | ☑ Pass ☐ Fail ☐ Blocked |

## Guidance — out of coverage

- Persona: Maria
- Goal: Uncovered concern routes to team handoff without counting.
- Auto: **▶ Journeys → Guidance · out of coverage** (S05 + cataract phrase).
- Manual starting point: [S13](http://127.0.0.1:5173/mobile?scenario=S13) Safety bench → Uncovered, or S05.
- Implementation: IMPLEMENTED
- Verification: VERIFIED 16 Oct 2026 — auto `guidance-uncovered`: cataract phrase → intake → outside-coverage body → Journey finished (uncounted).

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Send uncovered phrase | Auto sends cataract recovery phrase (or Safety bench → Uncovered). | New consult starts. | ☑ Pass ☐ Fail ☐ Blocked |
| 2. Request guidance | Finish intake if needed; Tell me what you think. | Outside-coverage copy; team toast; Book available; free count unchanged; journey finished. | ☑ Pass ☐ Fail ☐ Blocked |

## Guidance — lab summary refresh

- Persona: Maria
- Goal: Upload labs from What’s next refreshes the same-topic summary without an extra free charge.
- Auto: **▶ Journeys → Guidance · lab summary refresh** (S04).
- Manual starting point: [S04](http://127.0.0.1:5173/mobile?scenario=S04)
- Implementation: IMPLEMENTED
- Verification: VERIFIED 16 Oct 2026 — auto `guidance-labs`: What’s next → camera → send → “I’ve updated this with your labs” → Journey finished.

| Step | Action / input | Expected result | Observed result |
| --- | --- | --- | --- |
| 1. Upload labs | Auto: What’s next → Upload labs → Take a photo → Use photo → Looks right — send to Deborah. | Updated seven-section answer (“I’ve updated this with your labs”); free count unchanged; journey finished. | ☑ Pass ☐ Fail ☐ Blocked |


## Provider-review ending — S22

Code and browser verified on 15 October 2026. Start at `/mobile?scenario=S22`.

| Action | Expected |
| --- | --- |
| Save to my profile | Truthful saved confirmation, then seven-section provider-directed answer. No product or trial charge. |
| Edit, change a fact, Use this, then Save | Wait while editing, save the revised value, then answer once. |
| Reset; Don't save | No profile facts saved; provider-directed answer still follows. |
| Try a normal S14 consultation with None of these | Existing normal answer/review/reminder flow. |
| Select an emergency symptom instead | Existing urgent safety interruption; no automatic ordinary answer. |

Contextual widget checks: multi-select plus Other must preserve all selected IDs; lab-request UploadCard opens the existing attachment sheet. See WIDGET_INTEGRATION_STATUS.md for the scoped verification record.
