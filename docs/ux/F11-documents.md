# F11 — Documents and reports

**Goal:** one place per profile to keep health documents the user uploads and the reports Deborah has made, and to bring either into a conversation.
**Source:** Miro "Documents and Reports" flow (2026-10-19). Build plan: [../planning/documents-reports-plan-2026-10-19.md](../planning/documents-reports-plan-2026-10-19.md).
**Figma:** not drawn yet (NOT IN WIREFRAMES).
**Scenarios:** S26 (empty), S26b (populated, with family member), S26c (pending chat prompt).

---

## Flow

```
M-2.0 Home / M-7.2 Hub ─► M-11.1 Documents and reports (profile: Myself / family member)
  My Uploads ─ row ─► M-11.2 Document preview ─ Discuss with Deborah ─► M-2.1 (document attached)
                                              └ Download (toast) · Close
  Upload a document ─► M-11.3 sheet: method → type → details → checks → uploading → reading
                     └► result: "Ask Deborah to review it now?" Yes ─► M-2.1 · Not now ─► toast "Document saved"
  Saved Reports ─ row ─► M-9.6 PDF preview ─► Print · Download PDF
  Delete (preview overflow / row menu) ─► Alert ─ Delete ─► toast "Document deleted" · Cancel ─► back
```

## M-11.1 · Documents and reports

| Meta | |
|---|---|
| Presentation | Push from M-2.0 / M-7.2 (tab bar visible) |
| Params | `{ tab?: 'uploads' \| 'reports'; profileId?: ID }` |

**Layout:** Header "Documents and reports" (back) · profile line "Myself" / "{name}" (opens M-6.1 when there is more than one profile) · **Segmented** My Uploads | Saved Reports · list · primary **Upload a document** button pinned at the bottom (My Uploads only).

| Tab | Row | Empty state |
|---|---|---|
| My Uploads | IconWell by type · title ("Lab result · Oct 12, 2026") · plain subtitle "Uploaded 13 Oct · PDF · 412 KB" · chevron | "No documents yet" · "Lab results, imaging reports, prescriptions and visit notes you add live here." + Upload a document |
| Saved Reports | Notes of kind `provider-brief` ("Visit summary") and `saved-answer` ("Saved guidance") · title · kind · updated date | "No saved reports yet" · "Visit summaries and guidance you save from Deborah appear here." |

**States:** loading (skeleton 300–600 ms) · populated · each tab empty · other-profile context line · after delete (row removed, toast).
Newest first (`uploadedAt` / `updatedAt`). No search in v1. No badges or chips — type and format are plain text.

**Acceptance:** [ ] Tabs show only the selected profile's items. [ ] Switching profile refilters and keeps the tab. [ ] Deleted documents never appear.

## M-11.2 · Document preview

**Presentation:** push. **Params:** `{ documentId: ID }`.
**Layout:** file surface (image thumbnail for JPG/PNG; page glyph for PDF/TXT — file contents are never read) · rows: Date on document · Type · Uploaded · Size · description · "What Deborah can see" (extracted fields, placeholder footnote) · **Discuss with Deborah** (primary) · **Download** (secondary) · overflow: Delete.
**Behaviour:** Download → toast "Downloaded" (no file). Discuss → M-2.1 with the document attached (F11 Phase 4). Missing / deleted id → "This document is no longer available" + back.

## M-11.3 · Upload a document

**Presentation:** sheet (large), one sheet with steps — never stacked sheets.

