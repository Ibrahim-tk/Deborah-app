# Super Admin panel (A-*)

A desktop console for Deborah's team, at `/internal/admin` (prototype password `1234`, then any email, password and 6-digit code).
Source: the "Super Admin – Panel" FigJam board plus the client brief of 2026-11-02. Frontend only. Every "server" action is a short timer
(`hooks/useSim`) and writes an audit-log entry.

## Architecture

- `src/apps/admin` is a third app with the usual layers (`ui → patterns → screens`, `navigation`, `hooks`).
- **Built on MUI Base UI** (`@base-ui/react`, the unstyled library the web and mobile apps already use), skinned only with our
  tokens through CSS Modules. No CSS-in-JS. Base UI is imported only inside `admin/ui/` primitives (CLAUDE.md rule 7):

  | Primitive | Base UI part |
  |---|---|
  | Button, IconButton | `button` |
  | Input, TextArea | `field` (Label, Control, Description, Error) |
  | Select | `select` |
  | Segmented | `toggle-group` + `toggle` |
  | Toggle | `switch` |
  | Menu | `menu` |
  | Dialog | `dialog` (backdrop, focus trap, Esc and outside click) |
  | Tooltip | `tooltip` (labels on the collapsed sidebar) |
  | CodeInput | `otp-field` |

- Floating parts portal into an overlay host inside the admin root (`ui/Overlay`), so menus and dialogs keep our tokens.
- It is still **derived from web**: it loads the web stylesheet stack (tokens, DM Sans, Cormorant) and falls back to the web icon set.
  The lint boundary allows `admin-* → web-ui, web-patterns, web-styles` (the escalation drawer reuses the web chat `MessageBubble`) and nothing in reverse.
- Our own non-interactive primitives: `DataTable`, `KpiBand`, `LineChart`, `BarChart`, `DonutChart`, `StatusText`, `KeyValueList`, `Toast`, `Icon`.
- Data and state: `src/shared/admin` (types, JSON seeds in `data/`, `useAdminStore`). This store is separate from the client app store.
- Roles: `super` sees everything. `admin` (switch from the sidebar account menu: "Preview as admin") loses Subscriptions and Admin users, and plans are read-only.

## Design direction

- The cream canvas and Cormorant serif come from DESIGN.md. The sidebar sits on the signature plum so the console reads as its own place.
- Boldness goes in one place: the dashboard KPI band (large serif figures on one hairline band, live markers). Everything else stays quiet.
- No eyebrows or all-caps labels. No shadows except dialogs and menus.
- **Exception to CLAUDE.md §8 (designer request, 2026-11-02):** statuses (Emergency, Critical, Open, Resolved…) are soft round pills (`StatusText`): a light tint ground with tone ink and a small dot, no border. Admin panel only. The client apps still ban pills.
- One primary action per page, at the title's trailing edge. Layout uses logical properties, `minmax(0, 1fr)` tracks and container queries.

## Responsive behaviour
Sized against the admin stage, not the window: the root is a named container (`container: admin`) and AdminNavigator measures it.
- **Desktop (> 1024px):** unchanged.
- **Tablet (≤ 1024px):** the sidebar is the icon rail (tooltips for labels); tables pin their first column.
- **Phone (≤ 640px):** a sticky top bar (☰, section title, account initial → Settings) replaces the sidebar; ☰ opens the navigation
  in a left sheet (`ui/Sheet`). Pages use 16px gutters; header actions drop under the title; filter bars put search on its own row and
  filters two up. Tables keep their own sideways scroll with a pinned first column (the page never scrolls sideways). Drawers become
  full-screen; dialogs become bottom sheets with stacked buttons. Fields use 16px text (no iOS zoom); tap targets are 44px.
- Touch screens show hover-only controls (column ⋮, sort hints). Safe-area insets and reduced motion are respected.

## Screens

The client's user stories are condensed in [stories.md](stories.md); screen headers link to them with `@spec`, and where this page and the stories disagree, the stories win.

Every table row opens its record in a right-hand side drawer over the page (`navigation/drawers.tsx`); there are no detail
pages. One drawer shows at a time; switching sidebar sections closes it.

### A-1.1 Sign in · A-1.2 Forgot password · A-1.3 Two-step verification
Email and password, then a 6-digit code. Any values pass. Forgot password confirms with "Check your email".

### A-2.1 Dashboard
Date range (last 7, 30 or 90 days, or a custom from/to on a calendar). KPIs: registered users, active users (live), conversations (live),
open escalations. Charts: user growth (line, weekly or monthly), conversations over time (bars), top health topics (horizontal bars),
escalations by status (donut: Open, In review, Resolved, Emergency).

### A-3.1 Clients
Searchable, sortable table with subscription and account filters. Clicking a row opens A-3.2 in a side drawer over the list.

