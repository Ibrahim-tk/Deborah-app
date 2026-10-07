# Docs index — Your Oracle Clinician prototype

This folder is the single source of truth for the prototype. Claude Code should read the relevant file **before** writing code for any part of the system.

| # | File | What it defines | Read when |
|---|------|-----------------|-----------|
| 00 | [00-product-context.md](00-product-context.md) | Product, user, story, principles, compliance constraints that affect UI | Always, once |
| 01 | [01-architecture.md](01-architecture.md) | Stack, layers, isolation model, data flow, key decisions | Before any code |
| 02 | [02-folder-structure.md](02-folder-structure.md) | Full annotated folder tree, aliases, import boundaries | Creating files |
| 03 | [03-prototype-shell.md](03-prototype-shell.md) | Top navbar, platform tabs, State menu, iPhone emulator, browser frame | Building the shell |
| 04 | [04-navigation.md](04-navigation.md) | Mobile navigator (stacks, tabs, sheets, modals, overlays), web routing | Building navigation / screens |
| 05 | [05-state-and-scenarios.md](05-state-and-scenarios.md) | Store slices, persistence, scenario catalogue and seed format, simulated events | Store, State menu |
| 06 | [06-data-model.md](06-data-model.md) | TypeScript domain types and every JSON file with examples | Data, mocks |
| 07 | [07-ai-simulation.md](07-ai-simulation.md) | Mock AI engine: classifier, guardrails, intake, streaming, memory, counting | Conversation work |
| 08 | [08-component-system.md](08-component-system.md) | ui / patterns / screens layers, adapters, mobile↔web cross-referencing | Any component |
| 09 | [09-styling.md](09-styling.md) | Vanilla CSS + CSS Modules, token layers, motion, accessibility baseline | Any styling |
| 10 | [10-conventions.md](10-conventions.md) | Naming, file templates, header blocks, checklists | Always |
| 11 | [11-build-plan.md](11-build-plan.md) | Phased build order, definition of done, ready-made Claude Code prompts | Planning a session |
| 12 | [12-design-system.md](12-design-system.md) | How DESIGN.md and the token files are wired in; quiz decisions | Styling, any visual work |
| — | [../DESIGN.md](../DESIGN.md) · [../PRODUCT.md](../PRODUCT.md) | **The design system** (Impeccable format) and product context | Every visual decision |
| — | `../design-tokens/` | Ready-to-copy CSS: primitives, mobile semantic tokens + type scale, fonts | Phase 0 scaffold |
| — | [xref.md](xref.md) | Registry linking screen IDs ↔ files ↔ Figma ↔ spec, mobile ↔ web | Adding/finding screens |

## UX specs

| File | Flow |
|------|------|
| [ux/00-ux-overview.md](ux/00-ux-overview.md) | Navigation map, screen inventory, global behaviours, F00 context |
| [ux/F01-onboarding.md](ux/F01-onboarding.md) | First launch & onboarding |
| [ux/F02-consultation.md](ux/F02-consultation.md) | Core consultation (the Conversation screen and all its states) |
| [ux/F03-safety.md](ux/F03-safety.md) | Safety & guardrails |
| [ux/F04-plans-account.md](ux/F04-plans-account.md) | Free limit, plans, account creation, payment |
| [ux/F05-followup-labs.md](ux/F05-followup-labs.md) | Follow-up notification, check-in, lab upload |
| [ux/F06-family-profiles.md](ux/F06-family-profiles.md) | Family profiles |
| [ux/F07-my-health-hub.md](ux/F07-my-health-hub.md) | My Health hub, 90-day plan, content, library, About Deborah |
| [ux/F08-book-deborah.md](ux/F08-book-deborah.md) | Human escalation and booking |
| [ux/F09-records.md](ux/F09-records.md) | History, consultation detail, Visit Notes, labs |
| [ux/F10-account-privacy.md](ux/F10-account-privacy.md) | Account, settings, privacy & data |
| [web/README.md](web/README.md) | Web app — reserved, not specified yet |

## External references

- **Figma wireframes v0.1:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=44-986
- **Notion › Genesis Health › Discover › Experience Blueprint:** Story, UX Flows, Format of Execution, Design System
- **Developer Brief v2** and **MSA/SOW requirements** (project files) — source of feature and safety requirements.
- **Legacy prototype** `deborah-in-your-pocket.jsx` — single-file React app calling the Claude API directly. Reference only: reuse its Handbook text as realistic placeholder copy, do **not** port its structure or its API call.

## Status legend used across docs

- **OPEN:** a decision still needed from Deborah / legal / account team. Implement the stated default.
- **ASSUMPTION:** a default chosen by design to unblock the prototype.
- **NOT IN WIREFRAMES:** a screen or state required for a fully functional prototype that wireframes v0.1 did not draw.
