# 08 · Component system

## 1. Three layers per app

| Layer | Folder | Knows about | Examples | Rules |
|---|---|---|---|---|
| **ui** (primitives) | `apps/<app>/ui` | Nothing domain-specific. Props + tokens only | Button, OptionRow, Input, Sheet, Card, ListRow, Icon, Avatar, Segmented, ProgressStatus | No store access, no JSON imports. Fully controlled via props. Every visual variant is a prop (`variant`, `size`, `tone`). |
| **patterns** | `apps/<app>/patterns/<domain>` | Domain types (from `@shared/types`), may read store via selectors passed in or small hooks | MessageBubble, AnswerSections, ProductCard, EmergencyInterrupt, PlanCard, FocusCard | Reusable across ≥ 2 screens or complex enough to isolate. No navigation calls inside — expose callbacks (`onShop`, `onBook`). |
| **screens** | `apps/<app>/screens/<domain>/<Screen>` | Store, engine hooks, navigation | Conversation, MyHealthHub, ChoosePlan | Compose patterns; own layout and navigation; one folder per screen ID. |

Dependency direction: **screens → patterns → ui**. Never upward, never sideways between screens (share via a pattern instead).

## 2. Mobile UI inventory (build in this order)

| Primitive | Variants / props | Used by |
|---|---|---|
| `Icon` | `name` (semantic: 'chat','health','account','mic','send','back','close','info','check','chevron','plus','lock','shop','calendar','upload','camera','file','phone','alert') `size` `strokeWidth` | everywhere |
| `Button` | `variant: primary | secondary | ghost | destructive | link`, `size: lg(50) | md(44) | sm(36)`, `fullWidth`, `loading`, `leadingIcon` | everywhere |
| `IconButton` | `label` (required, a11y), `size` | headers, composer |
| `Header` | `title`, `left` (back/close/avatar), `right`, `large` (iOS large title), `transparent` | all screens |
| `OptionRow` / `OptionList` | `selected`, `multi`, `layout: list | grid2`, `leadingIcon` | suggestions, intake, quick replies, filters (replaces chips — no pills) |
| `Input` / `TextArea` | `label`, `placeholder`, `error`, `counter`, `autoGrow` | onboarding, composer, forms |
| `Checkbox` / `Toggle` | `label`, `description` | consent, settings |
| `Segmented` | `options`, `value` | billing toggle, records |
| `Select` | native-style picker sheet | relationship, state |
| `Card` | `tone: default | subtle | emphasis | danger`, `pressable` | hub, answers |
| `ListRow` | `title`, `subtitle`, `leading`, `trailing (chevron/value/toggle)`, `destructive` | account, records |
| `Avatar` | `initial`, `image`, `size`, `ring (active)` | header, switcher |
| `Panel` | `tone: linen | lilac | danger | success | warning` | quiet informational panels (no badges or tags exist in this system) |
| `Sheet` | `detent: medium | large`, `dismissible`, `title` | all sheets |
| `Modal` | full-screen container with header | plans, add member |
| `Alert` | (uses `useDevice().alert`) | confirms |
| `Toast` | `tone`, `message` | saves, copies |
| `Skeleton` (static, no shimmer), `Spinner` (rotating ring), `ProgressStatus` (icon + changing status text), `ProgressBar` | — | loading states |
| `Motion` | adapter exporting `MotionDiv`, `AnimatePresence`, transition presets | navigator, sheets, chat |

## 3. Pattern inventory (mobile)

