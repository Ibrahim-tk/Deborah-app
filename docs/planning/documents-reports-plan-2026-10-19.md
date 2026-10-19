# Documents & Reports — build plan (2026-10-19)

**Source:** Miro flow "Documents and Reports" (screenshots shared 2026-10-19).
**Surface:** internal (`/internal`) by default, per AGENTS.md.
**Spec to create:** `docs/ux/F11-documents.md` (Phase 0). Screen IDs `M-11.x`; web `W-11.x` reserved, not built.

This plan builds the flow on what already exists — it does **not** add a parallel records system.
Reused: M-9.1 Records shell + `Segmented`, M-5.3 AddLabs camera/picker pattern, M-9.6 PdfPreview,
`Sheet`, `OptionList/OptionRow`, `Alert`, `Toast`, `ProgressBar/ProgressStatus`, `EmptyState`, `Skeleton`,
`ProfileSwitcher` (M-6.1), store `LabsSlice` / `NotesSlice`, conversation attachment kickoff.

---

## 1. The flow, mapped

```
Client Dashboard (M-2.0 Home / M-7.2 Hub)
 └─ "Documents and reports" ─► M-11.1 Library  [profile: Myself / family member]
       tabs: My Uploads | Saved Reports
       ├─ A. View uploaded ─► M-11.2 Document preview (date · type · description)
       │       ├─ Discuss with Deborah? Yes ─► M-2.1 Conversation (document attached)
       │       └─ No ─► Download · Close ─► End
       ├─ B. Upload ─► M-11.3 Upload sheet
       │       method: Take photo | Choose file
       │       ─► type: Lab result · Imaging report · Prescription · Visit note · Other
       │       ─► validate: PDF/JPG/PNG/TXT ≤ 20 MB ? no ─► inline error, retry
       │       ─► date + timestamp (editable "date of document"; upload time auto)
       │       ─► "Uploading securely…" (simulated) ─► "Reading key details…" (simulated)
       │       ─► M-11.4 Upload result: extracted details + "Ask Deborah to review it now?"
       │              ├─ Yes ─► M-2.1 Conversation (document attached)
       │              └─ No  ─► toast "Document saved" ─► back to Library
       ├─ C. View saved report ─► Saved Reports tab ─► select (Visit summary / Saved guidance)
       │       ─► M-9.6 PDF preview ─► Print or Download PDF ─► End
       └─ D. Delete ─► select doc ─► Alert "Deborah will no longer use this document…"
               ├─ Confirm ─► remove from library ─► toast "Document deleted" ─► End
               └─ Cancel  ─► back to Library
```

Sticky note → behaviour: after any upload, the **next Deborah chat** opens with a one-time
prompt: "You uploaded {title}. Want to talk through it?" (Phase 4).

---

## 2. Decisions & OPEN questions (implement the default, leave `// OPEN:`)

| # | Question (from Miro / gaps) | Prototype default |
|---|---|---|
| O1 | Sticky: "Warning — we may need it again" on delete | Keep the warning copy; delete is **soft** in store (`deletedAt`), hidden from UI. No undo in v1. |
| O2 | Sticky: can users delete a document they have shared? | Allowed; alert adds one line "It stays with anyone you already shared it with." |
| O3 | Where does the entry point live? | Home reports row + Hub quick link "Documents and reports". Not a new tab. |
| O4 | Relation to existing M-9.1 Labs segment | Lab-type uploads also create a `LabReport` via the existing M-5.4 confirm path; M-9.1 Labs still lists them. Library is the file view, Records is the clinical view. |
| O5 | Saved Reports contents | Notes of kind `provider-brief` (Visit summary) + `saved-answer` (Saved guidance). Read-only here; editing stays in M-9.4/M-9.7. |
| O6 | "System reads key details" for non-lab types | Simulated per-type extraction from `src/shared/data/documents/extractions.json` — all `"status": "placeholder"`. No real OCR, file never read. |
| O7 | TXT preview | Show filename + extracted fields only (file not read). |
| O8 | Free plan / Premium gating | None in v1; plain footnote like M-9.6. |
| O9 | Family member uploads | Docs belong to the selected profile; switching profile in Library filters. Teen profiles follow F06 rules (OPEN for Deborah). |
| O10 | Download | `Toast` "Downloaded" (no real file). Print = `window.print()` of preview, as M-9.6. |

Safety: if the document **type is Prescription** or extraction includes medications, Deborah's
reply in chat must route through the existing **medication guardrail** (docs/07, F03) — never
interpret dosing. Lab review reuses the existing lab-informed answer path.

---

## 3. Data model (Phase 1)

`src/shared/types/domain.ts`

