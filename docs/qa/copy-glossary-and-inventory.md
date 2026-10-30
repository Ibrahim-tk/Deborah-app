# Copy glossary + inventory (pre–user-story pass)

**Date:** 2026-10-31  
**Purpose:** Baseline naming and string inventory so user stories can be diffed against the live prototype without walking every screen.  
**Sources:** [docs/copy/voice-tone-ux-copy.md](../copy/voice-tone-ux-copy.md), [PRODUCT.md](../../PRODUCT.md), [DESIGN.md](../../DESIGN.md), `src/shared/data/**/*.json`, hardcoded UI props in `src/apps/{mobile,web}`.  
**Raw extract:** [copy-inventory-raw.json](./copy-inventory-raw.json) (~1,437 JSON strings across 43 files; ~146 brand-related hits listed).  
**Screen-by-screen audit (read this for full copy):** [copy-audit-by-screen.md](./copy-audit-by-screen.md).

When you paste user stories next, we will map each story’s expected language onto this glossary and mark **story vs shipped** mismatches.

---

## 1. Glossary (preferred product language)

Use this table as the working “dictionary.” **Shipped** = what the prototype mostly says today. **Guide** = voice/tone doc recommendation (not always adopted).

| Term ID | Preferred in product (current shipped default) | Also appears as | Avoid / notes |
|---------|-----------------------------------------------|-----------------|---------------|
| `brand.product` | **Your Oracle** / **Your Oracle Clinician** | “Deborah in Your Pocket” (PRODUCT.md alias) | Don’t call the AI “Deborah” as if she is in the chat |
| `brand.ai` | **the Oracle** / **Oracle** | “I’m Oracle, an AI system…” | Never “I diagnosed…”; clarify AI ≠ clinician |
| `brand.creator` | **Deborah Maragopoulos, FNP** (attribution, books, products) | “Deborah” in comments / telehealth “book Deborah” | UI chat voice should be Oracle-informed-by-Deborah, not Deborah herself ([voice guide §3.9](../copy/voice-tone-ux-copy.md)) |
| `nav.ask` | **Ask Oracle** (conversation header, CTAs) | Comments/DESIGN still say “Ask Deborah”; tab is the Ask home | Align stories to **Ask Oracle** unless product reverts |
| `nav.health` | **My Health** (tab + hub title) | Guide prefers “Your health profile” for the card | Hub name stays **My Health**; card subcopy can say health profile |
| `nav.account` | **Account** / **Settings** (M-10.1 titled Settings in registry) | “Account” in PRODUCT/nav language | Confirm story wording: Account vs Settings |
| `feature.plan` | **Your Wellness Plan** (M-7.3 title, paywall, notifications) | Older “90-day plan”, “Healing Plan” in component names | Prefer **Wellness Plan** in user-facing copy |
| `feature.visitNotes` | **My Visit Notes** (screen/registry) | “Your visit notes”, “Visit Notes”, “For my provider” | Same feature, three surfaces — stories should pick one primary |
| `feature.records` | **My Health records** / Records entry | “My Notes” on Home destinations | Home says **My Notes**; records screen says Visit Notes — clarify in stories |
| `feature.healthProfile` | **health profile** / **Your health profile** | “Health basics”, “Complete intake”, “Health Profile” | Clinical questionnaire vs hub — keep distinct |
| `feature.family` | **Family profiles** / **Add a family member** | “My Family” on Home | |
| `commerce.products` | Genesis Gold®, Sacred 7® / Sacred Seven®, Gen-Pro® | “Sacred 7” vs “Sacred Seven” | Trademark spelling must stay consistent; disclosure pending legal |
| `cta.welcome` | **Get Started** (Welcome) | Guide recommends “Let’s begin” | Story vs guide vs shipped: three-way |
| `cta.name` | **What should we call you?** | Guide: “What should I call you?” | Shipped is “we”; guide is “I” |
| `cta.profileFor` | **Who is this profile for?** / **Who is this for?** | Guide: “Who are we creating this profile for?” | Switcher uses shorter “Who is this for?” |
| `composer.placeholder` | **Tell the Oracle how you’re feeling…** | Guide: “Ask a question or tell me what’s going on…” | |
| `composer.a11y` | **Message the Oracle** | | |
| `home.greeting` | **How are you feeling today?** | | |
| `safety.emergency` | Direct: call **911** / nearest ER / **I’m safe** (US prototype) | Guide: localize emergency numbers | Don’t soften with shopping or extra questions |
| `safety.crisis` | **988** (US prototype) | | Same localization caveat |
| `disclaimer.ai` | Education, not diagnosis / not a substitute for a provider | | Must stay factual; not “between us” privacy claims |

### Voice pillars (for story review)

From the tone guide — use when judging story copy, not as UI strings:

1. Human before clinical  
2. Curious, never interrogating  
3. Calm and grounded  
4. Clear and useful  
5. Respectful of agency  

---

## 2. Inventory map (where copy lives)

