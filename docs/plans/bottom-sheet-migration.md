# Bottom sheet migration — plan

Status: **steps 1–3 done** (2026-10-20): `ui/BottomSheet` built; all 15 routed and all 13 inline sheets use it (incl. 4 found during migration: Crisis support, Escalation, Inline consent legal text, Book Deborah). Left: step 4 clean-up, and M-4.4 Payment's dim (routed sheets can't pick the `system` variant yet). Goal: one bottom-sheet component everywhere, same interaction
everywhere, flexible height (fits content, or fixed presets).

## 1. Today: 24 sheets, 6 different behaviours

| Behaviour | Scrim | Motion | Escape | Scrim tap | Drag down | Grabber |
|---|---|---|---|---|---|---|
| Routed sheets (navigator) | token | spring 400/40 | no | yes (if dismissible) | **yes (>30%)** | yes |
| ActionSheet, SymptomPicker, NamedReasonList, DeleteConfirm | token | tween 0.36 s | mostly | yes | no | mixed |
| Account phone sheet | hard-coded black 35% | **none** | no | yes | no | yes |
| ProviderSheet (Apple/Google sign-in) | hard-coded black 32% | CSS 320 ms | no | no | no | no |
| GreetingSheet (Home) | token | CSS fade | no | yes | no | no, 32 px corners |
| ConsentSheet (Health basics) | token | CSS rise | no | goes back | no | own handle |

Corners, max height, bottom safe-area padding and z-index also differ per sheet.

## 2. Target: `ui/BottomSheet`

One component owns **everything** a sheet does: scrim, slide-in, drag-to-dismiss, Escape, scrim tap, focus,
safe area, grabber, title, scrolling body, pinned footer. The existing `ui/Sheet` (the surface) becomes its
inner part, so call sites keep `title` / `footer` / children.

```tsx
<BottomSheet
  open={open}                       // inline use; routed sheets are always open
  onClose={close}
  height="auto"                     // 'auto' (fits content) | 'medium' (~55%) | 'large' (full) | number (px) | '70%'
  dismissible                       // false = no drag / scrim tap / Escape (FreeLimit, AskParent…)
  title="Phone number"
  footer={<Button fullWidth>Save</Button>}
  variant="default"                 // 'default' | 'actions' (iOS action list) | 'system' (Apple Pay / Sign in look)
>
  …
</BottomSheet>
```

Interaction (identical for every sheet): token scrim, spring slide (the routed one), drag down > 30% or fast
flick closes, scrim tap and Escape close (when dismissible), focus moves into the sheet and returns on close,
reduced-motion = fade, keyboard-safe (footer rises with the keyboard), max height = screen − status bar − 12 px,
body scrolls inside, footer stays pinned.

- **Routed sheets:** `Navigator/Layers` renders `BottomSheet` as the frame; registry `detent` maps to `height`.
  Screens keep rendering `<Sheet>` (now just content + title/footer).
- **Inline sheets:** replace each hand-made Overlay + scrim + MotionDiv with `<BottomSheet open onClose>`.
- **Variants:** `actions` keeps the iOS grouped-button look (ActionSheet); `system` keeps the iOS system
  look (grey, no grabber) for the simulated Apple Pay / Apple-Google sign-in — same interaction underneath.

## 3. Migration list (every sheet)

### A. Routed sheets — move the frame once (Layers), screens unchanged

| ID | Screen | Height | Dismissible |
|---|---|---|---|
| M-1.4 | Create account / Sign in | auto | yes |
| M-1.5 | Terms / Privacy | auto | yes |
| M-1.9 | Deborah's welcome | auto | no |
| M-1.10 | Ask an adult | auto | no |
| M-2.8 | Follow-up reminder | auto | yes |
| M-2.9 | Scan a label | large | yes |
| M-2.11 | Profile question | auto | yes |
| M-2.13 | What Deborah noted | large | yes |
| M-4.1 | Free limit reached | auto | no |
| M-4.4 | Payment (Store payment) | auto, `system` | yes — **currently no `<Sheet>`** |
| M-5.3 | Add lab results | auto | yes |
| M-6.1 | Profile switcher | auto | yes |
| M-6.3 | Upgrade to Family | auto | yes |
| M-9.8 | Log your visit | large | no |
| M-11.3 | Upload a document | large | yes (locked while uploading) |

### B. Inline sheets — migrate one by one

| # | Component | File | Appears on | Height | Notes |
|---|---|---|---|---|---|
| 1 | Account phone sheet | screens/account/Account/Account.tsx | M-10.1 Settings | auto | today: no animation, hard-coded scrim |
| 2 | DeleteConfirmSheet | screens/account/PrivacyData/parts/DeleteConfirmSheet.tsx | M-10.2 Privacy & data | auto | autofocus input |
| 3 | NamedReasonList sheet | patterns/widgets/NamedReasonList | M-1.8 Health basics, M-2.1 / M-2.12 chat (meds) | auto | Name + Reason, footer button |
| 4 | SymptomPicker | patterns/chat/SymptomPicker | M-2.1 Conversation, M-2.12 First consultation | large (or 86%) | search field, own grabber today |
| 5 | GreetingSheet | screens/consultation/Home/parts/GreetingSheet.tsx | M-2.0 Home | auto | not portalled today, 32 px corners |
| 6 | ConsentSheet | screens/onboarding/HealthBasics/parts/ConsentSheet.tsx | M-1.8 Health basics | auto | scrim tap = go back (keep via `onClose`) |
| 7 | ProviderSheet | screens/plans/CreateAccount/parts/ProviderSheet.tsx | M-4.3 Create account | auto, `system` | simulated Apple / Google sign-in |
| 8 | ActionSheet (ui) | ui/ActionSheet | M-2.1, M-7.3, M-9.1, M-9.4, M-9.5, M-9.8, M-11.1, M-11.2 | auto, `actions` | one component → all 8 screens at once |
| 9 | TextSizeSheet | patterns/settings/TextSizeSheet | M-10.1 Settings | auto, `actions` | wraps ActionSheet — follows #8 |

Lab pages (Design System, Widget lab) only re-render these components; they follow automatically.

## 4. Order of work

1. **Build `ui/BottomSheet`** (frame + interaction; `ui/Sheet` becomes the surface inside). Add it to the
   Design System page with each height and variant.
2. **Routed sheets (A):** switch `Navigator/Layers` to `BottomSheet` → all 15 at once. Then M-4.4 onto `system`.
3. **Inline sheets (B), one at a time** in the order above (simplest first, ActionSheet last because it touches
   8 screens). Each: replace the hand-made overlay, delete its scrim / panel / motion CSS, check its screen.
4. **Clean up:** remove dead sheet CSS and ad-hoc scrim colours; note the rule in docs/08-component-system.md
   ("every bottom sheet is `ui/BottomSheet`").

## 5. Decisions (designer, 2026-10-20)

- Payment (M-4.4) and Apple/Google sign-in keep the **iOS system look** (`system` variant), shared interaction.
- Action menus keep the **iOS grouped-button style** (`actions` variant), shared interaction.
- Default height **fits content**, up to near full screen; `medium` / `large` / custom stay available.
