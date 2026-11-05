# Super Admin user stories (client spec)

The client's Super Admin user stories (epics 1–12), condensed to what the prototype builds against: the requirement, the behaviour that matters, and the exact copy. Screen headers in `src/apps/admin/screens` link here with `@spec`. When the full story and this page disagree, the full story wins. Clinical text stays placeholder (CLAUDE.md §9).

## 1.1 - Sign In with 2FA
One Super Admin account, set up at launch. Email + masked password (show/hide), Sign In, Forget Password. One general error for wrong credentials. Lock after 3 failed attempts in a row. A 6-digit code is emailed at every sign-in: valid 10 minutes, single use, dead after 5 wrong tries, resend after 60 s. Signed out after 15 minutes idle. Every attempt is audit-logged.
Copy: "Email is required." · "Please enter a valid email address." · "Password is required." · "Incorrect email or password. Please try again." · "Please enter the verification code sent to your email." · "That code doesn't match. Please check your email and try again." · "This code has expired. Please request a new one." · "Your account has been temporarily locked after too many attempts. Please reset your password to continue." · "You've been signed out after 15 minutes of inactivity. Please sign in again."

## 1.2 - Forget Password
Same confirmation whether or not the email is registered. Link valid 60 minutes, single use. New password: 8+ characters, upper, lower, number, special; not the current one; strength indicator. Reset ends sessions, removes any lock, emails a confirmation, returns to Sign In.
Copy: "If an account exists for this email, we've sent a link to reset your password." · "Your password needs at least 8 characters, including an uppercase letter, a lowercase letter, a number and a special character." · "The passwords don't match." · "Please choose a password you haven't used before." · "Your password has been reset. Please sign in."

## 2.1 - Dashboard & Analytics
Global date range for every KPI and graph. Needs Attention strip (always "open now"): escalations not yet reviewed by level (no overdue count), open support requests by type, pending deletion requests with those near the deadline, content to review (Super Admin only). KPIs: Total Registered Clients, Active Clients, Total Conversations, Escalations (+ not yet reviewed), Teen Accounts (joined / invite sent / access paused), Active Subscribers (Individual / Family, Super Admin only), Free Trial (current + converted, Super Admin only). Graphs: Client Growth, Conversations Over Time, Top Health Topics (highest first), Escalation Status Breakdown, Teen Accounts Over Time, Subscribers Over Time (Super Admin only). Totals only, no personal or health information.
Copy: "There's no data for this date range." · "You're all caught up." · "We couldn't load the dashboard. Please try again."

## 3.1 - View Client (Listings & Details)
Listing: first name + email, state, account type (Adult / Teen), plan (Free trial / Individual / Family), status (Trial, Active, Payment issue, Cancelled, Consent revoked, Deactivated, Deletion requested), family members, sign-up and last active; newest first. Search by first name or email; filter by type, plan, status, state, sign-up date. Details: account, subscription (Super Admin only), consent versions, family members and invited teens, teen link, activity, actions (Change email address, Deactivate / Reactivate). Change email notifies both addresses, signs the Client out everywhere, clears trusted devices and resolves the Email Change Request.
Copy: "No clients match your search." · "Please enter a valid email address." · "An account with this email address already exists." · "[First name]'s email address has been changed."

## 3.2 - Deactivate / Reactivate Client
Reason required. Deactivating signs the Client out everywhere and keeps their data; a parent's invited teens are paused (the confirmation says how many). Reactivating restores access, and the teens' if the Family plan and consent are still active. Doesn't cancel the subscription.
Copy: "Deactivate [First name]'s account? They won't be able to sign in until it's reactivated. Their information will be kept." · "This will also pause access for [number] teen account(s) linked to this account." · "Please add a reason for deactivating this account." · "[First name]'s account has been deactivated." · "[First name]'s account has been reactivated."

## 4.1 - Manage Escalations
Recorded for review only: no follow-up, overdue flag, check-in or close/reopen. Levels Emergency, Crisis, Urgent; status Not yet reviewed / Reviewed (not yet reviewed first, newest first). Details: level and time, account and profile, the Oracle's summary, **only the triggering message**, what the Oracle showed, what the Client chose (or "No response"), teen parent-told time, review notes. Mark as reviewed records who and when; it can be undone.
Copy: "There are no escalations to review." · "This escalation has been marked as reviewed."

## 5.1 - Manage Support Requests
Types: Talk to Support Team, Consultation Request, Knowledge Gap, Email Change Request. Open first, oldest first. Details by type (gap question, new email with Change email address, consultation help), internal notes, resolve / reopen with who and when. Replies go by email outside the app; consultations are booked and paid outside the app.
Copy: "There are no support requests right now." · "This request has been marked as resolved." · "This request has been reopened." · "Your note has been saved."

## 5.2 - Manage Data Deletion Requests
Types: Account (everything / advocate only / transfer), Family Member, Teen. Source In app or By email. Status Pending review, In progress, On legal hold, Waiting for transfer, Completed. Deadline 10 business days, closest first, due within 2 business days highlighted. + Create deletion request only for a teen who can't sign in, from their registered email. Review checklist (identity, legal hold) gates Complete deletion. A parent's deletion never deletes invited teens' data.
Copy: "There are no deletion requests right now." · "Please select the teen's account." · "Please add the date the email was received." · "The deletion request has been created. It's due by [date]." · "Please complete the review checklist first." · "Permanently delete this data? This can't be undone." · "The deletion is complete, and [First name] has been emailed." · "This request is on legal hold. The Client has been told."

