# F05 — Follow-up & return with labs

**Goal:** bring Maria back at the right moment; Deborah remembers, asks how it went, reviews labs, refines guidance.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547
**Scenarios:** S07 (follow-up due, locked), S08 (labs reviewed)

```
[shell] LockScreen + notification (M-5.1) ─tap─► unlock ─► deep link followup:<profile> ─► M-2.1 checkin
M-2.1 checkin ─ Yes/Partly/Not yet ─► Deborah reply ─► labRequest "Upload my labs" ─► M-5.3 sheet
M-5.3 ─ photo/PDF ─► "Reading your report…" ─► M-5.4 confirm ─► send ─► M-2.1 lab-informed answer (counts as consultation)
            └ manual ─► M-5.4 (empty rows)
```

---

## M-5.1 · Lock screen notification (shell device layer)

**Layout:** wallpaper, large time/date (simulated clock), notification card: app icon, "Your Oracle Clinician", "now", body "Deborah: How are you feeling this week?".

**Interactions:** tap card → unlock animation (slide up 300 ms) → `openDeepLink('followup:<profileId>')`. Swipe up on empty area → unlock to last screen. When unlocked, the same notification arrives as a **banner** at top.

**Rules:** body is always generic — never symptoms, conditions, product names (PHI).
**Acceptance:** [ ] Deep link selects the correct profile. [ ] Notification marked read.

---

## M-2.1 state · Check-in (Figma 5.2)

**Opening message (Deborah, streamed):** "Welcome back, {name}. Last time we talked about {topic}. Did you get a chance to try what we discussed?" + quick replies **Yes · Partly · Not yet**.

| Reply | Deborah |
|---|---|
| Yes | Encouraging line; asks if she got labs done → `labRequest` message with **Upload my labs** button + "Not yet" option row |
| Partly | Empathetic; asks what got in the way (free text) → short reply → `labRequest` |
| Not yet | No-guilt line; offers to restart the 90-day plan (→ M-7.3) or talk about what's hard |

Check-in replies are not counted. The lab-informed answer **is** counted (paid users unaffected).

---

## M-5.3 · Add your lab results

| Meta | |
|---|---|
| Presentation | Sheet, medium |
| Entry | `labRequest` button · M-9.1 Labs segment "+ Add" · hub quick link |

**Layout:** title "Add your lab results" · **Take a photo of the report** · **Upload a PDF** · **Enter values manually** · trust line "Your results are encrypted and only used for your consultations."

**Behaviour**
| Option | Prototype behaviour |
|---|---|
| Take a photo | Simulated camera view (full-screen modal: dark viewfinder, frame guide, shutter) → captured thumbnail → "Use photo" → processing |
| Upload a PDF | Real `<input type="file" accept="application/pdf,image/*">` (file is **not** read; only the name is shown) → processing |
| Manual | Push M-5.4 with empty rows |
| Processing | Inline in sheet: progress + "Reading your report…" 1.5–2.5 s → M-5.4 with `sample-a` values |

---

## M-5.4 · Check your results

| Meta | |
|---|---|
| Presentation | Modal (header: back/×, title "Check your results") |

**Layout**
1. Detected metadata row: lab name · collection date (editable date picker).
2. **LabValueRow** list: marker · value · unit · edit icon. Edited rows show "edited".
3. **+ Add a value** (marker field with suggestions: TSH, Free T3, Free T4, Estradiol, Progesterone, DHEA-S, HbA1c, Ferritin, Vitamin D…).
4. Disclaimer: "Please make sure these match your report."
5. Primary **Looks right — send to Deborah**.

**Interactions:** tap row → inline edit (numeric keypad); swipe-left row → delete; send → `labs.confirmReport` → dismiss modal → Conversation: user system-message "Shared lab results ({n} values)" → generating → **lab-informed answer** (script `lab-review` / `withLabs` variant; "Based on your labs from {date}" tag) → §6 includes "Your next 90 days" habits; actions add **Book Deborah**.

**Acceptance:** [ ] Every value editable before sending. [ ] Report saved and visible in M-9.1 Labs. [ ] Answer references at least one confirmed value by name.
