# F02 — Core consultation

**Goal:** Maria describes how she feels; Deborah listens, asks a few light questions, and — when Maria asks — answers in her 7-section framework. One completed answer = one consultation.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
**Engine:** `docs/07-ai-simulation.md` · **Scenarios:** S02, S03, S04, S05, S13

```
M-2.1 empty ─tap composer─► focused (3 suggestions) ─send/suggestion─► intake Q1 ─► Q2 ─► Q3 ─► ready
   ─"Tell me what you think"─► generating ─► answered (7 sections) ─► [first time] M-2.8 opt-in sheet
answered ─ Shop ─► M-2.7 · Save PDF ─► M-9.6 · Visit Notes ─► M-9.4 · follow-up question ─► short reply
answered ─ new topic ─► (trial left? new consultation : M-4.1 Free limit)
Any Deborah turn may be replaced/augmented by F03 safety states.
```

---

## M-2.1 · Conversation  {#m-21-conversation}

| Meta | |
|---|---|
| Presentation | Tab root of **Ask Deborah**; tab bar visible except while keyboard is open |
| Entry | Onboarding completion · tab bar · deep links (check-in) · "Ask about this" (M-7.4) · "Tell Deborah how it's going" (M-7.3) · "Continue chat" (M-9.2) · profile switch |
| Exit | See map above + tab bar |
| Params | `{ mode?: 'checkin' , prefill?: string, conversationId?: string }` |

**Purpose:** the heart of the product — a conversation that feels like a consultation with Deborah, not a chatbot.

### Layout (top → bottom)

1. **ConversationHeader** — left: active profile avatar (initial) with tiny chevron → M-6.1; centre: "Ask Deborah"; right: `(i)` → action sheet (About this app & disclaimer → M-10.5 · About Deborah → M-7.6 · Book Deborah → M-8.2 · Start a new conversation).
2. **ProfileBanner** (only when active profile ≠ self) — "Asking for: {name} ({age label}) · switch".
3. **Message list** (scroll area, newest at bottom). Contains `Greeting`, bubbles, intake questions, answers, safety cards.
4. **TrialCounter** — plain `subhead` text above the composer (trial only): "3 free consultations left" / "1 free consultation left". Hidden on paid plans.
5. **SuggestionList** (focused + empty only) — three starter prompts above the composer.
6. **Composer** — auto-growing text area (1–5 lines), placeholder "Describe how you're feeling…", mic button, send button (becomes **Stop** while generating), char counter from 1,800.
7. **Tab bar.**

### States

| State | What's visible | Notes |
|---|---|---|
| **empty** | Greeting block centred-top: Deborah avatar, "Good evening, Maria. What's on your mind today?" (time-of-day from simulated clock). Returning: "Welcome back, Maria. Last time we talked about {topic}." + option row **Continue that conversation**. TrialCounter, composer, tab bar. | Figma 2.1 |
| **focused** | Keyboard up (SimKeyboard if enabled), "Try asking:" + 3 suggestions from `suggestions.json` (`teen` set for teen profiles). Tab bar hidden. | Figma 2.2 |
| **intake** | User bubble → `ProgressStatus` (0.8–1.2 s) → Deborah text with question → `IntakeQuestion` option rows (2-column grid for short answers), "Quick question n of N · Skip", secondary **Tell me what you think** (from Q1). Composer placeholder "Or type your answer…" | Figma 2.3–2.4 |
| **ready** | Deborah `readyLine` + `SuggestedQuestions` (dashed card, tappable) + primary **Tell me what you think** | Figma 2.4 |
| **generating** | User bubble "Tell me what you think" → Deborah line "Let me look at this through my framework…" → `ThinkingIndicator` ("Deborah is reviewing your answers") 1.2–2 s → sections stream. Composer locked; send → **Stop**. Dynamic Island pulse (vanity). | Figma 2.5 |
| **answered** | `AnswerSections` (7) + `AnswerActions` + `SuggestedQuestions` for follow-ups; composer unlocked | Figma 2.6 |
| **follow-up reply** | Short Deborah text reply (not 7 sections) to a question within an answered consultation | — |
| **error** | `ErrorBubble`: "I couldn't finish that — tap to try again." + Retry | not counted |
| **stopped** | Partial answer with label "Stopped" + "Continue" link (re-runs) | not counted |
| **safety** | See F03 (emergency locks composer) | — |
| **checkin** | Opened with `mode: 'checkin'`: Deborah opens with memory line + Yes / Partly / Not yet option rows | F05 |
| **gated** | Sending a new-topic message with 0 free left → message stays in composer, M-4.1 sheet presents | F04 |

### Interactions

