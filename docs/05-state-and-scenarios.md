# 05 · App state and scenarios

## 1. Store (`src/shared/store`)

One Zustand store composed of slices, persisted to localStorage key `yoc-proto-v1` (versioned; bump on breaking shape changes). Navigation state lives in a **separate** mobile store (`nav.store.ts`) that is also persisted, and the shell has its own store.

| Slice | Holds | Key actions |
|---|---|---|
| `session` | `userName`, `accountId?`, `consentAcceptedAt?`, `consentVersion`, `activeProfileId`, `isLocked`, `simulatedNow` (ISO), `notificationPermission` ('unknown'|'granted'|'denied') | `setName`, `acceptConsent`, `switchProfile`, `advanceClock(days)`, `setPermission` |
| `subscription` | `plan` ('trial'|'individual'|'family'|'premium'), `billing` ('monthly'|'annual'), `freeConsultationsUsed` (0–3), `renewsAt?` | `completeConsultation`, `purchase(plan, billing)`, `cancel` |
| `profiles` | `byId`, `order` — each with `name`, `relationship`, `dob`, `sexAtBirth`, `intake` (age band, conditions, medications, cycle notes…), `createdAt` | `addProfile`, `updateProfile`, `updateIntake`, `deleteProfile` |
| `conversations` | `byId` (per profile), each with `messages[]`, `status`, `topic`, `startedAt`, `countedAt?`, `summary?` | `startConversation`, `appendMessage`, `patchMessage`, `setStatus`, `setSummary` |
| `labs` | `reportsById` — profile, source ('photo'|'pdf'|'manual'), date, `values[]`, `confirmed` | `addReport`, `updateValue`, `confirmReport` |
| `plan90` | per profile: `startDate`, `goal`, `habits[]` (id, text, doneDates[]), `productId?`, `productStartDate?` | `createFromAnswer`, `toggleHabit`, `reorder` |
| `notes` | per profile: `byId` — title, body, `kind` ('questions'|'saved-answer'|'after-visit'|'free'), `sourceMessageId?` | `addNote`, `updateNote`, `deleteNote` |
| `notifications` | `queue[]` — id, title, body (generic), `deepLink`, `deliverAt`, `delivered`, `read`; `followUp` settings per profile (`enabled`, `intervalDays`) | `schedule`, `deliverDue`, `markRead`, `setFollowUp` |
| `booking` | `bookings[]` — id, slot, price, state, `shareHistory`, `status` | `book`, `cancel` |
| `settings` | `theme`, `textSize` (optional), `dataExportRequestedAt?` | `set…`, `requestExport`, `deleteAccount` |

Rules: actions are the only way to mutate; selectors in `selectors.ts` (e.g. `selectActiveProfile`, `selectFreeLeft`, `selectHubState`, `selectCanAddProfile`). The engine never touches the store directly; the app's `useConversation` hook bridges them.

## 2. Simulated time

`session.simulatedNow` drives every "date" the user sees (greetings, plan day counters, check-in due, booking). It starts at the scenario's `now` and advances in real time while the app runs; **Simulate events › Fast-forward 2 weeks** jumps it. Use `utils/dates.now()` everywhere — never `new Date()` directly in UI.

## 3. Scenario catalogue

Each scenario is a complete, internally consistent world. File: `src/shared/scenarios/Sxx-name.json`. Catalogue entry in `scenarios/index.ts`.

