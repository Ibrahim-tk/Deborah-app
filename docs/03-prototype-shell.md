# 03 · Prototype shell

The shell is the "presentation stage" around the product. It is **not** part of the product, so it may look neutral (system font, greys) and must never borrow product components.

## 1. Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ◆ Oracle Clinician · prototype   [ Mobile | Web ]   [State: New user ▾]  │  ← TopNav, fixed, 56px
│                                                    [⟲ Reset] [⚙ Toggles] │
├──────────────────────────────────────────────────────────────────────────┤
│                         stage (fills remaining height)                   │
│              Mobile: centred IPhoneFrame, scaled to fit                  │
│              Web:    BrowserFrame (or full-bleed) with WebApp            │
│   bottom-left caption: current screen ID + title (e.g. "M-2.1 Conversation")│
└──────────────────────────────────────────────────────────────────────────┘
```

- TopNav is `position: fixed; top: 0`, full width, z-index above everything, height 56 px.
- Stage background: neutral (e.g. `#1d1d1f` dark or `#f2f2f4` light — follows a shell theme toggle), so the phone reads as an object on a desk.
- **Screen caption** (bottom-left, small, 60 % opacity): live ID + title of the top-most visible screen or sheet, pulled from the registry. Click copies the ID. This is how you point Claude Code at "that component on the phone".

## 2. TopNav elements

| Element | Behaviour |
|---|---|
| **Brand label** | "Oracle Clinician · prototype v0.x". Version from `package.json`. |
| **PlatformTabs** `Mobile | Web` | Navigates to `/mobile` or `/web`. Remembers last web route. Active tab underlined. Keyboard: `1` / `2`. |
| **StateMenu** (dropdown) | Content depends on platform. For Mobile, three groups (below). Web shows "No web scenarios yet". Current scenario label shown on the trigger. |
| **Reset** | Clears persisted store, reloads the current scenario, resets navigator to scenario start. Confirm with a small popover ("Reset prototype?"). |
| **Toggles** (popover) | See §4. |

### StateMenu — Mobile groups

1. **Scenarios** (load a whole app state). Catalogue in `05-state-and-scenarios.md §3`. Selecting one: replaces store with the seed, resets navigator to the scenario's `start`, closes menu, shows a toast "Loaded: Trial — last free consultation". Grouped by journey stage with short descriptions under each label.
2. **Simulate events** (act on the *current* state without resetting it):
   - *Deliver follow-up notification* → shows banner (unlocked) or lock-screen card (if locked).
   - *Lock phone* / *Unlock phone* → shows/hides `LockScreen`.
   - *Fast-forward 2 weeks* → advances simulated clock; plan day counter and check-in due update.
   - *Booking reminder* → banner for an upcoming booking (only if a booking exists).
   - *Fail next AI response* → next generation shows the error state.
3. **Device**:
   - *Scale:* Fit (default) / 100 % / 75 %.
   - *Simulated keyboard:* on/off (visual only; real typing always works).
   - *Appearance inside phone:* Light / Dark (only if design system defines dark).
   - *Show screen caption:* on/off.

The StateMenu deliberately has **no list of screens**. Screens are reached by using the app.

URL support: `/mobile?scenario=S04` loads that scenario on open — useful for sharing a link to a state.

## 3. iPhone emulator (`shell/device`)

| Part | Spec |
|---|---|
| Logical viewport | **393 × 852 CSS px** (iPhone 15 / 16 points) — the app lays out at exactly this size |
| Frame | Rounded device body (corner radius ~55 px at 1×), 12–14 px bezel, side buttons (decorative), subtle shadow. Built in CSS/SVG, no images required |
| Scaling | `transform: scale(s)` on the device, `s = min(1, (stageH - 48) / deviceH, (stageW - 48) / deviceW)` unless Device › Scale overrides. Recalculate on resize |
| Safe areas | Top inset 59 px (status bar + Dynamic Island), bottom inset 34 px (home indicator). Exposed as CSS variables `--safe-top`, `--safe-bottom` inside the phone and via `useDevice()` |
| StatusBar | Live clock (HH:MM, 12-h), signal, Wi-Fi, battery glyphs. Text colour follows the current screen (`statusBarStyle: 'dark' | 'light'` in registry meta) |
| DynamicIsland | Black pill 126 × 37 px, centred. Static; no activity animation (DESIGN.md bans pulses and waves) |
| HomeIndicator | 134 × 5 px bar, 8 px from bottom |
| Clipping | Everything inside the screen area is clipped to the rounded corners (`overflow: hidden; border-radius`) |
| Scroll | Inner scroll containers only; the page itself never scrolls. Hide desktop scrollbars inside the phone; support trackpad and drag scrolling |
| Pointer | Desktop cursor stays a cursor (no fake touch circle) — optional toggle "touch cursor" for demos |
| SimKeyboard | When enabled and an input inside the phone is focused, slides up a static iOS keyboard image/CSS block (291 px tall) and the app's content area shrinks accordingly (`--keyboard-height`). Physical typing still drives the input |
| LockScreen | Full-screen overlay with large clock/date and wallpaper gradient; renders queued notifications as cards. Tap a card → unlock + deep-link (see `04-navigation.md §6`) |
| NotificationBanner | Slides from top inside the device, auto-dismiss 5 s, tap to open target |
| SystemAlert | iOS-style centred alert (title, message, 1–2 buttons) used for notification permission, "Delete account?", sign-out confirm. Apps request it via `useDevice().alert({...})` returning a promise |

`useDevice()` (exported from `@shell/device`) is the **only** shell API the mobile app may use: `{ safeArea, keyboardHeight, alert(), notify(), haptic(type) }`. `haptic` is visual-only (tiny device shake / no-op) to keep the vanity feel.

## 4. Dev toggles

| Toggle | Effect |
|---|---|
| Highlight placeholder content | Outlines any text whose source JSON has `status: "placeholder"` with a dashed amber border + tooltip "Placeholder — needs Deborah's approval" |
| Network speed | Normal / Slow (×3 delays) / Instant (no delays, for quick walkthroughs) |
| Reduced motion | Forces `prefers-reduced-motion` behaviour |
| Show tap targets | Outlines interactive elements < 44 px in red (accessibility check) |
| Show IDs on hover | Hovering a screen or pattern shows its ID/component name in a tooltip |

Toggles live in `shell.store.ts` and are persisted separately from the app store (Reset does not clear them).

## 5. Web stage

- `/web/*` renders `WebApp` inside `BrowserFrame` (traffic-light buttons, URL bar showing `app.oracleclinician.com/<route>`, max width 1440, scales to fit) or full-bleed (toggle).
- Until the web spec exists, `WebApp` shows a single placeholder page: "Web app — not started. See docs/web/README.md".
