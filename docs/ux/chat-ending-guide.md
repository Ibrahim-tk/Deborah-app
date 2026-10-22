# Chat ending guide (Tone Guide dummy chats)

**Purpose:** How a scripted consultation ends after the Tone Guide starter samples. Copy lives in `src/shared/data/conversation/scripts/`; UI is unchanged (F02).

**Related:** [F02-consultation.md](F02-consultation.md) · Deborah AI Tone Guide (guardrails) · [F02e-guidance.md](F02e-guidance.md) (What’s next / follow-ups)

---

## Path to the end

```
chip / send → ownIntake clarifiers (one at a time, pills) → readyLine
  → “Tell me what you think” → generating → answered (7 sections)
  → product slot (if script has product) → closingLine → What’s next / visit notes trail
```

No live LLM. Engine + JSON only.

---

## Seven sections (always this shape)

| Key | Title (typical) | Job |
|-----|-----------------|-----|
| `hearing` | What I'm Hearing | Reflect what she said |
| `hypothalamic` | The Hypothalamic Connection | Plain-language why (physiology / scope) |
| `mayMean` | What This May Mean | Meaning without diagnosing |
| `providerQuestions` | Questions for Your Provider | What to ask / handoff |
| `tests` | Tests Worth Discussing | Tests to ask about (when relevant) |
| `doNow` | What You Can Do Now | Practical steps, doses when Tone Guide has them |
| `word` | A Word from Deborah | Door open / care |

Then:

1. **Product slot** — when the script sets `answer.product` (e.g. Genesis Gold). Ownership disclosure copy is placeholder until attorney sign-off (Tone Guide guardrails).
2. **`closingLine`** — provider handoff + visit notes / “I’ll be here…”.
3. **What’s next / AfterGuidanceTrail** — existing F02e trail (visit notes, follow-ups). Not rewritten per sample.

---

## Starter sets

| Audience | Chips | Script ids |
|----------|------:|------------|
| New sign-up (no answered consult yet) | 3 | `sleep-night`, `gas-bloating`, `pms-gen-pro` |
| Logged-in (any answered consult on profile) | 4 | `after-provider`, `anxious-parent`, `endo-daughter`, `out-of-scope-ankle` |

Suggestions: `src/shared/data/conversation/suggestions.json` (`newSignup` / `returning`).

---

## Guardrails (ending behaviour)

- **Supplements / doses** — allowed in `doNow` as Deborah voice (placeholder clinical copy).
- **Prescriptions** — suggest discuss with provider + drugs.com; never start/stop/change a prescription in copy.
- **Out of scope** (`out-of-scope-ankle`) — no product; clear orthopedic referral + brief self-care; then door open after the visit.
- **Emergencies (Sample 4)** — not in these chips; use existing F03 emergency path if triggered elsewhere.

---

## Status

All Tone Guide sample scripts: `"status": "placeholder"` until Deborah clinical sign-off.