```ts
export type DocumentType = 'lab' | 'imaging' | 'prescription' | 'visit-note' | 'other';
export type DocumentFormat = 'pdf' | 'jpg' | 'png' | 'txt';

export interface HealthDocument {
  id: ID;
  profileId: ID;
  type: DocumentType;
  format: DocumentFormat;
  fileName: string;
  sizeBytes: number;
  title: string;              // defaults to type label + date
  description?: string;
  documentDate?: ISODate;     // user-editable "date on the document"
  uploadedAt: ISODate;        // auto timestamp
  source: 'camera' | 'file' | 'seed';
  extraction?: DocumentExtraction;   // simulated
  labReportId?: ID;           // when type === 'lab'
  sharedWith?: string[];      // display only (O2)
  deletedAt?: ISODate;        // soft delete (O1)
}

export interface DocumentExtraction {
  fields: { label: string; value: string }[];   // test names, values, dates, medications
  status: ContentStatus;                         // always 'placeholder'
}
```

Store: new `DocumentsSlice` in `src/shared/store/slices/documents.ts`
`addDocument · updateDocument · deleteDocument (soft) · markDocumentPrompted`
plus `documents.pendingChatPromptId` for the sticky-note prompt. Selectors:
`selectDocuments(profileId)` (newest first, excludes deleted), `selectSavedReports(profileId)`.

Data: `src/shared/data/documents/seed-documents.json`, `extractions.json`, `types.json`
(type labels, icons, accepted formats, `maxBytes: 20971520`). Copy strings in `src/shared/copy`.

Validation is a pure util `src/shared/utils/validateDocument.ts` → `{ ok } | { ok:false, reason:'format'|'size'|'empty' }`
— unit-testable, used by mobile and later web.

Scenarios: `S26-documents-empty`, `S26b-documents-populated` (uploads + both report kinds, a
family member with their own docs), `S26c-documents-chat-prompt` (pending prompt set).

---

## 4. Screens

| ID | Name | Presentation | States |
|---|---|---|---|
| M-11.1 | Documents and reports (Library) | push, tab bar | loading skeleton · uploads list · reports list · each empty · other-profile context line · after-delete |
| M-11.2 | Document preview | push | image / pdf / txt variants · extracted details · actions (Discuss · Download · Delete via overflow) |
| M-11.3 | Upload a document | sheet (large) | method → camera → type → details (date, title, description) → error (format / size) → uploading → reading → result |
| M-11.4 | Upload result | step inside M-11.3 sheet | extracted fields · "Ask Deborah to review it now?" Yes / Not now |
| — | Delete confirm | `Alert` | warning copy (O1/O2) · Delete (destructive) · Cancel |
| (reuse) M-9.6 | Saved report preview | modal | already built; add `Download PDF` action label |
| (reuse) M-2.1 | Conversation | — | new `documentAttached` kickoff + one-time upload prompt |

### UI direction (DESIGN.md wins; no invention)
- **Library:** Header "Documents and reports" · profile line ("Myself ▾" opens M-6.1 switcher) ·
  `Segmented` My Uploads | Saved Reports · list of `DocumentRow` (IconWell by type, title, plain
  subtitle "Lab result · 12 Oct 2026 · PDF") · primary `Button` "Upload a document" pinned at bottom.
  No badges/chips — type and format are plain subtitle text.
- **Preview:** file surface (`Card`, thumbnail for images, page glyph for PDF/TXT) · metadata
  `ListRow`s (Date, Type, Uploaded, Size) · description · "What Deborah can see" extracted
  fields (`placeholder` footnote) · primary "Discuss with Deborah", secondary "Download", overflow → Delete.
- **Upload sheet:** step progression inside one `Sheet` (no stacked sheets). Type step uses
  `OptionList` rows, not chips. Error is inline text under the file row with a "Choose another
  file" action — never a toast. Processing reuses `ProgressBar` + `ProgressStatus` (no shimmer/pulse).
- Motion: existing `Motion` adapter only. Text ≥ 7:1. Weights ≤ 500. Shadows only on Sheet.

---

## 5. Phases

Each phase ends with `npm run lint` + `npm run typecheck`, xref rows, and a scenario that
exercises it.

### Phase 0 — Spec & scaffolding (no UI)
- Write `docs/ux/F11-documents.md` from §1–4 (states, interactions, acceptance criteria, OPENs).
- Add rows to `docs/xref.md`, `docs/README.md` UX table, `docs/06-data-model.md`.
- Register M-11.1–11.3 in `registry.ts` pointing at `common/Planned`.
**Done when:** IDs navigable to Planned placeholders; docs reviewed.

### Phase 1 — Data, store, validation
- Types, `DocumentsSlice`, selectors, seed JSON, extractions, type config, `validateDocument`.
- Scenarios S26 / S26b; wire into `loadScenario` and State menu.
**Done when:** loading S26b populates store; validation covers pdf/jpg/png/txt, >20 MB, wrong type, 0 bytes.