| Trigger | Result |
|---|---|
| Tap composer | focused state; suggestions visible if conversation is empty |
| Tap a suggestion | Sends it as a user message immediately; uses its `scriptId` |
| Send text | Engine pipeline (07 §2). Clears composer. Haptic (visual). |
| Tap intake option (single) | Answer recorded as user bubble (option label), next question after 0.6–1 s |
| Tap options (multi) + **Done** | Multi-select rows show checks; a "Done" primary button records all |
| Skip | Records skip; next question |
| Tell me what you think | Generating → answered |
| Tap a suggested question | Sends it; within intake/ready it's a follow-up reply; after answer it's a follow-up reply or new topic |
| Mic | Simulated recording state in the composer: mic icon, timer and "Listening…" (no waveform), tap to stop → transcript (canned, from current script context) inserted into composer for editing. OPEN: Premium gating — prototype allows for all |
| Stop | Cancels stream; marks stopped |
| Scroll up during stream | Auto-scroll pauses; round scroll-to-latest icon button appears; tap scrolls to bottom |
| Long-press a Deborah bubble | Context menu: Copy · Save to Visit Notes |
| Avatar | M-6.1 |
| Continue that conversation | Scrolls/loads the last conversation for this profile |
| "Start a new conversation" ((i) menu) | Archives current (keeps in records), shows empty state |

### Data
Reads: active profile, conversation for profile, subscription, labs, permission. Writes via engine bridge: messages, intake, counters, summary, plan90 creation, notifications schedule (via M-2.8).

### Acceptance
- [ ] Every state above reachable through interaction or scenario (S02 empty, S03 intake, S04 answered, S05 last free, S13 safety).
- [ ] Only one intake question visible at a time; skip always available; max 3.
- [ ] Known profile fields are not re-asked (returning user or second consultation).
- [ ] Answer streams section by section with auto-scroll; Stop works.
- [ ] Counter decreases only when an answer completes.
- [ ] Composer never usable while generating; never usable during emergency until acknowledged.
- [ ] Message list keeps position when keyboard opens/closes.

---

## Pattern spec · AnswerSections  {#answer-sections}

Used by M-2.1 and M-9.2.

| Element | Spec |
|---|---|
| Container | Deborah-styled card group, full width of message column (no bubble tail) |
| Sections | Exactly 7, fixed order: 1 What I'm Hearing · 2 The Hypothalamic Connection · 3 What This May Mean · 4 Questions for Your Provider · 5 Tests Worth Discussing · 6 What You Can Do Now · 7 A Word from Deborah |
| Section header | Number + title + chevron; tap toggles; `aria-expanded` |
| Default expansion | §1 open, others collapsed after streaming; currently streaming section open (07 §2) |
| "Expand all" | Small text button at top-right of the group |
| §4 bullets | Each question has a "+ add to visit questions" icon → appends to the profile's "Questions for my next visit" note (toast) |
| §5 bullets | Lab names emphasised; "Why?" text in plain language |
| §6 | Five-pillar guidance + **ProductCard** at the end of the section |
| ProductCard | Image, name, "Formulated by Deborah" disclosure, why it fits (1–2 lines), 90-day framing line, **Shop on Genesis Gold →** (opens M-2.7). Suppressed for teen profiles and crisis conversations |
| §7 | Warm closing, Deborah signature line |
| Closing line | Always after §7, subtle panel: "Bring this to your provider. I help you ask better questions — your provider makes clinical decisions." |
| Lab variant | When `labsReferenced`, a small "Based on your labs from {date}" tag under the group header |

## Pattern spec · AnswerActions
Row under the answer: **Save PDF** (→ M-9.6) · **Visit Notes** (save whole answer as `saved-answer` note, toast) · **Share** (native-style share sheet mock: Copy summary / Messages / Mail — all simulated, toast "Copied").

---

## M-2.7 · Shop (in-app browser)

| Meta | |
|---|---|
| Presentation | Full-screen modal, slide up |
| Entry | ProductCard "Shop", M-7.3 Reorder, M-7.4 related product |
| Exit | **Done**/× → back to origin at same scroll position |

**Layout:** 1. Browser header: "Done", URL label `genesisgold.com`, lock icon, share. 2. Mock product page (built as a simple static page from `products.json`: hero image, name, price placeholder, description, "Add to cart"). 3. Toolbar: back/forward (disabled), refresh.

**Interactions:** Add to cart → toast "Added to cart (demo)"; Checkout → message "Checkout happens on genesisgold.com" (no payment UI). The real URL is shown but never loaded.

**Acceptance:** [ ] Returning lands on the same answer position. [ ] URL shows `?ref=app`.

---

## M-2.8 · Follow-up opt-in

| Meta | |
|---|---|
| Presentation | Sheet, medium detent, dismissible |
| Entry | Auto 1.5 s after the **first** completed answer when `notificationPermission === 'unknown'` |
| Exit | Yes → SystemAlert permission → dismiss · Not now → dismiss |

**Layout:** title "Want me to check in with you?"; body "I'll remind you to tell me how you're doing, so we can build on today."; interval option rows **In 1 week · In 2 weeks (default) · In 1 month**; primary **Yes, remind me**; link **Not now**.

**Interactions**
| Trigger | Result |
|---|---|
| Yes, remind me | iOS-style SystemAlert "'Your Oracle Clinician' Would Like to Send You Notifications" [Don't Allow] [Allow]. Allow → permission granted, schedule follow-up notification at chosen interval (simulated clock), toast "I'll check in {in 2 weeks}". Don't Allow → permission denied, toast "You can turn reminders on in Account". |
| Not now | Dismiss; don't ask again for 3 consultations |

**Acceptance:** [ ] Custom prompt always precedes the system alert. [ ] Never shown twice in a row. 
**Open:** default interval tied to 90-day framing?
