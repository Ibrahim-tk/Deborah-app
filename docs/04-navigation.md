# 04 · Navigation

## 1. Two levels

| Level | Mechanism | Purpose |
|---|---|---|
| Shell | React Router: `/` → redirect `/mobile`; `/mobile`; `/web/*` | Platform switching, deep links into web |
| Mobile app | **Custom navigator** in `apps/mobile/navigation` backed by `nav.store.ts` | Native iOS semantics inside the emulator |
| Web app | React Router nested routes under `/web` (later) | Normal URL navigation |

## 2. Mobile navigation model

```
Root
├── Pre-auth stack (no tab bar): Splash → Welcome → Consent
└── Main (tab bar visible on tab roots)
    ├── Tab "ask"      stack: Conversation(M-2.1) → …
    ├── Tab "health"   stack: MyHealthHub(M-7.2) → NinetyDayPlan → ContentDetail → Library → AboutDeborah
    │                         → Records(M-9.1) → ConsultationDetail → NoteEditor → LabReport …
    └── Tab "account"  stack: Account(M-10.1) → PrivacyData → Subscription → Notifications → Legal
Layers above Main (in z-order):
    sheets   (bottom sheets with detents: medium | large)
    modals   (full-screen, slide up, own internal stack — e.g. Plans → CreateAccount → StorePayment → Success)
    overlays (SystemAlert, NotificationBanner, LockScreen, Toast) — owned by shell/device
```

- **Per-tab stacks:** switching tabs preserves each tab's stack (iOS behaviour). Tapping the active tab pops it to root; tapping again scrolls to top.
- **Tab bar** shows on tab-root screens and on pushed screens whose registry meta says `tabBar: true` (default false for pushed screens, true for roots). Never visible under modals.
- **Three tabs:** `Ask Deborah` (chat icon), `My Health` (heart icon), `Account` (person icon). Labels always visible (audience).
- **Profile scope:** the active profile (`session.activeProfileId`) scopes Ask, My Health and records. Switching profile resets the `ask` stack to that profile's Conversation and the `health` stack to root.

## 3. Registry

`apps/mobile/navigation/registry.ts` maps every screen ID to its component and presentation meta:

```ts
export const registry = {
  'M-1.1': { title: 'Splash',        component: lazy(() => import('@mobile/screens/onboarding/Splash')), presentation: 'root',  stack: 'preauth', statusBar: 'light' },
  'M-2.1': { title: 'Conversation',  component: lazy(() => import('@mobile/screens/consultation/Conversation')), presentation: 'tabRoot', tab: 'ask' },
  'M-2.7': { title: 'Shop',          component: …, presentation: 'modal' },
  'M-2.8': { title: 'Follow-up opt-in', component: …, presentation: 'sheet', detent: 'medium' },
  'M-4.2': { title: 'Choose plan',   component: …, presentation: 'modal', modalStack: 'plans' },
  // …every ID in docs/xref.md
} satisfies Record<ScreenId, ScreenMeta>;
```

`ScreenMeta`: `title, component, presentation ('root'|'tabRoot'|'push'|'sheet'|'modal'), tab?, stack?, detent?, tabBar?, statusBar?, figma, spec`.

The registry is also what the shell caption reads and what `docs/xref.md` mirrors.

## 4. API (`useNav()`)

| Call | Effect |
|---|---|
| `push(id, params?)` | Push onto the current tab stack (or current modal stack if a modal is open) |
| `pop()` / `popToRoot()` | Back (also triggered by the header back button and a left-edge swipe gesture ≥ 60 px) |
| `replace(id, params?)` | Replace top of stack (e.g. Splash → Welcome) |
| `switchTab(tab)` | Change tab; preserves stacks |
| `presentSheet(id, params?, {detent})` / `dismissSheet()` | Bottom sheet; tap scrim or drag down > 30 % to dismiss unless `dismissible:false` |
| `presentModal(id, params?)` / `dismissModal()` | Full-screen modal with its own stack |
| `resetTo(stack, id)` | Used by onboarding completion and scenarios |
| `openDeepLink(link)` | `{ tab, path: [ids], profileId? }` — used by notifications |

Params are serialisable (persisted). Screens read them via `useScreenParams<T>()`.

## 5. Transitions (via `ui/Motion` adapter)

| Presentation | Enter | Exit | Duration |
|---|---|---|---|
| push | slide from right 100 % + previous screen shifts left 30 % and dims | reverse | 320 ms, iOS ease `cubic-bezier(0.32,0.72,0,1)` |
| sheet | slide up from bottom + scrim fade to 40 % | slide down | spring (stiffness 400, damping 40) |
| modal | slide up full height; underlying screen scales to 0.94 with rounded corners (iOS 13+ card style) | reverse | 380 ms |
| tab switch | instant (no animation), iOS default | — | — |
| fade (splash → welcome) | crossfade | — | 400 ms |

All transitions collapse to fades ≤ 120 ms when reduced motion is on.

## 6. Deep links (notifications and scenarios)

| Link | Result |
|---|---|
| `followup:<profileId>` | Switch to that profile, tab `ask`, Conversation with `mode: 'checkin'` (check-in state, Figma 5.2) |
| `booking:<bookingId>` | Tab `health` → push BookingConfirmed (M-8.4) in read mode |
| `content:<itemId>` | Tab `health` → push ContentDetail (M-7.4) |

## 7. Back behaviour & guards

- Back from a tab root does nothing (no app exit in prototype).
- Leaving the Conversation while an answer is streaming keeps it streaming in the background (store-driven); returning shows progress.
- Onboarding cannot be skipped: until `session.consentAcceptedAt` exists, Main is unreachable (scenario loading sets it as needed).
- Modals with unsaved input (NoteEditor, AddMember) confirm discard via SystemAlert.

## 8. Web (later)

Routes will mirror mobile domains: `/web/ask`, `/web/health`, `/web/health/records/:id`, `/web/account/...`. Screen IDs `W-x.y` match their mobile counterparts where the concept is the same.