| Domain | Pattern | Purpose |
|---|---|---|
| chat | `ConversationHeader` | Avatar/profile switcher, title, info button |
| chat | `Greeting` | Time-of-day / welcome-back block for empty state |
| chat | `TrialCounter` | "n free consultations left" as plain `subhead` text |
| chat | `Composer` | Input, mic, send/stop, character counter, disabled states |
| chat | `SuggestionList` | 3 starter prompts on focus |
| chat | `MessageBubble` | user / deborah / system; streaming caret |
| chat | `IntakeQuestion` | question + option rows (single/multi) + step "n of N · Skip" |
| chat | `SuggestedQuestions` | tappable follow-up questions |
| chat | `AnswerCTA` | "Tell me what you think" |
| chat | `ThinkingIndicator` | `ProgressStatus` with Deborah-voice steps (no typing dots) |
| chat | `AnswerSections` | 7 collapsible sections, product slot in §6, closing line |
| chat | `AnswerActions` | Save PDF · Visit Notes · Share |
| chat | `ErrorBubble` | retry |
| chat | `ScrollToLatest` | round icon button when user scrolled up |
| safety | `EmergencyInterrupt`, `MedicationSafetyCard`, `CrisisSupportCard`, `OutOfScopeReply`, `EscalationCard` | F03 |
| commerce | `ProductCard`, `PlanCard`, `InAppBrowser` | F02, F04 |
| profile | `ProfileAvatar`, `ProfileSwitcherList`, `ProfileBanner` | F06 |
| health | `FocusCard`, `PlanProgressCard`, `CheckInCard`, `QuickLinks`, `ContentCard`, `HabitRow`, `LabValueRow`, `ConsultationRow`, `NoteRow`, `EmptyState` | F07, F09 |
| legal | `ConsentSummary`, `DisclaimerLink` | F01, chat |

## 4. Third-party adapters (absorbing libraries)

Rule: **no file outside `ui/<Adapter>/` imports a third-party UI library.**

```tsx
// apps/mobile/ui/Icon/Icon.tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { BubbleChatIcon, FavouriteIcon, UserIcon, Mic01Icon, SentIcon /* … */ } from '@hugeicons/core-free-icons'; // verify exact export names at install
const map = { chat: BubbleChatIcon, health: FavouriteIcon, account: UserIcon, mic: Mic01Icon, send: SentIcon /* … */ } as const;
export type IconName = keyof typeof map;
export function Icon({ name, size = 24, strokeWidth = 1.5, ...rest }: IconProps) {
  return <HugeiconsIcon icon={map[name]} size={size} strokeWidth={strokeWidth} color="currentColor" aria-hidden {...rest} />;
}
```

To switch libraries: change the map only. Same pattern for `Motion`, future `DatePicker`, `Carousel`, `Toaster`, etc. If you like a library's *button*, wrap it inside `ui/Button` rather than using it directly in screens.

## 5. Mobile ↔ web cross-referencing (isolated but traceable)

The apps share **no components**, but every concept is findable in both:

1. **Same screen IDs.** `M-9.2` ↔ `W-9.2`. The number is the concept; the prefix is the platform.
2. **Mirrored folders.** `apps/mobile/screens/consultation/…` ↔ `apps/web/screens/consultation/…`; `apps/mobile/patterns/chat/AnswerSections` ↔ `apps/web/patterns/chat/AnswerSections`.
3. **Same component names for the same concept**, different implementations (the path disambiguates).
4. **`@xref` header** in every screen and pattern file (template in `10-conventions.md`).
5. **`docs/xref.md`** registry table: ID · concept · mobile file · web file · Figma · spec.

How to use it with Claude Code:
> "Build the web `AnswerSections` pattern. Reference the mobile one (`apps/mobile/patterns/chat/AnswerSections`, used by M-2.1 and M-9.2) for behaviour and content order, but design it for a 1280 px two-column layout. Do not import from mobile."

## 6. Component quality bar

- Typed props with sensible defaults; no `any`.
- Visual states built in: hover (web), pressed (`:active` scale 0.98 on mobile), focus-visible, disabled, loading.
- Accessible names on icon-only controls; semantic elements; `aria-live="polite"` on streaming message containers.
- Every pattern renders sensibly with empty/long content (test with 1 word and 200 words).
- Each component exports from `index.ts`; app `ui/index.ts` re-exports all primitives.
