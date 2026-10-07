# 02 · Folder structure

## 1. Full tree (annotated)

```
oracle-clinician/
├── CLAUDE.md                      # rules for Claude Code (read first)
├── README.md                      # how to run: npm i && npm run dev
├── docs/                          # these specs
├── public/
│   ├── fonts/                     # self-hosted brand fonts (after design system)
│   ├── images/
│   │   ├── deborah/               # portrait placeholders (OPEN: real photography)
│   │   ├── content/               # thumbnails for library items
│   │   └── products/              # product images (placeholders)
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.ts                 # aliases, CSS Modules naming
├── tsconfig.json                  # paths mirror Vite aliases
├── eslint.config.js               # boundaries between shell / shared / apps
└── src/
    ├── main.tsx                   # React root, imports src/styles/index.css
    ├── App.tsx                    # <Shell> + routes: / → /mobile, /mobile, /web/*
    │
    ├── styles/                    # GLOBAL, shared by both apps (CSS only)
    │   ├── index.css              # imports the files below in order
    │   ├── reset.css
    │   ├── fonts.css              # @font-face
    │   ├── tokens.primitives.css  # brand primitives: --color-purple-700, --space-4 …
    │   └── motion.css             # shared easing/duration variables
    │
    ├── shell/                     # PROTOTYPE CHROME — not product UI
    │   ├── Shell/                 # layout: fixed TopNav + stage
    │   ├── nav/
    │   │   ├── TopNav/
    │   │   ├── PlatformTabs/      # Mobile | Web
    │   │   ├── StateMenu/         # scenarios ▾ (+ simulate events, device options)
    │   │   ├── ResetButton/
    │   │   └── DevToggles/        # content flags, slow network, error mode, reduced motion
    │   ├── device/
    │   │   ├── IPhoneFrame/       # bezel, scale-to-fit, side buttons
    │   │   ├── DynamicIsland/
    │   │   ├── StatusBar/         # live clock, signal, battery
    │   │   ├── HomeIndicator/
    │   │   ├── SimKeyboard/       # visual iOS keyboard (optional toggle)
    │   │   ├── LockScreen/        # for notification demos (M-5.1)
    │   │   ├── NotificationBanner/
    │   │   ├── SystemAlert/       # iOS-style permission/confirm dialogs
    │   │   └── index.ts           # exports useDevice() for apps
    │   ├── browser/
    │   │   └── BrowserFrame/      # desktop browser chrome around WebApp
    │   └── shell.store.ts         # platform, scale, toggles (separate from app store)
    │
    ├── shared/                    # NON-VISUAL — no React components, no CSS
    │   ├── types/
    │   │   ├── domain.ts          # User, Profile, Consultation, Message, Answer…
    │   │   ├── content.ts         # ContentItem, Product, Plan…
    │   │   ├── engine.ts          # EngineEvent, Guardrail…
    │   │   └── scenario.ts
    │   ├── data/                  # JSON mock content (see 06-data-model.md)
    │   │   ├── persona/deborah.json
    │   │   ├── legal/consent.json
    │   │   ├── legal/disclaimer.json
    │   │   ├── conversation/suggestions.json
    │   │   ├── conversation/intake.json
    │   │   ├── conversation/guardrails.json
    │   │   ├── conversation/scripts/*.json   # one file per topic script
    │   │   ├── commerce/products.json
    │   │   ├── commerce/plans.json
    │   │   ├── content/library.json
    │   │   ├── content/best-tips.json
    │   │   ├── labs/sample-reports.json
    │   │   └── booking/slots.json
    │   ├── scenarios/
    │   │   ├── index.ts           # catalogue (id, label, group, description, file)
    │   │   └── S01-new-user.json … S12-*.json
    │   ├── engine/
    │   │   ├── classifier.ts      # guardrail + topic detection
    │   │   ├── guardrails.ts
    │   │   ├── intake.ts
    │   │   ├── answer.ts          # builds 7-section answers from scripts + profile
    │   │   ├── streamer.ts        # chunked text over time, cancellable
    │   │   ├── memory.ts          # summaries for greetings/check-ins
    │   │   ├── counting.ts        # free-consultation rules
    │   │   ├── labs.ts            # simulated extraction
    │   │   └── index.ts           # createConversationEngine()
    │   ├── store/
    │   │   ├── index.ts           # useAppStore (combined slices + persist)
    │   │   ├── slices/            # session, profiles, conversations, subscription,
    │   │   │                      # labs, plan, notes, notifications, booking, settings
    │   │   ├── selectors.ts
    │   │   └── loadScenario.ts
    │   └── utils/                 # ids, dates, text, sleep
    │
    └── apps/
        ├── mobile/
        │   ├── MobileApp.tsx      # entry: providers + <Navigator/>
        │   ├── navigation/
        │   │   ├── Navigator/     # renders stacks, sheets, modals, overlays
        │   │   ├── TabBar/
        │   │   ├── nav.store.ts   # stacks per tab, sheet/modal layers
        │   │   ├── registry.ts    # screenId → component + presentation meta
        │   │   ├── transitions.ts # push / sheet / modal / fade variants
        │   │   └── useNav.ts
        │   ├── styles/
        │   │   ├── mobile.tokens.css   # semantic tokens for mobile (--surface, --text-muted…)
        │   │   └── mobile.base.css     # app-level base inside the phone
        │   ├── ui/                # PRIMITIVES (no business logic)
        │   │   ├── Icon/          # adapter → Hugeicons
        │   │   ├── Motion/        # adapter → motion/react
        │   │   ├── Button/  IconButton/  OptionRow/  OptionList/  Input/  TextArea/
        │   │   ├── Checkbox/  Toggle/  Segmented/  Select/
        │   │   ├── Avatar/  Card/  Panel/  ListRow/  Divider/
        │   │   ├── Sheet/  Modal/  Alert/  Toast/
        │   │   ├── Header/        # top app bar
        │   │   ├── Skeleton/  Spinner/  ProgressStatus/  ProgressBar/
        │   │   └── index.ts
        │   ├── patterns/          # COMPOSED, domain-aware, reusable across screens
        │   │   ├── chat/          # MessageBubble, Composer, SuggestionList, IntakeQuestion,
        │   │   │                  # QuickReplies, SuggestedQuestions, ThinkingIndicator,
        │   │   │                  # AnswerSections, AnswerActions, ClosingLine, TrialCounter
        │   │   ├── safety/        # EmergencyInterrupt, MedicationSafetyCard, CrisisSupportCard,
        │   │   │                  # OutOfScopeReply, EscalationCard
        │   │   ├── commerce/      # ProductCard, PlanCard, InAppBrowser
        │   │   ├── profile/       # ProfileAvatar, ProfileSwitcherList, ProfileBanner
        │   │   ├── health/        # FocusCard, PlanProgressCard, CheckInCard, ContentCard,
        │   │   │                  # LabValueRow, ConsultationRow, NoteRow
        │   │   └── legal/         # ConsentSummary, DisclaimerLink
        │   ├── screens/           # one folder per screen ID, grouped by domain
        │   │   ├── onboarding/    # Splash (M-1.1), Welcome (M-1.2), Consent (M-1.3)
        │   │   ├── consultation/  # Conversation (M-2.1), InAppShop (M-2.7), FollowUpOptIn (M-2.8)
        │   │   ├── plans/         # FreeLimit (M-4.1), ChoosePlan (M-4.2), CreateAccount (M-4.3),
        │   │   │                  # StorePayment (M-4.4), PlanSuccess (M-4.5)
        │   │   ├── followup/      # AddLabs (M-5.3), ConfirmLabs (M-5.4)
        │   │   ├── profiles/      # ProfileSwitcher (M-6.1), AddMember (M-6.2),
        │   │   │                  # UpgradeFamily (M-6.3), ProfileDetails (M-6.5)
        │   │   ├── myhealth/      # MyHealthHub (M-7.1/7.2), NinetyDayPlan (M-7.3),
        │   │   │                  # ContentDetail (M-7.4), Library (M-7.5), AboutDeborah (M-7.6)
        │   │   ├── booking/       # BookingInfo (M-8.2), Scheduler (M-8.3), BookingConfirmed (M-8.4)
        │   │   ├── records/       # Records (M-9.1/9.3), ConsultationDetail (M-9.2),
        │   │   │                  # NoteEditor (M-9.4), LabReport (M-9.5), PdfPreview (M-9.6)
        │   │   └── account/       # Account (M-10.1), PrivacyData (M-10.2), Subscription (M-10.3),
        │   │                      # Notifications (M-10.4), Legal (M-10.5)
        │   └── hooks/             # useConversation, useActiveProfile, useHaptics(visual)…
        │
        └── web/                   # SAME SKELETON, isolated. Empty until web spec exists.
            ├── WebApp.tsx
            ├── navigation/        # React Router nested routes under /web
            ├── styles/
            ├── ui/
            ├── patterns/
            ├── screens/           # mirrored domain folder names (onboarding, consultation…)
            └── hooks/
```