| ID | Label (State menu) | Group | World | Starts at |
|---|---|---|---|---|
| S01 | New user — first launch | Onboarding | Empty store | M-1.1 Splash |
| S02 | Onboarded — empty chat | Trial | Name "Maria", consent accepted, trial 0/3, no conversations | M-2.1 (empty) |
| S03 | Mid-intake | Trial | First message sent about hot flashes & sleep, Deborah asked Q1 (age) | M-2.1 (intake) |
| S04 | First answer delivered | Trial | 1 counted consultation, full 7-section answer visible, follow-up not yet set | M-2.1 (answered) — scrolled to answer |
| S05 | Last free consultation | Trial | 2/3 used, history of 2 | M-2.1 (empty) with counter "1 left" |
| S06 | Trial exhausted | Conversion | 3/3 used; FreeLimit sheet will show on next send (and immediately on load) | M-2.1 + M-4.1 sheet |
| S07 | Subscriber — follow-up due | Return | Individual plan, 1 conversation 2 weeks ago, follow-up notification queued, phone locked | LockScreen with notification (M-5.1) |
| S08 | Labs reviewed | Return | Individual plan, labs confirmed, lab-informed answer delivered, 90-day plan day 18 | My Health hub (M-7.2) |
| S09 | Family plan — daughter added | Family | Family plan, profiles Maria + Daughter (teen), daughter conversation started | M-2.1 as Daughter |
| S10 | Individual plan — wants family | Family | Individual plan, 1 profile | M-6.1 sheet open |
| S11 | My Health — empty | Subscriber | Signed in on new device: plan active, no history | M-7.1 |
| S12 | Escalation ready | Booking | Several unresolved consultations; next send triggers escalation card | M-2.1 |
| S13 | Safety test bench | QA | Onboarded, trial 1/3; composer shows dev-only quick inserts for emergency / medication / crisis / out-of-scope phrases | M-2.1 |

Add new scenarios freely; keep labels in the user's language ("Trial exhausted"), not technical terms.

## 4. Scenario file format

```jsonc
{
  "id": "S07",
  "label": "Subscriber — follow-up due",
  "group": "Return",
  "description": "Maria subscribed two weeks ago. Her follow-up reminder is waiting on the lock screen.",
  "now": "2026-10-21T09:41:00-07:00",
  "start": { "kind": "lockScreen" },          // or { "kind": "screen", "tab": "ask", "stack": ["M-2.1"], "sheet": "M-4.1" }
  "state": {
    "session":       { "userName": "Maria", "consentAcceptedAt": "2026-10-05T19:12:00-07:00", "activeProfileId": "p-maria", "isLocked": true, "notificationPermission": "granted" },
    "subscription":  { "plan": "individual", "billing": "monthly", "freeConsultationsUsed": 3 },
    "profiles":      { "order": ["p-maria"], "byId": { "p-maria": { "name": "Maria", "relationship": "self", "intake": { "ageBand": "46-50", "conditions": [], "medications": [] } } } },
    "conversations": { "byId": { "c-001": { "profileId": "p-maria", "scriptId": "hot-flashes-sleep", "status": "answered", "messages": "@script:hot-flashes-sleep#complete" } } },
    "notifications": { "queue": [ { "id": "n-1", "title": "Your Oracle Clinician", "body": "Deborah: How are you feeling this week?", "deepLink": "followup:p-maria", "delivered": true } ] }
  }
}
```

- `"@script:<id>#<checkpoint>"` expands a conversation script to a given checkpoint (`intake-1`, `intake-done`, `answered`, `complete`) so scenarios don't duplicate long message arrays.
- `loadScenario(id)`: reset store → deep-merge `state` onto defaults → expand script refs → set nav state from `start` → set `simulatedNow`.
- Scenarios are validated at load (TypeScript types + a tiny runtime check); invalid scenarios show an error toast instead of breaking the app.

## 5. Simulated events (State menu › Simulate events)

| Event | Store effect | Visual |
|---|---|---|
| Deliver follow-up notification | Push generic notification for active profile (`followup:<id>`) | Banner if unlocked, card on LockScreen if locked |
| Lock / Unlock phone | `session.isLocked` toggle | LockScreen overlay |
| Fast-forward 2 weeks | `advanceClock(14)`; deliver due notifications | Hub counters update |
| Fail next AI response | Sets one-shot flag read by engine bridge | Next generation → error state |
| Booking reminder | Push `booking:<id>` notification | Banner |
