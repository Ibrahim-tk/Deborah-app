import { step as s, type ManualJourney } from './types';

export const EXTENDED_JOURNEYS: ManualJourney[] = [
  {
    id: 'family-add', name: 'Add and switch family profiles', persona: 'Emily', scenario: 'S09', status: 'IMPLEMENTED',
    goal: 'Add a teen through Family profiles and check isolated history.', behavior: 'Managed profiles in one local account, not separate users.', evidence: ['src/apps/mobile/screens/profiles/'], gaps: ['Under-13 additions are blocked here, although dependent onboarding permits a placeholder guardian path.'],
    steps: [s('Open family profiles', 'Open the sidebar → Settings → Family profiles (or the profile switcher → Manage profiles).', 'Existing profiles and Add a family member are available.', 'M-6.6'), s('Add Maya', 'Choose Add a family member. Enter Maya, Child, 2011-04-10 and Female. Read and check guardian consent.', 'The Create profile action enables only with required data and consent.', 'M-6.2', ['Future DOB → error', 'Under 13 → blocked', 'Cancel with edits → discard confirmation']), s('Create and switch', 'Choose Create profile.', 'Maya becomes active. Chat identifies Maya and uses minor rules.', 'M-2.1'), s('Verify separation', 'Send a question, then use the profile switcher to return to the account holder.', 'The teen’s question is absent from the account holder’s chat. Switch back to confirm it remains on Maya’s profile.')],
  },
  {
    id: 'teen-invitation', name: 'Teen invitation and sharing', persona: 'Emily', status: 'NOT IMPLEMENTED',
    goal: 'Invite Maya to her own account and manage teen-controlled access.', behavior: 'Unavailable. Managed dependent profiles do not provide a separate login.', evidence: ['docs/ux/F06-family-profiles.md', 'src/apps/mobile/screens/profiles/AddMember/'], gaps: ['No invitation delivery, acceptance screen, teen account role or sharing-permission model. Exact teen consent rules remain open.'],
    steps: [s('Guardian setup', 'Use Teen dependent onboarding or Add and switch family profiles for the existing managed-profile portion.', 'A guardian-managed profile exists.'), s('Send invitation', 'Unavailable in the current implementation.', 'Journey stops: no invite or recipient account exists.', undefined, ['Missing → invitation acceptance', 'Missing → teen-controlled sharing'])],
  },
  {
    id: 'adult-invitation', name: 'Adult invitation and access permissions', persona: 'Helen', status: 'NOT IMPLEMENTED',
    goal: 'Receive an invitation as an adult and approve what another person can access.', behavior: 'Unavailable. The adult agreement checkbox is not recipient approval or access enforcement.', evidence: ['docs/ux/F06-family-profiles.md', 'src/apps/mobile/screens/profiles/AddMember/'], gaps: ['No recipient account, pending invitation, acceptance, revocation or scoped sharing permissions.'],
    steps: [s('Adult agreement', 'Use Adult partner onboarding to inspect the existing account-holder agreement.', 'Only a managed dependent profile is created.'), s('Recipient approval', 'Unavailable in the current implementation.', 'Journey stops before any recipient-controlled permission is claimed.', undefined, ['Missing → receive and accept', 'Missing → configure or revoke access'])],
  },
  {
    id: 'labs-upload', name: 'Lab attachment and confirmation', persona: 'Maria', scenario: 'S08', status: 'PARTIALLY IMPLEMENTED',
    goal: 'Experience the lab attachment interface and confirm sample results.', behavior: 'Photo view is simulated. PDF selection uses a real picker, but contents are never read or uploaded; all files map to the same sample.', evidence: ['src/apps/mobile/screens/followup/AddLabs/', 'src/apps/mobile/screens/followup/ConfirmLabs/'], gaps: ['No real OCR, upload, arbitrary medical-document parsing or file-content analysis.'],
    steps: [s('Open lab attachment', 'From My Health open records → Labs → Add.', 'Add your lab results opens.', 'M-5.3', ['Photo → simulated camera', 'PDF → local file picker; choose only synthetic data', 'Manual → empty values form']), s('Use sample photo', 'Choose Take a photo of the report, capture and use the simulated photo.', 'A processing state leads to sample results, regardless of an actual document.', 'M-5.4'), s('Review results', 'Edit a sample value. Check the lab and collection date, then Add Report.', 'The confirmed report belongs to the active profile; conversation opens.', 'M-2.1')],
  },
  {
    id: 'labs-analysis', name: 'Lab-informed answer and records', persona: 'Maria', scenario: 'S08', status: 'PARTIALLY IMPLEMENTED',
    goal: 'Inspect a confirmed report and its lab-informed answer.', behavior: 'Seeded lab values and scripted analysis; not AI document understanding.', evidence: ['src/apps/mobile/screens/records/LabReport/', 'src/shared/engine/labs.ts'], gaps: ['No actual AI analysis or automatic general medical-document-to-profile extraction.'],
    steps: [s('Open stored labs', 'From My Health open records → Labs, then a report.', 'Stored confirmed values appear for this profile.', 'M-9.5'), s('Ask about results', 'Choose Ask Deborah about these labs.', 'A lab-informed consultation opens or generates using the confirmed values.', 'M-2.1'), s('Check output', 'Read the answer and its referenced lab values; handle any review card.', 'Lab references match the local report. Health facts are confirmed separately; no unreviewed document extraction is implied.')],
  },
  {
    id: 'visit-notes', name: 'Doctor visit notes', persona: 'Maria', scenario: 'S08', status: 'PARTIALLY IMPLEMENTED',
    goal: 'Write and retrieve a note from a provider visit.', behavior: 'Text editor and local autosave. No visit audio recording or transcription.', evidence: ['src/apps/mobile/screens/records/NoteEditor/'], gaps: ['No doctor-visit audio capture, transcription or audio-to-profile flow. Chat dictation is also canned simulation.'],
    steps: [s('Open Visit Notes', 'From My Health open records → Visit Notes → New note.', 'Note editor opens.', 'M-9.4'), s('Write a note', 'Title: October follow-up. Choose After my visit. Enter “Discuss sleep diary at next appointment.”', 'Text is editable and locally autosaved.'), s('Close and reopen', 'Close, find the note in Visit Notes, then reopen it.', 'Title, type and text remain on the active profile.', 'M-9.4', ['More options → Delete → confirmation', 'Reset journey → note is removed with the seed reset'])],
  },
  {
    id: 'provider-brief', name: 'My Visit Notes — provider brief', persona: 'Maria', scenario: 'S24', status: 'IMPLEMENTED',
    goal: 'Review a structured provider note, save or print it, and schedule the right follow-up.',
    behavior: 'Assembled from the conversation answer and profile. HTML print preview; local follow-up notifications.',
    evidence: ['src/apps/mobile/screens/records/VisitBrief/', 'src/shared/engine/visitBrief.ts', 'docs/ux/F09b-visit-brief.md'],
    gaps: ['No real PDF file or email of the brief.'],
    steps: [
      s('Open brief', 'Load S24 (or from S04 tap Discuss with provider).', 'M-9.7 shows header, sections 1–7, disclaimer. Chief complaint editable.', 'M-9.7'),
      s('Save a copy', 'Edit chief complaint slightly. Tap Save a copy.', 'Toast; note under Visit Notes as For my provider. Appointment date prompt appears.'),
      s('Follow-up', 'Choose No (no appointment date).', 'Toast about taking notes; 7-day check-in queued.', undefined, ['Yes → day-after visit debrief (visit:<brief>, see Log your visit)', 'S23 → Let’s talk first toast']),
    ],
  },
  {
    id: 'log-visit', name: 'Log your visit — after the appointment', persona: 'Maria', scenario: 'S25', status: 'IMPLEMENTED',
    goal: 'Tell Deborah how a provider visit went, review what she noted, update the health profile and talk it through.',
    behavior: 'Keyword extraction (no AI) over typed text; at most three skippable follow-ups; nothing reaches the profile without Save. Local notifications only.',
    evidence: ['src/shared/engine/debrief.ts', 'src/shared/engine/visitExtract.ts', 'src/shared/engine/visitOutcome.ts', 'src/apps/mobile/screens/records/LogVisit/', 'docs/ux/F09c-log-visit.md'],
    gaps: ['Extraction is rule-based and misses unusual phrasing. Medication card and out-of-scope rules apply unchanged inside the debrief (OPEN in F09c › Safety). No voice transcript of the visit itself.'],
    steps: [
      s('Open from notification', 'Load S25. Tap “Deborah: How did your appointment go?” on the lock screen.', 'Visit debrief opens: “Welcome back, Maria. How did your visit go?” with Tell Deborah · Fill it in myself · Not now.', 'M-2.1', ['Home → “How did your visit go?”', 'Records → New note → Log a provider visit', 'Chat: “I just saw my endocrinologist…” → Log my visit']),
      s('Tell Deborah', 'Tap Tell Deborah. Send: “Saw my gynecologist. She said it’s probably perimenopause. She ordered FSH. She started me on progesterone cream and told me to stop magnesium glycinate.”', 'No follow-up questions needed. Summary card lists provider, what they said, FSH (ordered), both medication changes and two health profile updates.', 'M-2.1', ['Shorter message → up to 3 follow-ups, each with Skip', '“Should I stop taking my magnesium?” → medication card (S25d), nothing logged']),
      s('Review and save', 'Tap Review and save. Untick “Remove magnesium glycinate”. Save.', 'Toast “Saved — health profile updated”. Chat: “Saved to My Visit Notes, and your health profile has 1 change.”', 'M-9.8', ['Looks right, save → saves from chat and applies all updates', 'Close with edits → Save this visit? alert']),
      s('Discuss with Deborah', 'Tap Yes, let’s talk, then send “I keep waking up hot at night”.', 'A normal (counted) consultation starts in the same thread; its answer opens with “After your gynecology visit on Oct 22, 2026, you noted: …”.', 'M-2.1', ['Not now → saved, chat ends']),
      s('Reopen', 'Open My Health records → Visit Notes → After my gynecology visit (or load S25c).', 'Read mode with Edit · Share · Delete; “Your notes before the visit” opens the linked brief.', 'M-9.8'),
    ],
  },
  {
    id: 'medication-update', name: 'Medication update and conflict limits', persona: 'Elena', scenario: 'S19', status: 'PARTIALLY IMPLEMENTED',
    goal: 'Review and correct a proposed medication update.', behavior: 'Structured review/edit/confirm exists. General medication reconciliation and conflict resolution are not implemented.', evidence: ['src/apps/mobile/screens/consultation/ReviewFacts/', 'src/shared/store/slices/conversations.ts'], gaps: ['No dedicated conflict detection, competing-source comparison or conflict-resolution workflow. Free-text extraction is limited.'],
    steps: [s('Inspect medicines', 'In Review and Confirm inspect the medication fact. Choose Edit and open Medications.', 'You can change the pending medication value before saving.', 'M-2.13'), s('Correct and confirm', 'Select the appropriate option or edit the text where offered. Choose Use this, then Save to my profile.', 'Only the confirmed value reaches the profile.'), s('Check source', 'Open My Health and inspect Medications on the Health profile card.', 'The corrected value is present; there is no separate conflict-comparison screen.', 'M-7.2')],
  },
  {
    id: 'history', name: 'Conversation history and continuation', persona: 'Maria', scenario: 'R01', status: 'IMPLEMENTED',
    goal: 'Read past conversations and continue the selected one.', behavior: 'Local seeded transcript; PDF is an HTML preview and Share copies text.', evidence: ['src/apps/mobile/screens/records/ConsultationDetail/', 'src/apps/mobile/screens/records/Records/'], gaps: ['No server history synchronization; PDF preview is not a generated PDF file.'],
    steps: [s('Open history', 'Use sidebar → My Health records, or My Health → records. Select Consultations.', 'Past conversations are listed.', 'M-9.1'), s('Read transcript', 'Open a conversation.', 'The selected transcript and answer appear.', 'M-9.2'), s('Preview export', 'Choose Download PDF, inspect preview, then Done.', 'An HTML print-style preview opens; no real PDF generation is claimed.', 'M-9.6'), s('Continue', 'Choose Continue chat.', 'That conversation becomes active, preserving its messages.', 'M-2.1')],
  },
  {
    id: 'account-privacy', name: 'Account and privacy controls', persona: 'Maria', scenario: 'R01', status: 'IMPLEMENTED',
    goal: 'Inspect settings, request a demo export and test local deletion.', behavior: 'Export request, notifications and account deletion affect mock state only; no email or remote deletion occurs.', evidence: ['src/apps/mobile/screens/account/'], gaps: ['Export only records a request timestamp; legal text is placeholder.'],
    steps: [s('Open Settings', 'Open sidebar → Settings.', 'Account details and settings rows appear.', 'M-10.1'), s('Notifications and legal', 'Inspect Notifications and Terms & disclaimer, then return to Settings.', 'Reminder settings and accepted legal version are visible.'), s('Request demo export', 'Open Privacy & data → Download my data → Request.', 'Requested date appears; no file or email is delivered.', 'M-10.2'), s('Test local deletion', 'Choose Delete my account and all data. First cancel; repeat, continue, type DELETE and confirm.', 'Cancel preserves state. Confirm returns to Splash/Welcome with the local account cleared. Reset restores the seed.', undefined, ['Cancel → preserve state', 'Confirm → local reset'])],
  },
  {
    id: 'followup', name: 'Follow-up reminder and check-in', persona: 'Maria', scenario: 'S07', status: 'IMPLEMENTED',
    goal: 'Open a generic reminder and reply to the check-in.', behavior: 'Simulated lock screen and notification delivery, not OS push.', evidence: ['src/shell/device/LockScreen/', 'src/shared/engine/checkin.ts'], gaps: [],
    steps: [s('Open reminder', 'Select the notification on the simulated lock screen.', 'The matching profile opens in check-in mode.', 'M-2.1'), s('Reply to check-in', 'Choose a displayed reply and follow the branch.', 'A check-in reply, suggested next question or lab request follows.', 'M-2.1', ['Better → progress response', 'Same/worse → follow-up questions or labs'])],
  },
  {
    id: 'upgrade', name: 'Trial limit and plan selection', persona: 'Maria', scenario: 'S06', status: 'IMPLEMENTED',
    goal: 'Reach the trial gate and experience a simulated upgrade.', behavior: 'Prices and payment are mock UI; no purchase or card transaction occurs.', evidence: ['src/apps/mobile/screens/plans/', 'docs/ux/F04-plans-account.md'], gaps: ['Payment and subscription management are simulated.'],
    steps: [s('Trial limit', 'Inspect the free-limit sheet. Choose the plan action.', 'Choose plan opens.', 'M-4.2', ['Maybe later → return to app']), s('Choose plan', 'Choose Individual or Family, then continue through the simulated payment flow.', 'Existing account skips create-account. Payment completion shows success.', 'M-4.5'), s('Return to chat', 'Choose the main continue action.', 'Conversation resumes and the local plan is updated.', 'M-2.1')],
  },
  {
    id: 'family-upgrade', name: 'Family plan gate', persona: 'Maria', scenario: 'S10', status: 'IMPLEMENTED',
    goal: 'Check adding another person requires a Family plan.', behavior: 'Simulated subscription gate.', evidence: ['src/apps/mobile/screens/profiles/UpgradeFamily/', 'src/shared/store/selectors.ts'], gaps: [],
    steps: [s('Try adding a person', 'In the profile switcher choose Add a family member.', 'Upgrade to Family appears rather than the member form.', 'M-6.3'), s('Inspect plan choice', 'Choose Upgrade to Family.', 'Family is preselected in Choose plan.', 'M-4.2', ['Not now → close gate'])],
  },
  {
    id: 'booking', name: 'Escalation and booking', persona: 'Maria', scenario: 'S12', status: 'IMPLEMENTED',
    goal: 'Follow the human consultation path.', behavior: 'Local availability, sharing checkbox and payment simulation; no real appointment.', evidence: ['src/apps/mobile/screens/booking/', 'docs/ux/F08-book-deborah.md'], gaps: ['No real telehealth availability or booking service.'],
    steps: [s('Trigger escalation', 'Send “I still need help with my sleep”. Answer any displayed questions until the escalation offer.', 'A route to booking Deborah is offered.', 'M-2.1'), s('Select a slot', 'Follow the booking offer, choose a displayed date/time and continue.', 'Booking details and history-sharing choice appear.', 'M-8.2'), s('Confirm mock appointment', 'Review details; sharing is off unless selected. Complete the simulated booking.', 'A local confirmation appears, without making a real appointment.', 'M-8.4')],
  },
  ...([
    ['emergency', 'Emergency safety', 'I have chest pain and trouble breathing', 'Emergency response; no normal answer, product or consultation charge.'],
    ['medication-safety', 'Medication safety', 'Can I stop taking my medication?', 'Medication safety response; no instruction to stop medication.'],
    ['out-of-scope', 'Out-of-scope question', 'Can you help me fix my car?', 'Scope explanation instead of invented health advice.'],
  ] as const).map(([id, name, message, expected]): ManualJourney => ({
    id, name, persona: 'Maria', scenario: 'S13', status: 'IMPLEMENTED', goal: 'Check the existing safety boundary.', behavior: 'Scripted guardrail matching; clinical copy is placeholder.', evidence: ['src/shared/engine/guardrails.ts', 'src/shared/data/safety/'], gaps: [],
    steps: [s('Capture baseline', 'Note the free-consultation count and current profile.', 'Baseline is visible in the testing panel.'), s('Send safety input', `Send “${message}”.`, expected, 'M-2.1'), s('Verify outcome', 'Inspect the response and compare the consultation count.', 'The safety response does not count as a completed consultation. Reset before testing a different safety input.')],
  })),
];
