# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

The first build is a browser-run, high-fidelity prototype that emulates an iPhone (393×852 pt) inside a React + Vite app (see `docs/01-architecture.md`). Design language, navigation and controls follow iOS conventions. A desktop web app follows later as a separate surface with its own DESIGN file.

## Stack

React 18 + Vite + TypeScript, vanilla CSS with CSS Modules, Zustand, Motion, Hugeicons. Frontend only: no backend, JSON mocks, scripted AI engine.

## Users

Women roughly 40–65 navigating hormonal health (perimenopause, menopause, thyroid, sleep, energy), many arriving already trusting Deborah through her books, blog, YouTube and Genesis Gold products. Secondary: their family members via family profiles (teen daughters, partners, elderly parents), managed by the account holder. Often tired, sometimes anxious, frequently reading glasses-dependent, using the app in short sessions at home, often in the evening.

## Product Purpose

An everyday health-education companion that lets users consult an AI version of Deborah Maragopoulos FNP, built only on her published work. It listens, asks a few questions, and answers in Deborah's seven-section framework so users understand what may be happening and bring better questions to their provider. Success: users feel heard, understand their bodies, act on guidance (labs, lifestyle, products), return for follow-ups, and trust the app enough to add family.

## Positioning

The only AI health guide that reasons exclusively from one named clinician's 30-year body of work, speaks in her voice, and always structures answers in her clinical framework — with a real path to book her personally.

## Operating Context

Consultations in a conversation; follow-up reminders; lab reports uploaded from photos or PDFs; a personal My Health hub with a 90-day plan; Genesis Gold purchases via Shopify; provider visits outside the app; booking Deborah via telehealth.

## Capabilities and Constraints

- Education and wellness guidance only: not diagnostic, not prescriptive, not an emergency service.
- Emergency detection (911), medication safety, crisis safeguards, out-of-scope honesty and human escalation are mandatory.
- Every answer: seven sections in fixed order plus the closing line "Bring this to your provider…".
- Free trial of 3 consultations, then Individual, Family or Premium plans.
- HIPAA, CCPA, CMIA obligations; health data never used for training without consent; generic lock-screen notifications.
- Undecided: final pricing, payment rails (IAP vs Stripe), minors' consent rules, telehealth system, Deborah's licensed states.

## Brand Commitments

- Name: Your Oracle Clinician (also "Deborah in Your Pocket"). Creator: Deborah Maragopoulos FNP, The Hormone Queen®.
- Palette: Purple, Gold, Pink, Midnight Purple ramps (50–900), anchors purple #613977, gold #e6c776, pink #cd497f.
- Typography: Cormorant Garamond (display), SF Pro (body and UI text, iOS Dynamic Type sizes).
- Voice: warm, wise, plain-spoken — "a brilliant doctor friend".
- Desired feel: warm, calm, trustworthy, elegant, clinical in its precision, feminine, modern.

## Evidence on Hand

- The Hypothalamus Handbook text (embedded in the legacy prototype JSX).
- Developer Brief v2, MSA/SOW requirements, Figma wireframes v0.1, brand mood board.
- Absent and not to be fabricated: Deborah photography, approved clinical copy, testimonials, attorney-drafted legal text, real prices.

## Product Principles

1. It's Deborah, not a chatbot.
2. Listen before answering, lightly.
3. Honest over agreeable.
4. Care first, commerce second.
5. There is always a human path.

## Accessibility & Inclusion

- WCAG 2.2 AA minimum; AAA (7:1) target for all readable text.
- Touch targets ≥ 48 pt (above the iOS 44 pt minimum) for an older audience.
- Text scales with iOS text size and an in-app size control; layouts must survive the largest step.
- Reduced motion honoured; no meaning by colour alone; no gestures that require precision or multiple fingers.
