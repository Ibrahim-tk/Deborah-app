# 00 · Product context

## What we are prototyping

**Your Oracle Clinician** (also "Deborah in Your Pocket") is an AI-powered health-education companion built exclusively on the published work and clinical voice of **Deborah Maragopoulos FNP** ("The Hormone Queen®"), founder of Genesis Health Products (Genesis Gold®). Core audience: women roughly 40–65 navigating hormonal health. It must feel like talking to Deborah — not a generic chatbot.

This repository is a **designer's rapid prototype**: a browser-run, mobile-first, fully clickable, AI-native experience with **no backend**. It is used to validate flows with the client and to hand a precise reference to the engineering team.

## The story (condensed — full version in Notion › Story)

1. **Before the app:** Maria finds Deborah's articles, watches her YouTube, buys a supplement on Shopify, and the order email/newsletter links her to the app.
2. **First launch:** a warm welcome asks only her name; she accepts the disclaimer.
3. **First consultation:** tapping the composer shows 3 suggestions. She describes symptoms; Deborah asks a few light intake questions (age, meds/conditions…), suggests follow-up questions, and — when Maria asks — answers in **Deborah's 7-section framework**, including the relevant product, labs to discuss, and "see your provider".
4. **Safety:** an emergency mention triggers "call 911"; a medication question gets an honest "I can't prescribe" with an interaction link.
5. **Trial ends** after 3 free consultations → she picks a plan.
6. **Offline:** she buys the product, gets labs, sees a provider.
7. **Follow-up:** a notification brings her back; Deborah remembers, asks for labs, and refines guidance.
8. **My Health:** her personal hub — current focus, 90-day plan, records, and Deborah's content picked for her.
9. **Family:** next day she adds her daughter (irregular periods); answers adapt to that profile. Husband/others on paid plans.
10. **Human escalation:** if the app isn't enough, she books Deborah herself.

## Experience principles (apply to every screen)

1. **It's Deborah, not a chatbot.** Voice, pacing and structure mirror her consultations.
2. **Listen before answering, lightly.** One question at a time, tap-to-answer, always skippable.
3. **Honest over agreeable.** 911, "I can't prescribe", "see your provider", "I don't know".
4. **Care first, commerce second.** Products only inside section 6 of an answer, clearly disclosed.
5. **The app remembers.** Each profile carries its history, labs and plan forward.
6. **There is always a human path.** Booking Deborah is never more than two taps away.
7. **Calm and legible.** Large targets (≥ 44 pt), generous type, low cognitive load — the audience is 40–65 and often tired.

## Constraints from the brief / SOW that the UI must express

| Constraint | UI consequence |
|---|---|
| Click-to-accept attorney-drafted disclaimer + AI disclosure | Consent screen M-1.3 before any conversation; disclaimer reachable from every chat (`(i)`) and Account |
| Required 7-section response, fixed order, mandatory closing line | `AnswerSections` pattern is rigid; order and closing line are not configurable |
| Emergency detection before any other response | Engine guardrail runs first; `EmergencyInterrupt` replaces the answer |
| Drug-interaction awareness | `MedicationSafetyCard` whenever a medication is mentioned |
| Crisis safeguards, human escalation, "I don't know" handling | `CrisisSupportCard`, `EscalationCard`, `OutOfScopeReply` |
| Not diagnostic, not prescriptive; hedged language | Copy guidelines in `07-ai-simulation.md` |
| Health data never used for training without consent; HIPAA/CCPA | Privacy screens, delete/download data, generic lock-screen notifications |
| Free trial: 3 consultations | Counting rules in `07-ai-simulation.md` |
| Family plan up to 5 profiles | Profile switcher, per-profile histories |
| Knowledge only from Deborah's content | Mock scripts only; no external facts invented |

## Out of scope for this prototype

Real AI, real auth, payments, uploads to servers, analytics, push infrastructure, the provider app (Iteration 2), the "know your body" anatomy module.