| Step | Content |
|---|---|
| Method | Option rows: **Take a photo** (simulated camera, shared with M-5.3) · **Choose a file** (real `<input type="file">`; only name, size and type are read) |
| Type | Option rows: Lab result · Imaging report · Prescription · Visit note · Other |
| Details | Title (default "{Type} · {date}") · Date on document (optional, not in the future) · Description (optional) |
| Checks | Run as soon as a file is picked, before Type. Accepted: PDF, JPG, PNG, TXT, up to 20 MB. Failures show inline on the Method step with the file name and **Choose another file** |
| Uploading | "Uploading securely…" ProgressBar, 1–1.5 s (simulated, no network) |
| Reading | "Reading key details…" 1.5–2.5 s; fields from `data/documents/extractions.json` by type |
| Result (M-11.4) | Extracted fields · "Ask Deborah to review it now?" **Yes** → M-2.1 · **Not now** → toast "Document saved", back to M-11.1 with the new row first |

**Errors (copy):**
- format → "We accept PDF, JPG, PNG or TXT files."
- size → "This file is {n} MB. The limit is 20 MB."
- empty → "This file looks empty. Try another one."
- future date → "The date can’t be in the future."

**Behaviour:** closing during uploading/reading → Alert "Stop uploading?" (Stop · Keep uploading); stopping saves nothing. Lab result type also creates a `LabReport` through the M-5.4 confirm path, so M-9.1 Labs still lists it. Upload time is stamped automatically (`uploadedAt`). The document is saved when Reading finishes; swiping the sheet away on the result step keeps it, and the next M-2.1 open offers it once.

## Delete

Saved Reports open M-9.6, which offers **Download PDF** (toast "PDF downloaded"; no file), Share and Print.


Alert title "Delete this document?" · body "Deborah will no longer use this document in your conversations." + when `sharedWith` is set: "It stays with anyone you already shared it with." · **Delete** (destructive) · Cancel.
Opened from M-11.2's overflow (**Delete document**) or a row's options in My Uploads (long-press / right-click → Open · Delete document). Confirm → soft delete (`deletedAt`), toast "Document deleted", back to M-11.1; Cancel changes nothing. Old chat bubbles that referenced it read "Document removed".

## Deborah handoff (Phase 4)

- Attaching a document (`openAsk({ documentId })` from M-11.2 Discuss or the upload result's Yes) adds a user attachment bubble (`AttachedDocument`: type icon, title, type · format; tap → M-11.2; deleted → "Document removed"). Deborah's reply comes from `data/documents/review.json` (placeholder) with its own suggested questions; it is not a counted consultation.
- Lab result → existing lab-informed answer path. Prescription or extracted medications → medication guardrail (F03); never interpret dosing.
- After an upload where the user chose **Not now**, the next M-2.1 open shows once: "You uploaded {title}. Want to talk it through?" Yes attaches; Not now → "It’s in Documents and reports whenever you want to come back to it." The offer waits while intake or an answer is in progress, and only shows for the profile the document belongs to.
- Another profile's document can't be discussed from M-11.2 (no Discuss button), as M-9.5.

## Edge cases (verified 2026-10-19)

Wrong format / over 20 MB / empty file → inline error · TXT with no MIME type accepted · duplicate title → " (2)" · long file names wrap (checked at 320 pt) · future date → inline error · cancel camera or picker → no change · Stop mid-upload pauses, saves nothing · switch profile refilters, keeps tab · member empty state names them · delete last document → empty state · deleted document in chat → "Document removed" · another profile's upload: result shows Done only (no Ask Deborah) · free limit: Discuss / Yes route through M-4.1 (the attach is not held — OPEN) · each sheet step takes focus and is announced by its title · text contrast ≥ 7:1 on every surface used.

## OPEN

- OPEN: Delete is soft in the prototype because "we may need it again" (Miro sticky). Is a hard delete or retention period required?
- OPEN: Can users delete a document they have shared? Default: yes, with the shared line in the alert.
- OPEN: Teen profiles — can a parent see/delete a teen's uploads? Default: follows F06 profile ownership.
- OPEN: Duplicate uploads — dedupe? Default: allowed, title gets " (2)".
- OPEN: Does a description go through safety classification? Default: no — it is not sent as a message.
- OPEN: Premium gating for Download PDF. Default: none, as M-9.6.
