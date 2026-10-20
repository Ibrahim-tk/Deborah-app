# Sheet close button (X) — per-sheet plan

Status: **done** (2026-10-20). The glass X is off by default in `ui/BottomSheet`; the 8 sheets below opt in.
This plan decides per sheet, by context, following iOS HIG / common app practice.

## Rule (industry standard)

Show the X when the sheet is a **task or a long / full-height view** where swipe-down isn't obvious or would lose
work, and the sheet has **no explicit exit button** of its own.

Hide the X when:
1. The sheet already has an explicit exit — **Cancel, Done, Not now, Skip, Keep talking** (two exits confuse).
2. It's a **short choice or confirmation** — tap outside / swipe is the expected exit (pickers, menus).
3. It's **required** — the user must answer (not dismissible).
4. It's a **system imitation** (Apple sign-in, Payment) or an **action menu** — they carry their own Cancel.
5. It's **safety-critical** — the exit is a deliberate, labelled choice, never a bare X.

Mechanics: `BottomSheet` keeps `showClose`; default changes to **off**, and each sheet opts in. Routed sheets get
a `closeButton: true` flag in the registry.

## Decisions

| Sheet | Screen | X? | Why |
|---|---|---|---|
| Create account / Sign in | M-1.4 | **Yes** | Multi-step form (email → code); no Cancel |
| Terms / Privacy | M-1.5 | No | Has **Done** |
| Deborah's welcome | M-1.9 | No | Required step (not dismissible) |
| Ask an adult | M-1.10 | No | Required step (not dismissible) |
| Follow-up reminder | M-2.8 | No | Has **Not now** |
| Scan a label | M-2.9 | **Yes** | Full-height camera task; no Cancel |
| Profile question | M-2.11 | No | Has **Skip** |
| What Deborah noted | M-2.13 | No | Has **Cancel / Done** |
| Free limit reached | M-4.1 | No | Required (choose a plan) — not dismissible |
| Payment | M-4.4 | No | Apple system sheet, own Cancel |
| Add lab results | M-5.3 | **Yes** | Task sheet (camera / upload); no Cancel |
| Profile switcher | M-6.1 | No | Short picker — tap outside / swipe |
| Upgrade to Family | M-6.3 | No | Has **Not now** |
| Log your visit | M-9.8 | No | Has **Not now / Done** (own close removed with this) |
| Upload a document | M-11.3 | No | Has **Back / Not now / Done** per step |
| Phone number (Settings) | M-10.1 | **Yes** | Small form, only a Save button |
| Delete account confirm | M-10.2 | No | Has **Cancel** |
| Add medicine | M-1.8, chat | **Yes** | Form, only an Add button |
| Symptoms | M-2.1, M-2.12 | **Yes** | Full-height picker with search; only an Add button |
| Home greeting | M-2.0 | **Yes** | Informational; one CTA, needs a quiet way out |
| Health basics consent | M-1.8 | No | Required consent; back is the exit |
| Crisis support | chat | No | Safety — exit is **Keep talking with Deborah** |
| Escalation (book Deborah) | chat | No | Has **Not now** |
| Consent legal text | chat | **Yes** | Read-only document, no button |
| Book Deborah confirmation | chat | No | Has **Done** |
| Action menus / Text size | many | No | iOS action sheet, own Cancel |
| Apple / Google sign-in | M-4.3 | No | Apple system sheet, own Cancel |

**Result:** X on 8 sheets — Create account, Scan a label, Add lab results, Phone number, Add medicine, Symptoms,
Home greeting, Consent legal text. Every other sheet exits through its own labelled button, a required answer,
or swipe / tap outside.

## Work
1. `BottomSheet`: `showClose` default → `false`. Registry: add `closeButton?: boolean` to sheet entries; the
   navigator passes it to the frame.
2. Turn it on for the 8 sheets above (3 routed via registry, 5 inline via prop).
3. Log your visit: drop its own IconButton close (it has Not now / Done).
4. Check each of the 8 in the preview.