| Bucket | Location | Approx. volume | What it covers |
|--------|----------|----------------|----------------|
| A. Shared JSON | `src/shared/data/**/*.json` | **~1,437** extractable strings / **43** files | Intake questions, chat scripts, answers, products, consent, suggestions, screen notes |
| B. Placeholder clinical | same JSON with `"status": "placeholder"` | **~67** markers / **41** files | Must not be treated as Deborah-approved |
| C. Hardcoded UI props | `src/apps/mobile` + `src/apps/web` `*.tsx` (excl. lab) | **~362** unique `title`/`label`/`placeholder`/`aria-label` values | Chrome, forms, toasts, empty states |
| D. Registry titles | `navigation/registry.ts` | Per-screen titles | Nav chrome / captions |
| E. Specs (not shipped) | `docs/ux/*.md`, `docs/copy/*` | — | Acceptance wording; may differ from UI |
| F. Screen notes | `screen-notes.json` + client sticky notes | Designer handoff | Not product UI |

### Highest-traffic JSON areas (for story diffs)

- `src/shared/data/intake/healthBasics.json` — onboarding / profile questions  
- `src/shared/data/conversation/**` — scripts, answers, safety, suggestions  
- `src/shared/data/consent*` / legal bodies — Terms, Privacy (placeholder)  
- Product / plan copy in commerce + FreeLimit screens  

---

## 3. Internal mismatches already flagged

These are **inconsistent inside the codebase / guides**, independent of your user stories. Severity is for copy QA, not crashes.

| ID | Sev | Issue | Status (2026-10-31) |
|----|-----|-------|---------------------|
| C1 | High | **Ask Deborah vs Ask Oracle** | **Fixed** — Change Requests: never say Deborah; UI/actions use Ask Oracle / Book a consultation |
| C2 | High | **Visit notes naming drift** | **Fixed** — canonical **My Visit Notes** (Home, chat cards, actions, shared constant) |
| C3 | Med | **Plan naming** | **Mostly fixed** — user-facing Your Wellness Plan; code identifiers may still say `HealingPlan*` |
| C4 | Med | **My Health vs Your health profile** | Open (hub vs card subtitle; both valid) |
| C5 | Med | **Welcome CTA vs tone guide** | Open (shipped Get Started kept; guide differs) |
| C6 | Med | **Profile-for question variants** | Open (short vs long forms) |
| C7 | Med | **Sacred 7® vs Sacred Seven®** | Open (UI short vs legal long form) |
| C8 | Low | **Records vs My Notes** | **Fixed** with C2 |
| C9 | Low | **Composer copy vs guide** | Open (tone guide preference only) |
| C10 | Info | **~67 placeholder clinical strings** | Unchanged |
| C11 | Info | **Product disclosure** | Shipped FTC ownership line matches Change Requests (no Deborah name) |

**Twin drift fixed:** MedicalConsentSheet title aligned; CreateAccount code step “Checking your code”; AI disclosure full Change Requests line on mobile + web.

---

## 4. Suggested “story → glossary” checklist (for your next prompt)

When you paste user stories, we’ll check each story for:

1. **Name of the AI / product** (`brand.ai`, `brand.product`)  
2. **Primary nav labels** (`nav.ask`, `nav.health`, `nav.account`)  
3. **Feature nouns** (plan, visit notes, health profile, family)  
4. **CTAs** on the happy path (welcome, continue, save, book)  
5. **Safety / disclaimer** lines (must match shipped, not paraphrase)  
6. **Anything marked final clinical** vs still `placeholder` in JSON  

---

## 5. How this was built

```bash
# Re-extract JSON inventory
python3 - <<'PY'
# (see docs/qa/copy-inventory-raw.json generator used 2026-10-31)
PY

# Spot brand phrases in apps
rg -n "Ask Deborah|Ask Oracle|My Visit Notes|Your visit notes|Wellness Plan|Get Started" src/apps docs/copy
```

---

## 6. Story-hint pass (2026-10-31) — scoped only

Stories used as **hints**, not a wholesale rewrite. Intake questions / health-profile UI left alone. Fixes limited to family privacy copy, plans copy, and chat pronouns.

| ID | Sev | Issue | Fix |
|----|-----|-------|-----|
| S1 | High | Family plan UI claimed “private history for everyone” — false for parent-managed members; only invited teens keep a private account | Corrected ManageProfiles, UpgradeFamily, AddMember, ChoosePlan (mobile+web) and `plans.json` Family features |
| S2 | Med | FreeLimit “comes with a plan” / awkward Wellness Plan line | Titles → “unlocks with a subscription”; family body → “family members” |
| S3 | High | Family chat fell back to they/them when `intake.pronouns` missing (e.g. S09 Sofia) | Shared `resolvePronouns` (pronouns → gender → sex at birth); wired into conversationRunner, suggestions `thirdPerson`, proxyContext, MedicalConsentSheet; S09 seeded `she/her` |

**Left alone on purpose:** health intake screens/questions; teen invite privacy copy in `teenAccount.json` (already correct); screen-notes.json (designer notes, not product UI); broader story language that would revamp chat/onboarding UI.

**Status:** Scoped story-hint fixes landed. Re-check Family plan + Ask Oracle on a managed profile (S09) and Choose plan with Family preselect.