### A-3.2 Client detail (side drawer)
Opens from the Clients table, Escalation detail and Consent. No separate page. The header shows name, email, account and subscription
pills. Actions: Email client (compose dialog), Send reminder (in-app message: "Deborah's team is trying to get a hold of you"),
Deactivate / Reactivate (deactivating asks first). Sections: client information, health profile (placeholder clinical copy),
dependents (each profile in full, inline; this replaces the old A-3.3 page), documents and escalation history (a row opens A-4.2).
Esc, the close button or clicking outside closes it.

### A-4.1 Escalations
Queue of flagged conversations. Two types: **Emergency** and **Critical**. Filter by type and status, search by reason or client.
Emergencies sort first. Clicking a row opens A-4.2 in a side drawer.

### A-4.2 Escalation detail (side drawer)
Opens from the Escalations queue and from a client's escalation history. No separate page. The header shows the reason, when it was
opened (and closed), and type and status pills. Actions: Close case / Reopen case, Mark as in review (open cases), Email client.
Sections: summary, conversation excerpt, and the client (name and email open the client drawer, plus location, stage and concerns).

### A-5.1 Support requests
Requests are answered by email outside the system; the console tracks them. Types include "Escalate to Deborah" (the support person acting
as the client's advocate). Mark resolved. A second tab lists data deletion requests with their deadline.

### A-5.3 Support request (side drawer)
Subject, received date, open or resolved pill. Actions: Mark resolved, Reply by email. Shows the request type, a note that support
is answered by email, and the client (name opens the client drawer, email can be copied).

### A-5.2 Data deletion request (side drawer)
GDPR: within 1 month. CCPA/CPRA: within 45 days. Each dependent is either deleted with the account or transferred to a new owner by email
invite. **Approve and delete stays disabled until every transfer is accepted** ("Simulate acceptance" stands in for the new owner).
Approve asks first, then deletes and deactivates the account. Reject keeps the account.

### A-6.2 Admin user (side drawer)
Name, copyable email, account pill. Actions: Resend invite (until accepted), Deactivate / Reactivate (red, at the end). Shows role,
invitation status, invited or joined date and time left on a pending invite. Your own account is read only.

### A-6.1 Admin users (super admin only)
Invite by email with a role. Invites expire after **24 hours** (shown as "Expires in N h", then "Invite expired"). Resend invite,
Deactivate / Reactivate from the row menu. You can't act on your own account.

### A-7.1 Subscriptions (super admin only) · A-7.2 Plans
KPIs: active subscriptions, free users, paid share, monthly churn. Growth and churn (line), plan distribution (donut). Plans table with
price, free limit, subscribers and an active switch. Payments row shows the simulated Stripe connection with "Check connection".

### A-7.3 Plan editor (side drawer, super admin only)
Name, individual or family (profiles included), monthly price, free questions, feature switches, plan rules,
active. New plans start inactive.

### A-8.1 Audit log
One line per action, newest first. Search, filter by person, clear one entry, Clear all (asks first).

### A-7.4 Stripe integration (now on A-10.1 Integrations)
Follows the standard Stripe Connect pattern, simulated end to end (no API, no keys; the redirect and webhooks are timers and seed data).
- **Not connected** (the seed state): "Connect with Stripe" plus "How it works". A notice above Plans says payments are off.
- **Connect:** a hand-off dialog: "Taking you to Stripe…" → Stripe's authorise step (account, permissions, starts in test mode)
  → "Returning…" → connected. Plans get Stripe price IDs.
- **Connected:** Test/Live mode pill, account name, copyable `acct_…` ID, payouts, webhook status, last event. Actions: Open Stripe
  dashboard (a real link, new tab), Check connection, and a ⋮ menu: Switch to live/test mode (confirmed; live needs completed
  account details), View webhook events (A-7.5 drawer), Disconnect (red, confirmed). Super admin only; every step is audit-logged.
- **Plan drawer:** a Stripe section shows the plan's copyable price ID and "Synced", or how to connect.

### A-7.5 Stripe webhook events (side drawer)
Recent events (type, Succeeded/Failed, time, one-line summary), e.g. `invoice.paid`, `invoice.payment_failed`.

### A-8.2 Audit entry (side drawer)
The action, when, who (name, copyable email, role). Action: Clear entry.

### A-9.2 Consent version (side drawer)
Version name, uploaded at, uploaded by (copyable), current or previous pill. Action: Download PDF (simulated).

### A-9.1 Consent
Consent versions: version name, uploaded at, uploaded by (email). Upload a new version (name + PDF, read locally only). Withdrawn consent
lists clients who revoked consent; a row opens the client.

### A-9.3 Compliance (super admin only)
Reached from the Frameworks card at the end of Settings (A-11.1) › Compliance, not the sidebar. Breadcrumb: Settings › Compliance.
Client data rights (withdraw consent, with a link to A-9.1; right to delete with the dependent transfer rules and the GDPR 1 month /
CPRA 45 days deadlines, with a link to deletion requests) and one card per framework: GDPR (EU), HIPAA (US), CPRA (California),
PIPEDA + provincial (Canada), Privacy Act/APPs + NDB (Australia), SOC 2 (in progress). Each shows the deletion window, breach notice
and key obligations. Legal summaries are placeholder until reviewed (`data/compliance.json`).

### A-10.1 Integrations (super admin only)
Two parts. **Connected:** each connected service as a full-width card with all its details (Stripe: mode, account ID, payouts,
webhook, ⋮ menu; others: account, connected date, Disconnect). **Available:** one container holding a tile per service not yet
connected (real brand logo, one line, Connect button), with one column per tile: 1×4, then 1×3 and so on as services connect.
Stripe (A-7.4) moved here from Subscriptions. Connecting is simulated (the provider's sign-in is assumed).

### A-11.1 Settings (admin and super admin)
Opens from the sidebar (last item) or the account menu. One column of cards:
- **Profile:** edit your full name; email (copyable) and role are read only, changed by a super admin.
- **Password:** current, new and confirm, with live rules (12+ characters, a number, a symbol, upper and lower case). Changing it
  signs out your other sessions. Simulated; nothing is stored.
- **Sign-in security:** two-step verification is on and can't be turned off (required for admins); list of signed-in devices with
  "Sign out of other sessions".
State lives in `src/shared/admin/settings.ts` (`useAdminSettings`); every change is written to the audit log.

### A-12.1 Notifications (admin and super admin)
**Principle:** notify when someone needs to act or should know soon. Routine billing is rolled into a daily summary, never one
notification per subscription; repeats within an hour are grouped ("3 payments failed").

| Category | Who | Examples | Locked |
|---|---|---|---|
| Safety escalations | All | Emergency, critical, case reopened | Yes |
| Support requests | All | New request, "Escalate to Deborah" | |
| Data requests | All | Deletion received, due in 7 days, overdue, transfer accepted | |
| Client consent | All | Consent withdrawn | |
| Billing | Super admin | Failed payments (grouped), daily summary, Stripe disconnected/webhook failing | |
| Team | Super admin | Invite accepted or expired, admin deactivated | |
| Security | Super admin | New-device sign-in, repeated failed sign-ins | Yes |
| Compliance | Super admin | New consent version, framework review due | |

- **Bell** (`patterns/NotificationBell`): trailing in every page header (in the top bar on phone), with a red dot when anything is
  unread. Its panel shows the latest 8 (Today / Earlier), Mark all as read, View all. A row marks it read and opens
  the record's drawer or section.
- **Page** (route `notifications`, also in the account menu): All / Unread, category filter, grouped by Today / Yesterday /
  Earlier, a ⋮ menu per row (Open, Mark as read or unread), Mark all as read.
- **Settings › Notifications:** per category, In-app and Email switches, with "As it happens / Daily summary" for Support and
  Billing. Locked categories stay on. Plain admins only see their categories.
- **Simulated:** seed feed `data/notifications.json`; a support request arrives 40s after sign-in; reopening a case, an invite being
  accepted and disconnecting Stripe also post notifications. Store: `src/shared/admin/notifications.ts`.

### A-13.1 Knowledge Base · A-13.2 Content · A-13.4 Knowledge gap
Content tab (pending approval first, then newest; search titles and text; filters type, status) and Knowledge gaps tab (new first, most asked first; only the question shows). Add content: title, type, file or text, Save as draft / Publish (Admins: Send for approval). Content drawer: Approve & publish / Reject with a reason (Super Admin only), Edit (new version), Archive / Restore, Roll back. Gap drawer: Add answer (prefilled), Dismiss with a reason, Reopen. State in `src/shared/admin/knowledge.ts`.

## Alignment with the client stories (Nov 2026)
- Escalations: levels Emergency / Crisis / Urgent, status Not yet reviewed / Reviewed with review notes; the drawer shows only the triggering message; no contact actions and no escalation notifications.
- Support: Talk to Support Team, Consultation, Knowledge Gap, Email Change (with Change email address).
- Clients: first name, state, Adult / Teen, the full status list, consent versions, linked teens; Change email; Deactivate needs a reason and pauses linked teens.
- Deletion requests: 10-business-day deadline, create a request for a teen by email, review checklist, legal hold, transfers.
- Plans: Free trial (14 days), family members and add-on price, features, price history, draft / publish / inactive.
- Consent: three policies, versions, drafts, preview, acceptance counts. Audit log: role, category, device, CSV export, append-only.
- Sign-in: lock after 3 failed attempts, code expiry and 60 s resend, 15-minute idle sign-out (`?idle=<seconds>` shortens it). Password rules: 8+ characters.
- Notifications: email on/off per type in Settings › Notifications; deadline reminders locked.

## Open questions

- OPEN: Should deleting audit-log entries be allowed at all? It's on the board ("Clear log", "Clear all logs"), but compliance usually
  needs an immutable log.
- OPEN: Real-time numbers are simulated with a 4-second drift. Agree the refresh rate with the team.
- OPEN: Escalation status "Emergency/Critical" on the board's donut overlaps with type. The donut shows open emergencies as their own slice.
