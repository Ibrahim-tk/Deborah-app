# Contextual Widget Integration — Execution Record

15 October 2026

## Delivered

- Existing /wid ChoicePills and InlineConsent are used for matching standard chat questions.
- QuestionChoices shares stable-ID single/multi selection with the scripted consultation. Long or numerous options retain existing OptionRow controls; specialized year/date/measurement inputs remain intact.
- Multi-select keeps None exclusive and preserves selected options when adding Other text or returning to the options.
- Check-in replies use the existing choice widget. A lab request uses UploadCard to open the existing attachment/review flow, without falsely running the lab's fixed-file simulation.
- MoodScale, ScaleCheck, SlotPicker, ConfirmCard and ReminderCard remain on their existing compatible scripted nodes. Categorical questions have not been replaced with incompatible numeric/mood inputs. Standard reminder permission and booking screens remain in their existing flow.
- Resolved controls are noninteractive; the scripted custom-widget wrapper is inert for keyboard input after completion.
- The targeted non-emergency red-flag ending retains the profile review/save result, then generates the existing seven-section format with provider-directed placeholder content. It does not create products, a wellness plan, a reminder offer or a consultation charge. Emergency selections still use the existing urgent interruption.
- A shared finishReview engine input supports inline review and the Edit sheet without duplicate generation. Error/retry and scenario cancellation use the existing runner.
- The automatic journey player recognizes the widget markup and multi-select Continue interaction.
- S22 provides a reproducible provider-review case in the State menu.

## Validation

- `npm run test:journeys`: 11 passing contract tests, including all seed loads, ordinary/pregnancy/male/dependent answer routes, self/teen/child/partner onboarding profile context, review/discard/partial save, emergency protection, counting and cancellation.
- Browser: ordinary S14 consultation through all seven answer sections, multi-select with Other text, Save and the existing follow-up sheet.
- Browser: S22 Save produces a truthful saved confirmation followed by the provider-directed seven-section answer, with no shop offer.
- Browser: S07 notification → check-in → Yes → contextual upload widget → original lab attachment choices.
- TypeScript and production build pass. Lint has zero errors and the 12 existing warnings.
- Visual evidence: `.impeccable/review/desktop.png`, `mobile.png`, `contextual-widgets.jpg`, `provider-ending.jpg`.

## Design-system verification

This is an extension of the incumbent `/wid` components, with no new visual system. `DESIGN.md` and `.impeccable/design.json` remain unchanged. Checked `PRODUCT.md`, both system files, mobile semantic tokens, shared widget styles, QuestionChoices, ChoicePills, UploadCard, InlineConsent, IntakeQuestion, QuickReplies and AnswerSections; the mobile evidence shows the existing choices reused in chat. The adapter adds a spacing-only grid and preserves the existing row fallback for longer options. Existing discrepancies between the recorded system and shipped widgets (frosted pill surfaces, 44px controls and serif widget titles below 26px) are recorded as pre-existing drift, not approved rules; repair or system refresh is outside this interaction-only scope.

## Limits

This is a local scripted prototype. New provider-review copy is placeholder pending Deborah's approval. The full 27-journey manual matrix, largest-text-size review, all automatic playback runs and the separate dashboard remain unfinished; no claim of complete regression coverage is made.

## Manual checks

1. Load S14. Send a headache question, select stage, select multiple symptoms, then Continue. Confirm the next question is unchanged.
2. Include Other with two symptoms, enter synthetic text, submit. Confirm all three responses appear together.
3. Complete the safety questions with None of these. Confirm the ordinary seven-section answer, review, and reminder sequence.
4. Load S22. Save, or Edit then Save. Confirm Profile saved and the seven-section provider-review answer. Reset and choose Don't save to check the no-write path.
5. Load S07. Open the reminder, choose Yes, then Upload my labs. Confirm that the existing photo/PDF/manual choices open and no report is automatically saved.