### Phase 2 — Library (M-11.1) + entry points
- `patterns/health/DocumentRow`, `patterns/health/ReportRow` (or reuse `NoteRow` if it fits).
- Library screen: skeleton, tabs, empty states ("No documents yet" + Upload; "No saved reports
  yet — Visit Notes you save appear here"), profile switch filtering, back behaviour.
- Entry: Home reports row + Hub quick link → M-11.1.
**Done when:** both tabs render seed data per profile; empty states in S26.

### Phase 3 — Upload (M-11.3 / M-11.4)
- Extract AddLabs' `CameraView` into a shared mobile pattern `patterns/widgets/CaptureCamera`
  (AddLabs then imports it — no behaviour change there).
- Steps: method → type → details → validate → uploading (1–1.5 s) → reading (1.5–2.5 s) → result.
- Real `<input type=file accept=".pdf,.jpg,.jpeg,.png,.txt">`; only name/size/type read.
- Lab type: also creates a `LabReport` (via M-5.4 confirm path, O4).
- Not now → toast "Document saved", back to Library with new row highlighted at top.
- Dismiss mid-upload → Alert "Stop uploading?"; cancelled upload saves nothing.
**Done when:** every branch in §1-B reachable; errors for format/size/empty; camera path works.

### Phase 4 — Preview (M-11.2) + Deborah handoff
- Preview screen per format; Download toast; overflow Delete.
- Conversation: `startConversation({ attachment: documentId })` → user-side attachment bubble +
  Deborah reply from `scripts/document-review.json` (placeholder) per type; lab → existing
  lab-informed answer; prescription → medication guardrail.
- Sticky-note prompt: on next M-2.1 open with `pendingChatPromptId`, Deborah's first message
  offers the doc; Yes attaches, No clears; shown once.
**Done when:** Yes paths from preview and upload result land in chat with the doc attached;
safety behaviours unchanged (run S13 safety bench).

### Phase 5 — Saved Reports + Delete
- Saved Reports tab → M-9.6 with `briefNoteId` / note id; add "Download PDF" + Print.
- Delete: from preview overflow and row swipe/long-press menu (`Menu`); Alert copy O1/O2;
  soft delete; toast "Document deleted"; return to Library; deleted doc no longer offered to chat.
**Done when:** §1-C and §1-D complete; deleting an attached doc shows "Document removed" in old chat bubble.

### Phase 6 — Hardening & polish
- Edge cases (§6), a11y pass (focus order in sheet steps, labelled file input, alert focus trap),
  `design:accessibility-review` + Impeccable critique, contrast checks, 320 px width.
- Screen header blocks, `@xref`, xref statuses → built.

---

## 6. Edge cases checklist

- [ ] Wrong format (e.g. .heic, .docx) → "We accept PDF, JPG, PNG or TXT."
- [ ] Over 20 MB → "This file is {n} MB. The limit is 20 MB."
- [ ] 0-byte / unreadable file → generic retry message.
- [ ] Same file uploaded twice → allowed; title gets "(2)". OPEN: dedupe?
- [ ] Very long filename → middle-truncate in rows, full in preview.
- [ ] Document date in the future → inline error; date optional.
- [ ] Cancel camera / picker → back to method step, no state change.
- [ ] Close sheet during uploading/reading → confirm, discard.
- [ ] Switch profile while on Library → list refilters, tab kept.
- [ ] Family member with zero docs while self has many → empty state names the member.
- [ ] Delete last document → empty state.
- [ ] Delete a doc referenced in a past conversation → bubble shows "Document removed".
- [ ] Upload while on free limit → upload allowed; "Ask Deborah" Yes routes through existing FreeLimit (M-4.1).
- [ ] Prescription / medication extraction → medication guardrail, no dosing.
- [ ] Emergency keywords in a description → no effect (description is not sent as a message). OPEN.
- [ ] Offline / slow sim toggle (dev toggles) → longer processing, still completes.

---

## 7. Files touched (expected)

```
docs/ux/F11-documents.md, docs/xref.md, docs/README.md, docs/06-data-model.md
src/shared/types/domain.ts
src/shared/store/{types.ts, index.ts, selectors.ts, slices/documents.ts, loadScenario.ts}
src/shared/data/documents/{seed-documents,extractions,types}.json
src/shared/data/conversation/scripts/document-review.json
src/shared/utils/validateDocument.ts
src/shared/scenarios/S26*.json
src/apps/mobile/patterns/health/{DocumentRow,ReportRow}/
src/apps/mobile/patterns/widgets/CaptureCamera/   (extracted from AddLabs)
src/apps/mobile/screens/documents/{Library,DocumentPreview,UploadDocument}/
src/apps/mobile/navigation/registry.ts
src/apps/mobile/screens/consultation/{Home,Conversation}  (entry + attachment)
src/apps/mobile/screens/myhealth/MyHealthHub/parts/HubPopulated.tsx
src/apps/mobile/screens/records/PdfPreview  (Download label)
```