## 2. Path aliases

| Alias | Path |
|---|---|
| `@shell/*` | `src/shell/*` |
| `@shared/*` | `src/shared/*` |
| `@styles/*` | `src/styles/*` |
| `@mobile/*` | `src/apps/mobile/*` |
| `@web/*` | `src/apps/web/*` |

Configure in both `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`compilerOptions.paths`).

## 3. Import boundaries (enforced by ESLint)

```js
// eslint.config.js — intent (implement with eslint-plugin-boundaries or no-restricted-imports)
// elements: shell, shared, styles, mobile, web
rules: {
  shell:  ['shared', 'styles', 'mobile:entry', 'web:entry'],
  shared: ['shared'],
  mobile: ['shared', 'styles', 'mobile', 'shell:device-hook'],
  web:    ['shared', 'styles', 'web'],
}
// inside each app: screens → patterns → ui (never upward)
```

A boundary violation is a build-breaking lint error. If something seems to need sharing between mobile and web, it either belongs in `shared` (if non-visual) or is duplicated deliberately and cross-referenced (if visual).

## 4. Why this absorbs change

- **New library?** Add an adapter folder in `ui/`; nothing else imports the library directly.
- **New screen?** New folder under its domain + one registry line + one `xref.md` row.
- **New state to demo?** New scenario JSON + one catalogue entry; appears in the State menu.
- **Design system lands?** Replace values in `tokens.primitives.css` and the app's semantic token file; components already reference variables only.
- **Web app starts?** Fill `apps/web` using the same domain folders and IDs; mobile is untouched.
