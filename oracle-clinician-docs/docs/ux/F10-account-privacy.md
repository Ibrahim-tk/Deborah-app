# F10 — Account, privacy & data

**Goal:** plan, reminders, legal and data rights in one calm place.
**Figma:** https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-695

---

## M-10.1 · Account

**Presentation:** tab root (account). **Layout:** profile summary card (name, email or "No account yet — trial", plan name as plain text) · grouped `ListRow`s:
- **Subscription & billing** → M-10.3
- **Family profiles** → M-6.6
- **Notifications** → M-10.4
- **Privacy & data** → M-10.2
- **Terms & disclaimer** → M-10.5
- **About Deborah · Book a consultation** → M-7.6
- **Sign out** → SystemAlert "Sign out? Your data stays in your account." → resets to M-1.2 (prototype: loads S01-like state but keeps a "Sign in" path)
- Footer: app version, "Prototype — no real data".

Trial users see **Choose a plan** card at the top (→ M-4.2) instead of the plan name.

## M-10.2 · Privacy & data

**Layout:** **Download my data** (→ SystemAlert "We'll prepare your data and email you (demo)" → stores `dataExportRequestedAt`) · info card "How your data is used: never used for training without your consent" · **Delete a profile** (→ M-6.6) · **Delete my account and all data** (destructive).
**Delete account:** two-step: SystemAlert "Delete everything?" → typed confirmation sheet ("Type DELETE") → wipes store → M-1.1. SOW: deletion certified within 30 days (copy mentions it).

## M-10.3 · Subscription (NOT IN WIREFRAMES)

Current plan card (name, price, renews on {date}) · **Change plan** (→ M-4.2) · **Manage in App Store** (toast demo) · **Cancel subscription** (SystemAlert → plan remains until renewal date; plain text "Ends {date}").

## M-10.4 · Notifications (NOT IN WIREFRAMES)

Toggle **Check-in reminders** · interval Segmented (1 week · 2 weeks · 1 month) · toggle **Booking reminders** · note "Notifications never show health details on your lock screen." If system permission denied: banner "Notifications are off in Settings" + **Open Settings** (toast demo).

## M-10.5 · Terms & disclaimer (NOT IN WIREFRAMES)

Read-only document view: Terms & Disclaimer, Privacy notice, AI disclosure; footer "You accepted version {v} on {date}". Same component as the modal opened from M-1.3.