## 6.1 - View & Edit Knowledge Base Content
Content types: Book, Protocol, Blog post, Q&A answer, Symptom chart, Diagnostic tree, Case study, Knowledge gap answer. Status Draft, Pending approval, Published, Rejected, Archived; pending first. The Oracle only uses Published. Super Admin edits publish; Admin edits wait for approval; only the Super Admin approves or rejects. Archive, restore, roll back; never delete.
Copy: "No content matches your search." · "This content has been published. The Oracle will start using it shortly." · "Please add a reason for rejecting this content." · "Archive this content? The Oracle will stop using it, but you can restore it later." · "Publish version [X] instead of the current version?"

## 6.2 - Add New Content
Title, type and a file (PDF, Word or text) or text are required. Save as draft or Publish (Admins: sent for approval). Publishing an answer marks its gap Answered.
Copy: "Please add a title." · "Please choose a content type." · "Please upload a file, or add the text." · "This file type isn't supported. Please upload a PDF, Word or text file." · "This file is too large. Please upload a smaller file." · "Your draft has been saved." · "Your content has been published. The Oracle will start using it shortly." · "Your content has been sent to the Super Admin for approval."

## 6.3 - Get Alerted to Knowledge Gaps
Questions the Oracle couldn't answer, grouped with times asked; status New, Answered, Dismissed; new first, most asked first. Only the question shows. Add answer prefills the form; Dismiss needs a reason; dismissed gaps can be reopened.
Copy: "There are no knowledge gaps right now." · "Please add a reason for dismissing this gap." · "This gap has been dismissed." · "This gap has been reopened."

## 7.1 - View & Edit Admins
Super Admin only. First and last name, email, status (Invite pending, Active, Deactivated, Invite expired), date added, last active; newest first. Edit names (email locked). Deactivate with a reason; never delete. Resend or cancel a pending invite.
Copy: "No admins match your search." · "Please enter the admin's first and last name." · "Deactivate [First name]? They'll be signed out and won't be able to sign in until they're reactivated." · "Please add a reason for deactivating this admin." · "We've sent [First name] a new invite." · "The invite for [First name] has been cancelled."

## 7.2 - Add New Admin
First name, last name, email. One Admin role. Invite link valid 24 hours, single use. Admins can't manage admins, see subscriptions, or approve knowledge base content.
Copy: "Please enter a valid email address." · "An admin with this email address already exists." · "We've sent an invite to [email]. It's valid for 24 hours."

## 8.1 - View & Edit Subscription Plans
Super Admin only. Plans: Free trial (14 days), Individual, Family (3 members + paid add-ons). Edit price, features, trial length, family members and add-on price; price history. Price changes apply to new subscribers now and existing ones from their next billing date. Inactive, never deleted. No consultation or discount pricing.
Copy: "Please enter a valid price." · "Please enter a trial length in days, for example 14." · "Change the price to [price]? …" · "Make this plan inactive? New Clients won't be able to choose it. Clients already on it will keep it." · "Your changes have been saved."

## 8.2 - Add Subscription Plans and Pricing
Plan name, type (Individual or Family; never a second Free trial), monthly price, family fields, features one per line. Save as draft or Publish.
Copy: "Please enter a plan name." · "A plan with this name already exists." · "Please enter a valid monthly price." · "Please enter the family members included and the add-on price." · "Please add at least one feature." · "Publish [plan name]? It will be shown to Clients on the plan screen." · "[Plan name] is now available to Clients."

## 9.1 - View & Edit Policy Versions
Terms of Service, Privacy Policy, Health Consent. Live version, publish date, accepted / not yet, draft exists. Version history read only; published versions can't be edited.

## 9.2 - Add New Policy Version
+ New version prefilled with the live text, version number automatic, summary of changes required. Save as draft, Preview, Publish. Publishing emails every Client and asks them to accept before continuing.
Copy: "Please add the policy text." · "Please add a short summary of what's changed." · "Publish version [X] of the [Policy name]? Every Client will be asked to accept it before they can continue." · "Version [X] of the [Policy name] is now live. Clients have been emailed."

## 10.1 - View & Export Audit Logs
Entries: date and time, who and role (Client, Teen, Admin, Super Admin, System), action, what it affected, device or IP for sign-ins; newest first. Search by name or email; filter by date range, role and category. Export the filtered entries as CSV. No health information. Can't be edited or deleted; kept six years.
Copy: "No entries match your filters." · "Your audit log export has downloaded."

## 11.1 - Receive Notifications
Notification centre with unread count. Types: support requests, knowledge gaps, deletion requests and 2-business-day deadline reminders, content waiting for approval (Super Admin), policy updates, new admin set up (Super Admin). Escalations and Client exports are never notified. Email on/off per type; deadline reminders can't be turned off; in-app always on. Emails carry no names or health information.
Copy: "You're all caught up." · "Deletion deadline notifications can't be turned off." · "Your notification preferences have been updated."

## 12.1 - Manage My Profile
First and last name (editable), email (locked), role, last sign-in, two-step verification On, links to Reset Password and Notification Preferences, Sign Out with confirmation.
Copy: "Please enter your first and last name." · "Your profile has been updated." · "Are you sure you want to sign out?"

## 12.2 - Reset Password
Current, new and confirm (masked, show/hide). Same password rules as 1.2. Stays signed in on this device; other sessions end; confirmation email.
Copy: "This field is required." · "Your current password isn't right. Please try again." · "Your password has been changed."
