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

## Screens

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
Name, individual or family (profiles included), monthly and yearly price, free questions, feature switches, plan rules,
active. New plans start inactive.

### A-8.1 Audit log
One line per action, newest first. Search, filter by person, clear one entry, Clear all (asks first).

### A-7.4 Stripe integration (Subscriptions → Payments)
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

## Open questions

- OPEN: Should deleting audit-log entries be allowed at all? It's on the board ("Clear log", "Clear all logs"), but compliance usually
  needs an immutable log.
- OPEN: Real-time numbers are simulated with a 4-second drift. Agree the refresh rate with the team.
- OPEN: Escalation status "Emergency/Critical" on the board's donut overlaps with type. The donut shows open emergencies as their own slice.
