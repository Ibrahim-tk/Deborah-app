# Copy audit by screen

**Date:** 2026-10-31  
**Purpose:** One readable view of shipped product copy, starting at intake, with mobile ↔ web parity notes.  
**Not included:** Design System / Widget Lab specimen copy, `screen-notes.json` (designer sticky notes), `versions/v1/`.  

## 1. Single source of truth — how copy is shared

Most clinical and conversational copy is **not duplicated** between mobile and web. Both apps import from `@shared/data` and `@shared/engine`.

| Source of truth | Used by | What it owns |
|----------------|---------|--------------|
| `src/shared/data/intake/healthBasics.json` | Mobile + Web HealthBasics / AddMember | Who-for, relationship, name, DOB, consent, sex, gender, pronouns, age×sex banks |
| `src/shared/data/conversation/**` | Both chat screens | Scripts, suggestions, guardrails, check-in, debrief, flows |
| `src/shared/data/commerce/plans.json` | Both ChoosePlan | Plan names, prices, feature bullets |
| `src/shared/data/commerce/products.json` | Both shop | Product names / blurbs |
| `src/shared/data/legal/*` | Both Legal / Consent / Teen invite | Terms, privacy, teen account privacy |
| `src/shared/data/health/healing-plan-document.json` | Both Wellness Plan | Plan document sections |
| `src/shared/data/persona/deborah.json` | Both | Oracle persona strings |
| Hardcoded in twin `.tsx` | Mobile `src/apps/mobile` ↔ Web `src/apps/web` | Chrome: titles, buttons, empty states, toasts — **mirrored by convention**, not imported |

**Parity rule (AGENTS.md):** UI copy fixes land in **both** apps. Shared JSON is already one file.

## 2. Mobile ↔ web parity snapshot

Automated string extract on twin screen files (rough; misses some dynamic strings):

| Result | Count |
|--------|------:|
| Twin screen files compared | 157 |
| No unique hardcoded diffs detected | 137 |
| Diffs flagged (mostly chrome / a11y / lab) | 20 |

**Material product-copy diffs (updated 2026-10-31):**

- **Records (M-9.1):** Web still has DerivedPage chrome (New / search) that mobile handles differently — platform shell, not product wording drift.
- **VisitBrief:** Mobile Share / Download vs web specialty chrome — platform capabilities.
- **CreateAccount CodeStep:** **Fixed** — both say “Checking your code”.
- **HomeSections (web):** “Recommended for you” section label is web-only layout chrome.
- **MedicalConsentSheet title:** **Fixed** — both “Can the Oracle use…”.
- **AI disclosure:** **Fixed** — full Change Requests line on mobile + web.
- **Deborah in UI:** **Fixed** per Change Requests (Oracle / Your Oracle; invite byline → Genesis Health Products). Code identifiers (`DeborahBlob`, folder names) remain.

Everything below that comes from **shared JSON** is identical on both platforms by definition.

## 3. Intake / onboarding profile (shared) — `healthBasics.json`

**Status:** `placeholder`  
**Author note:** Onboarding (M-1.8) is only the keys in onboardingKeys. Every other step is the optional Health Profile (M-2.14). Banks route on routeSex: the body answers (sexCharacteristics) when given, else sex assigned at birth. Under-13 Myself → M-1.10. Wording placeholder pending Deborah.

**Onboarding key order:** profileFor, relationship, memberName, birthDate, consent, sex, gender, pronouns

### 3.1 Steps (user-facing)

#### Step 1: `profileFor` (profileFor)

- **Title (self):** Who is this profile for?

#### Step 2: `relationship` (choice)

- **Title (self):** Who are they to you?
- **Describe label:** Relationship
- **Describe placeholder:** e.g. aunt, friend, cousin
- **Show if:** `{"profileFor": {"in": ["dependent"]}}`
- **Choices:** Parent; Child; Partner; Someone else

#### Step 3: `memberName` (name)

- **Title (self):** What’s their first name?
- **Placeholder:** First name
- **Show if:** `{"profileFor": {"in": ["dependent"]}}`

#### Step 4: `birthDate` (date)

- **Title (self):** When were you born?
- **Title (other):** When was {name} born?

#### Step 5: `consent` (consent)

- **Title (self):** Before we set up {name}’s profile
- **Show if:** `{"profileFor": {"in": ["dependent"]}}`
- **Body + checkbox options:** live in shared `legal/consent.json` → `profileConsent` (see §4). Sheet chrome is twin `ConsentSheet.tsx` (Continue). Same source on mobile and web.

#### Step 6: `sex` (choice)

- **Title (self):** What was your sex assigned at birth?
- **Title (other):** What was {name}’s sex assigned at birth?
- **Choices:** Male; Female; Intersex; Prefer not to say

#### Step 7: `gender` (choice)

- **Title (self):** How would you describe your gender?
- **Title (other):** How would you describe {name}’s gender?
- **Describe label:** Gender
- **Describe placeholder:** Write in how you describe your gender
- **Choices:** Man; Woman; Non-binary; Agender; Not listed; Prefer not to say

#### Step 8: `pronouns` (choice)

- **Title (self):** What are your preferred pronouns?
- **Title (other):** What are {name}’s preferred pronouns?
- **Describe label:** Pronouns
- **Describe placeholder:** e.g. xe/xem
- **Choices:** He/Him; She/Her; They/Them; Other

#### Step 9: `guardianNames` (text)

- **Title (self):** About Your Child
- **Title (other):** About Your Child
- **Prompt:** Who are the parents or guardians caring for your child?
- **Placeholder:** enter name
- **Show if:** `{"profileFor": {"in": ["dependent"]}, "age": {"max": 12}}`

#### Step 10: `childMedications` (text)

- **Title (self):** Are you currently taking any medications or supplements?
- **Title (other):** Is {name} currently taking any medications or supplements?
- **Show if:** `{"profileFor": {"in": ["dependent"]}, "age": {"max": 12}}`

#### Step 11: `allergies` (text)

- **Title (self):** Any medication allergies?
- **Title (other):** Any medication allergies for {name}?
- **Placeholder:** e.g. Penicillin
- **Show if:** `{"profileFor": {"in": ["dependent"]}, "age": {"max": 12}}`

#### Step 12: `sexVariation` (choice)

- **Title (self):** Were you born with a variation in your sex characteristics, such as your chromosomes, hormones, reproductive organs or genitals? This is sometimes called being intersex.
- **Title (other):** Was {name} born with a variation in their sex characteristics, such as chromosomes, hormones, reproductive organs or genitals? This is sometimes called being intersex.
- **Describe label:** Name of your variation, if you know it
- **Describe placeholder:** Name (optional)
- **Show if:** `{"age": {"min": 18}}`
- **Choices:** Yes; No; I don’t know; Prefer not to say

#### Step 13: `sexCharacteristics` (text)

- **Title (self):** Your body: which of these do you currently have?
- **Title (other):** {name}’s body: which of these do they currently have?
- **Show if:** `{"age": {"min": 18}}`

#### Step 14: `hormoneTherapy` (choice)

- **Title (self):** Do you take, or have you ever taken, sex hormones or hormone-blocking medicines, for any reason?
- **Title (other):** Does {name} take, or have they ever taken, sex hormones or hormone-blocking medicines, for any reason?
- **Show if:** `{"age": {"min": 18}}`
- **Choices:** Yes; No; I don’t know; Prefer not to say

#### Step 15: `hormoneTherapyNote` (text)

- **Title (self):** Which ones, and anything else you’d like to add?
- **Title (other):** Which ones, and anything else you’d like to add about {name}?
- **Placeholder:** Optional — e.g. which medicines, or which parts a provider advises
- **Show if:** `{"age": {"min": 18}, "hormoneTherapy": {"in": ["yes"]}}`

#### Step 16: `sexProcedures` (text)

- **Title (self):** Have you had any surgeries or procedures that changed your reproductive or sex-related anatomy, for any reason?
- **Title (other):** Has {name} had any surgeries or procedures that changed their reproductive or sex-related anatomy, for any reason?
- **Show if:** `{"age": {"min": 18}}`

#### Step 17: `sexProceduresNote` (text)

- **Title (self):** Anything you’d like to add about these?
- **Title (other):** Anything you’d like to add about {name}’s procedures?
- **Placeholder:** Optional
- **Show if:** `{"age": {"min": 18}, "sexProceduresAny": {"in": ["yes"]}}`

#### Step 18: `reproductive` (choice)

- **Title (self):** Where are you hormonally right now?
- **Title (other):** Where is {name} hormonally right now?
- **Show if:** `{"routeSex": {"in": ["female"]}, "age": {"min": 18, "max": 59}}`
- **Choices:** Menstruation; Pre-menopausal; Peri-menopausal; Post-menopausal; Surgically menopausal; Pregnant / Postpartum

#### Step 19: `reproductiveTeen` (choice)

- **Title (self):** Where are you hormonally right now?
- **Title (other):** Where is {name} hormonally right now?
- **Show if:** `{"routeSex": {"in": ["female"]}, "age": {"min": 13, "max": 17}}`
- **Choices:** Menstruation; Pre-menopausal; Peri-menopausal; Post-menopausal; Surgically menopausal; Pregnant / Postpartum

#### Step 20: `periodsStarted` (choice)

- **Title (self):** Have your periods started?
- **Title (other):** Have {name}’s periods started?
- **Describe label:** Describe
- **Describe placeholder:** describe your situation
- **Show if:** `{"routeSex": {"in": ["female"]}, "reproductiveStage": {"in": ["menstruation"]}, "age": {"min": 13, "max": 59}}`
- **Choices:** Yes; No; I’m not sure / I want to describe

#### Step 21: `pubertyBlockers` (choice)

- **Title (self):** Using any puberty blockers?
- **Title (other):** Using any puberty blockers for {name}?
- **Describe label:** Details
- **Describe placeholder:** details of puberty blocker
- **Show if:** `{"routeSex": {"in": ["female"]}, "age": {"min": 13, "max": 17}}`
- **Choices:** Yes; No

#### Step 22: `ageAtLastPeriod` (text)

- **Title (self):** Age at last period?
- **Title (other):** Age at {name}’s last period?
- **Placeholder:** Age
- **Show if:** `{"routeSex": {"in": ["female"]}, "reproductiveStage": {"in": ["post-menopausal"]}, "age": {"max": 59}}`

#### Step 23: `hysterectomy` (choice)

- **Title (self):** Have you had a hysterectomy?
- **Title (other):** Has {name} had a hysterectomy?
- **Show if:** `{"routeSex": {"in": ["female"]}, "reproductiveStage": {"in": ["surgically-menopausal"]}, "age": {"max": 59}}`
- **Choices:** Yes; No

#### Step 24: `ovariesRemoved` (choice)

- **Title (self):** Have you had your ovaries removed?
- **Title (other):** Has {name} had their ovaries removed?
- **Show if:** `{"routeSex": {"in": ["female"]}, "reproductiveStage": {"in": ["surgically-menopausal"]}, "age": {"max": 59}}`
- **Choices:** Yes; No; Partial

#### Step 25: `hrtStatus` (choice)

- **Title (self):** Are you currently on hormone replacement therapy (HRT)?
- **Title (other):** Is {name} currently on hormone replacement therapy (HRT)?
- **Show if:** `{"routeSex": {"in": ["female"]}, "reproductiveStage": {"in": ["peri-menopausal", "post-menopausal", "surgically-menopausal"]}, "age": {"max": 59}, "hormoneTherapy": {"notIn": ["no"]}}`
- **Choices:** Yes; Yes, Previously; No

#### Step 26: `hrtType` (choice)

- **Title (self):** Please specify
- **Title (other):** Please specify
- **Show if:** `{"hrtStatus": {"in": ["yes", "yes-previously"]}}`
- **Choices:** Estrogen only; Combined; Progesterone only; Other / not sure

#### Step 27: `otherPuberty` (choice)

- **Title (self):** How has your body gone through any puberty?
- **Title (other):** How has {name}’s body gone through any puberty?
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "age": {"min": 13, "max": 59}}`
- **Choices:** Yes; No; Currently going through

#### Step 28: `reproductive` (choice)

- **Title (self):** Where are you hormonally right now?
- **Title (other):** Where is {name} hormonally right now?
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "age": {"min": 18, "max": 59}}`
- **Choices:** Menstruation; Pre-menopausal; Peri-menopausal; Post-menopausal; Surgically menopausal; Pregnant / Postpartum

#### Step 29: `reproductiveTeen` (choice)

- **Title (self):** Where are you hormonally right now?
- **Title (other):** Where is {name} hormonally right now?
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "age": {"min": 13, "max": 17}}`
- **Choices:** Menstruation; Pre-menopausal; Peri-menopausal; Post-menopausal; Surgically menopausal; Pregnant / Postpartum

#### Step 30: `periodsStarted` (choice)

- **Title (self):** Have your periods started?
- **Title (other):** Have {name}’s periods started?
- **Describe label:** Describe
- **Describe placeholder:** describe your situation
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "reproductiveStage": {"in": ["menstruation"]}, "age": {"min": 13, "max": 59}}`
- **Choices:** Yes; No; I’m not sure / I want to describe

#### Step 31: `ageAtLastPeriod` (text)

- **Title (self):** Age at last period?
- **Title (other):** Age at {name}’s last period?
- **Placeholder:** Age
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "reproductiveStage": {"in": ["post-menopausal"]}, "age": {"max": 59}}`

#### Step 32: `hysterectomy` (choice)

- **Title (self):** Have you had a hysterectomy?
- **Title (other):** Has {name} had a hysterectomy?
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "reproductiveStage": {"in": ["surgically-menopausal"]}, "age": {"max": 59}}`
- **Choices:** Yes; No

#### Step 33: `ovariesRemoved` (choice)

- **Title (self):** Have you had your ovaries removed?
- **Title (other):** Has {name} had their ovaries removed?
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "reproductiveStage": {"in": ["surgically-menopausal"]}, "age": {"max": 59}}`
- **Choices:** Yes; No; Partial

#### Step 34: `hrtStatus` (choice)

- **Title (self):** Are you currently on hormone replacement therapy (HRT)?
- **Title (other):** Is {name} currently on hormone replacement therapy (HRT)?
- **Show if:** `{"routeSex": {"in": ["trans-man", "trans-woman", "prefer-not", "intersex"]}, "reproductiveStage": {"in": ["peri-menopausal", "post-menopausal", "surgically-menopausal"]}, "age": {"max": 59}, "hormoneTherapy": {"notIn": ["no"]}}`
- **Choices:** Yes; Yes, Previously; No

#### Step 35: `pubertyStart` (text)

- **Title (self):** When did you start puberty?
- **Title (other):** When did {name} start puberty?
- **Show if:** `{"routeSex": {"in": ["male"]}, "age": {"min": 13, "max": 17}}`

#### Step 36: `pubertyNotes` (text)

- **Title (self):** Add additional details
- **Title (other):** Add additional details about {name}’s puberty
- **Placeholder:** Optional
- **Show if:** `{"routeSex": {"in": ["male"]}, "age": {"min": 13, "max": 17}}`

#### Step 37: `pubertyAge` (text)

- **Title (self):** At what age did you start puberty?
- **Title (other):** At what age did {name} start puberty?
- **Show if:** `{"routeSex": {"in": ["male"]}, "age": {"min": 18, "max": 59}}`

#### Step 38: `fertilityConcerns` (choice)

- **Title (self):** Fertility or Reproductive Concerns?
- **Title (other):** Fertility or Reproductive Concerns for {name}?
- **Show if:** `{"routeSex": {"in": ["male"]}, "age": {"min": 18, "max": 59}}`
- **Choices:** Yes; No

#### Step 39: `medications` (text)

- **Title (self):** Are you currently taking any medications (Rx or OTC)?
- **Title (other):** Is {name} currently taking any medications (Rx or OTC)?
- **Show if:** `{"age": {"min": 13}}`

#### Step 40: `supplements` (text)

- **Title (self):** Are you currently taking any supplements?
- **Title (other):** Is {name} currently taking any supplements?
- **Show if:** `{"age": {"min": 13}}`

#### Step 41: `genesisGold` (choice)

- **Title (self):** Are you taking Genesis Gold?
- **Title (other):** Is {name} taking Genesis Gold?
- **Show if:** `{"age": {"min": 13}}`
- **Choices:** Yes; No

## 4. Related shared intake & product JSON

### Hypothalamus symptom check — `intake/symptoms.json`

**Status:** `placeholder`

- **note:** Hypothalamus Symptom Check list for the composer SymptomPicker (M-2.1, M-2.12). From YOC App developer PDF. `id` links a group to chatIntake journey groups when present. Needs the Oracle's review.
- **title:** Energy & sleep
- **title:** Temperature & sweat
- **title:** Mood & mind
- **title:** Weight & appetite
- **title:** Body & pain
- **title:** Cardiovascular
- **title:** Digestion
- **title:** Hormonal / reproductive

### Medicines picker — `intake/medicines.json`

**Status:** `placeholder`

- **note:** Prototype seed list for medications (Rx or OTC) Name autocomplete. Not a formulary.

### Chat starter chips — `conversation/suggestions.json`

**Status:** `placeholder`

- **text:** I can't sleep through the night
- **text:** Gas and bloating after meals
- **text:** PMS is getting worse — would Gen-Pro help?
- **text:** Still bloated after my provider visit
- **text:** Frustrated getting help for my child
- **text:** My daughter's doctor only offers hysterectomy
- **text:** I twisted my ankle hiking
- **text:** Why is {name} so exhausted all the time?
- **text:** {They} can't sleep — what's going on?
- **text:** Are {their} hormones out of balance?
- **text:** Hot flashes, night sweats — is this menopause for {them}?
- **text:** {They} {are} gaining weight and nothing is working
- **text:** {Their} labs look normal but {they} {feel} terrible
- **text:** Are irregular periods normal at {their} age?
- **text:** {Their} periods are very painful — what should we ask?
- **text:** {They} {are} tired all the time. Could it be {their} cycle?
- **note:** Tone Guide dummy chats (2026-10-22): newSignup = 3 chips when authFlow is signup; returning = 4 chips when authFlow is login. default mirrors newSignup for lab/specimen imports. family/teen use {name} {they} {them} {their} {are} {feel} tokens.

### Safety / emergency / crisis — `conversation/guardrails.json`

- **title:** This could be an emergency.
- **body:** Please call 911 now or go to the nearest emergency room. Don't wait.
- **acknowledgedReply:** Thank you for letting me know. What would you like to talk about?
- **body:** You're not alone. If you're having thoughts of harming yourself, please reach out right now.
- **label:** Call or text 988
- **gentleReply:** Thank you for telling me. I'm here with you, and we can take this slowly. What's on your mind?
- **body:** I can't prescribe or tell you to start or stop a medication. Please check with your prescriber or pharmacist first.
- **label:** Check interactions on drugs.com
- **body:** That's outside what I can help with — I focus on hormonal and whole-body health from my clinical work. Your provider is the right person for this.
- **body:** This sits outside the health education I can offer. I can send a short summary to the support team so they can follow up (usually within one business day), or you can book time with her.
- **body:** It sounds like your situation deserves a personal look. I'd like you to talk with me directly.
- **emergency:** I have chest pain and my left arm feels numb.
- **medication:** Should I stop taking my levothyroxine?
- **crisis:** Some days I don't see the point anymore.
- **outOfScope:** Can you look at my MRI results?
- **escalation:** I've tried everything and nothing is working.
- **uncovered:** I need advice about my cataract surgery recovery.
- **body:** I'm Oracle, an AI system. I'm not a person, nurse or doctor, and I can't diagnose, treat or prescribe.
- **body:** Your past conversations and saved notes are in Records — open My Health, then Records. Your Wellness Plan is on Home and in My Health. Settings, notifications and your subscription are in the menu under Settings.

### Health consent / terms snippets — `legal/consent.json`

**Status:** `placeholder`

- **aiDisclosure:** You're chatting with Oracle, an AI system, not a human or a licensed clinician. Oracle can't diagnose, treat or prescribe.
- **careLine:** Health education only. Not medical advice. Not a substitute for your provider. In an emergency, call 911. If you're thinking about harming yourself, call or text 988.
- **aiDisclosureShort:** Prepared with Your Oracle, an AI health education tool. Oracle is not a person or a licensed clinician.
- **title:** Terms & Disclaimer
- **body:** Your Oracle provides general health education. It is not medical advice, diagnosis or treatment.
- **body:** Always talk with a qualified provider before making decisions about your health, medications or treatment. Never ignore professional advice or delay seeking it because of something you read here.
- **body:** If you think you may have a medical emergency, call 911 or go to the nearest emergency room immediately.
- **body:** Placeholder text — attorney-drafted terms will replace this before launch.
- **title:** How your health data is protected
- **body:** We treat everything you share as protected health information under HIPAA, CCPA and CMIA.
- **body:** Your conversations are never used to train AI models without your explicit consent.
- **body:** Notifications on your lock screen never show symptoms, conditions or product names.
- **body:** You can download or delete your data at any time from Account › Privacy & data.
- **body:** Placeholder text — the final privacy notice will replace this before launch.
- **open:** Medical-advocate consent wording pending legal review. Shared by onboarding (M-1.8) and Add family member (M-6.2).
- **title:** Before we set up {name}’s profile
- **body:** As {name}’s medical advocate, you’ll manage their profile and talk with the Oracle on their behalf. We just need to confirm you have their permission or the authority to do this.
- **label:** {name} knows I’m adding them and has agreed for me to be their medical advocate
- **label:** I’m {name}’s parent or legal guardian
- **label:** {name} can’t make this decision themselves, and I’m authorised to act for them (for example, as their healthcare proxy or power of attorney)
- **open:** Blocked: attorney-approved health-consent wording is not in the repo. Terms and Privacy on Welcome stay. Do not add a second checkbox until this copy is supplied.

### Teen invite privacy + errors — `legal/teenAccount.json`

**Status:** `placeholder`

- **upgradeTitle:** Inviting your teen to their own account is part of the Family plan.
- **upgradeBody:** Upgrade to invite your teen.
- **email:** Please enter a valid email address for your teen.
- **required:** Please complete this field.
- **title:** Teen account privacy
- **body:** By continuing, you understand that your teen will receive their own private Your Oracle account. You will not be able to view their conversations, health information, or activity within their account.
- **body:** Your authorization will allow them to use the account while they are below the applicable legal age of majority. Once they reach that age, they will be able to manage their account independently.
- **cta:** I understand & continue
- **title:** Invite your teen
- **intro:** Enter your teen’s email address. We’ll send them an invitation to create their own Oracle account linked to your Family Plan.
- **after:** Your teen will complete their own account setup and access Oracle using their own login.
- **cta:** Send invitation
- **title:** Invitation sent
- **body:** We’ve emailed {email} with instructions to create their Oracle account.
- **subject:** You’ve been invited to join Your Oracle
- **body:** You’ve been invited to create your own Your Oracle account as part of a Family Plan.
- **body:** Set up your account to start using Oracle.
- **cta:** Finish Sign Up
- **title:** Create your teen account
- **lede:** Your parent or guardian invited you ({email}) to your own private Your Oracle account. Let’s set it up.
- **title:** Your Oracle for teens
- **body:** Your account gives you access to health education through Oracle. Some features available to adults, such as product recommendations and Your Wellness Plan, are not available on teen accounts.
- **cta:** Continue

### Disclaimers — `legal/disclaimer.json`

**Status:** `placeholder`

- **short:** Education only — not a diagnosis. Bring this to your provider.

### Subscription plans — `commerce/plans.json`

- **name:** Individual
- **features:** Myself only
- **features:** Conversations, Your Wellness Plan and provider-ready notes
- **features:** Renews monthly, cancel anytime online
- **name:** Family
- **features:** Myself plus up to 3 dependents
- **features:** Manage each member’s history as their advocate
- **features:** Invite teens to their own private account

### Oracle persona — `persona/deborah.json`

**Status:** `placeholder`

- **name:** Oracle
- **tagline:** Your trusted guide through every step of your healthcare journey
- **byline:** by Genesis Health Products
- **shortBio:** Your Oracle is an AI health education guide by Genesis Health Products.
- **welcomeNote:** Your trusted guide through every step of your healthcare journey. I help you understand what your body is telling you.
- **portrait:** /images/deborah/portrait-placeholder.svg
- **openingQuestion:** What's on your mind today?
- **welcomeBack:** Welcome back, {name}. Last time we talked about {topic}.
- **answerLead:** Let me look at this through my framework…
- **greetingOther:** Tell me how’s {name} feeling today?
- **welcomeBackOther:** Last time we talked about {topic}.
- **credentialsLine:** by Genesis Health Products
- **title:** The Hypothalamus Handbook
- **note:** Her guide to the gland that conducts your hormones.

## 5. Screen chrome (hardcoded) — intake → main flows

These strings live in twin `.tsx` files. **Same on both** = shared wording; **Mobile only** / **Web only** = parity gap.

### F01 Onboarding

#### M-1.1 Splash

- **File:** `src/apps/mobile/screens/onboarding/Splash/Splash.tsx`
- **Web twin:** present
- _(no extractable chrome strings)_

#### M-1.2 Welcome

- **File:** `src/apps/mobile/screens/onboarding/Welcome/Welcome.tsx`
- **Web twin:** present
- **Same on both:**
  - What should we call you?
  - First name
  - Privacy Notice
  - Get Started
  - Sign in

#### M-1.3 Consent

- **File:** `src/apps/mobile/screens/onboarding/Consent/Consent.tsx`
- **Web twin:** present
- **Same on both:**
  - Before we begin
  - How your health data is protected
  - HIPAA / CCPA
  - I agree, let’s start

#### M-1.4 Create profile

- **File:** `src/apps/mobile/screens/onboarding/CreateProfile/CreateProfile.tsx`
- **Web twin:** present
- **Same on both:**
  - Email
  - Your email
  - Password
  - Confirm password
  - Confirm your password
  - Forgot password?
- **Mobile only (or web missing):**
  - Enter your password
- **Web only:**
  - Continue

#### M-1.5 Legal sheet

- **File:** `src/apps/mobile/screens/onboarding/LegalSheet/LegalSheet.tsx`
- **Web twin:** present
- **Same on both:**
  - Done

#### M-1.8 Health basics

- **File:** `src/apps/mobile/screens/onboarding/HealthBasics/HealthBasics.tsx`
- **Web twin:** present
- **Same on both:**
  - Onboarding profile
  - Skip
- **Mobile only (or web missing):**
  - Continue
- **Web only:**
  - Back
  - Next

#### M-1.8 Consent sheet part

- **File:** `src/apps/mobile/screens/onboarding/HealthBasics/parts/ConsentSheet.tsx`
- **Web twin:** present
- **Same on both:**
  - Confirm your authority
  - Continue

#### M-1.9 Deborah welcome

- **File:** `src/apps/mobile/screens/onboarding/DeborahWelcome/DeborahWelcome.tsx`
- **Web twin:** present
- **Same on both:**
  - Thank you${you ?
  - The Oracle

#### M-1.10 Ask parent

- **File:** `src/apps/mobile/screens/onboarding/AskParent/AskParent.tsx`
- **Web twin:** present
- **Same on both:**
  - Back to the start
  - This profile needs a guardian

#### M-1.12 Teen invite

- **File:** `src/apps/mobile/screens/onboarding/TeenInvite/TeenInvite.tsx`
- **Web twin:** present
- _(no extractable chrome strings)_

#### M-1.13 Age sheet

- **File:** `src/apps/mobile/screens/onboarding/AgeSheet/AgeSheet.tsx`
- **Web twin:** missing / not built
- **Mobile only (or web missing):**
  - Nice to meet you${first ?
  - When were you born? Your age shapes what Oracle can offer you.
  - Date of birth
  - Continue

### F02 Consultation / chat

#### M-2.0 Home

- **File:** `src/apps/mobile/screens/consultation/Home/Home.tsx`
- **Web twin:** present
- **Same on both:**
  - Tell the Oracle how you’re feeling…
  - My Health
  - Add Family Member
  - How did your visit go?
  - Check in with the Oracle
  - Add your current medications
  - Share your recent lab values
  - Add ${x.label.charAt(0).toLowerCase()}${x.label.slice(1)}
  - Log a provider visit

#### M-2.0 StateNew

- **File:** `src/apps/mobile/screens/consultation/Home/parts/StateNew.tsx`
- **Web twin:** present
- **Same on both:**
  - Continue your conversation
  - New
  - Start with the Oracle

#### M-2.0 StateReturning

- **File:** `src/apps/mobile/screens/consultation/Home/parts/StateReturning.tsx`
- **Web twin:** present
- **Same on both:**
  - Continue your conversation

#### M-2.0 HomeSections

- **File:** `src/apps/mobile/screens/consultation/Home/parts/HomeSections.tsx`
- **Web twin:** present
- **Same on both:**
  - Manage your health details
  - My Notes
  - My Health
  - My Family
- **Web only:**
  - Recommended for you
  - Shop

#### M-2.0 GreetingSheet

- **File:** `src/apps/mobile/screens/consultation/Home/parts/GreetingSheet.tsx`
- **Web twin:** present
- **Same on both:**
  - The Oracle says hello
  - The Oracle
  - Start a conversation

#### M-2.1 Conversation

- **File:** `src/apps/mobile/screens/consultation/Conversation/Conversation.tsx`
- **Web twin:** present
- **Same on both:**
  - Summary sent to the support team (demo)
  - Copy
  - Save to Visit Notes
- **Web only:**
  - Visit notes preview

#### M-2.12 FirstConsult

- **File:** `src/apps/mobile/screens/consultation/FirstConsult/FirstConsult.tsx`
- **Web twin:** present
- **Same on both:**
  - The Oracle
  - The Oracle is writing…
  - Or tell me in your own words…
  - No active profile
  - Request sent. Watch your email.
  - Holding ${value.slice(5)} with the Oracle
  - Saved to My Visit Notes

#### M-2.14 CompleteIntake

- **File:** `src/apps/mobile/screens/consultation/CompleteIntake/CompleteIntake.tsx`
- **Web twin:** present
- **Same on both:**
  - Health profile
  - Skip
- **Mobile only (or web missing):**
  - Save and close
- **Web only:**
  - Back
  - Done

#### MedicalConsentSheet

- **File:** `src/apps/mobile/patterns/widgets/MedicalConsentSheet/MedicalConsentSheet.tsx`
- **Web twin:** present
- **Same on both:**
  - I’ve read and agree to the Health Consent
  - Agree and continue
- **Mobile only (or web missing):**
  - To answer your questions, the Oracle uses what you share about your health:
- **Web only:**
  - To answer your questions, the Oracle uses what you share about your health,

### F04 Plans

#### M-4.1 FreeLimit

- **File:** `src/apps/mobile/screens/plans/FreeLimit/FreeLimit.tsx`
- **Web twin:** present
- **Same on both:**
  - The Oracle
  - Your Wellness Plan unlocks with a subscription
  - Your free trial includes conversations. Choose a plan to unlock Your Wellness Plan.
  - Downloads unlock with a subscription
  - Your free trial includes conversations. Choose a plan to download provider-ready notes.
  - Family profiles unlock with a subscription
  - Your free trial includes conversations. Choose the Family plan to add up to 3 family members.
  - Your ${TRIAL_DAYS}-day free trial has ended
  - Your conversations are saved. Choose a plan to keep talking with Oracle.
  - See plans
  - Maybe later

#### M-4.2 ChoosePlan

- **File:** `src/apps/mobile/screens/plans/ChoosePlan/ChoosePlan.tsx`
- **Web twin:** present
- **Same on both:**
  - Plans
  - No purchases to restore (demo)
  - Choose your plan
  - Renews monthly. Cancel anytime online.
  - Family lets you manage up to 3 family members as their medical advocate.
  - Restore purchase
  - Terms
  - Privacy
- **Web only:**
  - Back
  - You’re all set.
  - Continue to dashboard

#### M-4.3 CreateAccount

- **File:** `src/apps/mobile/screens/plans/CreateAccount/CreateAccount.tsx`
- **Web twin:** present
- **Same on both:**
  - Email
  - ${handle}@example.com
  - Set a password
  - Welcome back, ${useAppStore.getState().userName}
  - Your profile is saved
  - Continue with email
  - Don’t have an account?
  - Sign up
  - Already have an account?
  - Sign in
  - Why do I need an account?
  - Your history syncs across your devices.
  - Everything is stored securely and encrypted.
  - Continue
  - Done
- **Mobile only (or web missing):**
  - Close
  - Back
- **Web only:**
  - I agree to the terms of use and Privacy Notice, and to the Oracle’s care disclaimer.

#### M-4.4 StorePayment

- **File:** `src/apps/mobile/screens/plans/StorePayment/StorePayment.tsx`
- **Web twin:** present
- **Same on both:**
  - Processing
  - App Store
  - Cancel
  - Price
  - Account
  - Renews automatically until cancelled. Cancel anytime in Settings at least a day before each renewal.
  - Done

#### M-4.5 PlanSuccess

- **File:** `src/apps/mobile/screens/plans/PlanSuccess/PlanSuccess.tsx`
- **Web twin:** present
- **Same on both:**
  - You are all set.
  - Add a family member
  - Continue my conversation

### F06 Family

#### M-6.1 ProfileSwitcher

- **File:** `src/apps/mobile/screens/profiles/ProfileSwitcher/ProfileSwitcher.tsx`
- **Web twin:** present
- **Same on both:**
  - Who is this for?
  - Now asking for ${useAppStore.getState().profiles.byId[id]?.name ??
  - Manage profiles

#### M-6.2 AddMember

- **File:** `src/apps/mobile/screens/profiles/AddMember/AddMember.tsx`
- **Web twin:** present
- **Same on both:**
  - Add family member
  - Now asking for ${answers.memberName?.trim()}
  - Discard this profile?
  - Keep editing
  - Discard
  - Create profile
  - Profiles for children under 13 are for parents and guardians only. You’ll ask questions on their behalf.
  - You’ll manage this profile as their medical advocate. Their history stays on this profile — separate from yours.

#### M-6.3 UpgradeFamily

- **File:** `src/apps/mobile/screens/profiles/UpgradeFamily/UpgradeFamily.tsx`
- **Web twin:** present
- **Same on both:**
  - Upgrade to Family
  - Not now

#### M-6.5 ProfileDetails

- **File:** `src/apps/mobile/screens/profiles/ProfileDetails/ProfileDetails.tsx`
- **Web twin:** present
- **Same on both:**
  - Conversations
  - Visit Notes
  - Profile updated
  - ${profile.name}’s profile was deleted
  - Delete ${profile.name}’s profile?
  - Cancel
  - Delete
  - History
  - Delete this profile and its data
- **Mobile only (or web missing):**
  - Cancel editing
  - Save changes
  - Edit

#### M-6.6 ManageProfiles

- **File:** `src/apps/mobile/screens/profiles/ManageProfiles/ManageProfiles.tsx`
- **Web twin:** present
- **Same on both:**
  - Family profiles
  - Family plan
  - Add a family member
  - Invite your teen to their own account
- **Web only:**
  - Loading…

#### M-6.7 InviteTeen

- **File:** `src/apps/mobile/screens/profiles/InviteTeen/InviteTeen.tsx`
- **Web twin:** present
- **Same on both:**
  - Teen’s email address
  - name@example.com
  - Done

### F07 My Health

#### M-7.2 MyHealthHub

- **File:** `src/apps/mobile/screens/myhealth/MyHealthHub/MyHealthHub.tsx`
- **Web twin:** present
- **Same on both:**
  - My Health

#### M-7.3 Wellness Plan

- **File:** `src/apps/mobile/screens/myhealth/NinetyDayPlan/NinetyDayPlan.tsx`
- **Web twin:** present
- **Same on both:**
  - This concern is resolved?
  - Not yet
  - It’s resolved
  - Drug interaction checker

#### M-7.5 Library

- **File:** `src/apps/mobile/screens/myhealth/Library/Library.tsx`
- **Web twin:** present
- **Same on both:**
  - The Oracle’s library
  - Show
  - Library items
  - Nothing found.
  - Join the community (Facebook group)
  - About the Oracle
  - Opening Facebook (demo)
  - For you
  - All
  - New
  - Leave the app to open Facebook?
  - Cancel
  - Open
- **Mobile only (or web missing):**
  - Search the Oracle’s library
  - Sleep, hot flashes, cycles…

#### M-7.6 AboutDeborah

- **File:** `src/apps/mobile/screens/myhealth/AboutDeborah/AboutDeborah.tsx`
- **Web twin:** present
- **Same on both:**
  - About the Oracle
  - Oracle
  - Who makes Oracle

### F09 Visit notes / records

#### M-9.1 Records

- **File:** `src/apps/mobile/screens/records/Records/Records.tsx`
- **Web twin:** present
- **Same on both:**
  - My Visit Notes
- **Mobile only (or web missing):**
  - Search records
  - Record type
  - Loading records
  - Visit Notes
- **Web only:**
  - Visit notes preview
  - New note
  - A note for myself
  - Log a provider visit
  - Loading…
  - New

#### M-9.7 VisitBrief

- **File:** `src/apps/mobile/screens/records/VisitBrief/VisitBrief.tsx`
- **Web twin:** present
- **Same on both:**
  - For my provider
  - Your appointment
  - Provider’s name
  - e.g. Dr. Patel
  - Appointment date
  - Saved to My Visit Notes
  - Done
- **Mobile only (or web missing):**
  - Share
  - Download PDF
  - Sharing isn’t available in this browser
  - Notes for my provider from Your Oracle
- **Web only:**
  - Specialty
  - Choose…

#### M-9.8 LogVisit

- **File:** `src/apps/mobile/screens/records/LogVisit/LogVisit.tsx`
- **Web twin:** present
- **Same on both:**
  - More
  - Your notes before the visit
  - My Visit Notes for your provider
  - Copied — ready to share
  - Couldn’t copy
  - Deleted
  - Add the kind of provider
  - OK
  - Save this visit?
  - Discard
  - Save
  - Delete this visit?
  - Cancel
  - Delete
  - Edit
  - Share
  - Done
  - Not now
  - Kind of provider is required. Everything else you can fill in as you remember it.

### F10 Account

#### M-10.1 Account

- **File:** `src/apps/mobile/screens/account/Account/Account.tsx`
- **Web twin:** present
- **Same on both:**
  - Settings
  - Sign out
  - Sign out?
  - Cancel
  - Account
  - Name
  - Email
  - Change password
  - Subscription
  - Family profiles
  - Preferences
  - Notifications
  - Privacy & legal
  - Privacy & data
  - Terms & disclaimer
  - Support
  - About the Oracle
  - Book a consultation
  - Choose a plan
  - Unlimited conversations for you and your family.

#### M-10.2 PrivacyData

- **File:** `src/apps/mobile/screens/account/PrivacyData/PrivacyData.tsx`
- **Web twin:** present
- **Same on both:**
  - Privacy & data
  - Download my data
  - Delete a profile
  - In Family profiles
  - Health data consent
  - Consent revoked
  - Cancel
  - Request
  - Delete everything?
  - Continue
  - Your health information is never used for training without your consent.
- **Mobile only (or web missing):**
  - How your data is used
  - Deletion is certified within 30 days.

#### M-10.3 Subscription

- **File:** `src/apps/mobile/screens/account/Subscription/Subscription.tsx`
- **Web twin:** present
- **Same on both:**
  - Subscription
  - Change plan
  - Manage in App Store
  - Cancel subscription
  - Opens App Store subscriptions (demo)
  - Free trial
  - Includes conversations only. Your Wellness Plan, downloads and family profiles open with a plan.
  - Choose a plan
  - Your subscription stays active until the end of the current billing period.

#### M-10.4 Notifications

- **File:** `src/apps/mobile/screens/account/Notifications/Notifications.tsx`
- **Web twin:** present
- **Same on both:**
  - Notification settings
  - Notifications
  - Allow notifications
  - Wellness Plan check-in
  - 30-day inactivity reminder
  - Booking reminders
  - Follow-up after guidance
  - Preferred frequency
  - Always on
  - Critical follow-up
  - Re-consent on policy update
  - Turn on notifications in Settings first
  - Check-in reminders on
  - Opened Settings (demo) — notifications allowed
  - Weekly
  - Monthly
  - “Your Oracle” Would Like to Send You Notifications
  - Don’t Allow
  - Allow
  - Notifications are off in Settings
  - Open Settings
- **Mobile only (or web missing):**
  - 2 weeks
- **Web only:**
  - Every 2 weeks

#### M-10.5 Legal

- **File:** `src/apps/mobile/screens/account/Legal/Legal.tsx`
- **Web twin:** present
- **Same on both:**
  - Terms & disclaimer
  - AI disclosure
- **Mobile only (or web missing):**
  - Done

#### M-10.7 ChangePassword

- **File:** `src/apps/mobile/screens/account/ChangePassword/ChangePassword.tsx`
- **Web twin:** present
- **Same on both:**
  - Change password
  - Current password
  - Enter your current password
  - New password
  - Enter a new password
  - Confirm new password
  - Confirm your new password
  - Password updated
  - Your password is set.
  - Taking you back…
  - Update password

#### M-10.8 CancelSubscription

- **File:** `src/apps/mobile/screens/account/CancelSubscription/CancelSubscription.tsx`
- **Web twin:** present
- **Same on both:**
  - Cancel subscription
  - Cancel your subscription?
  - Subscription cancelled
  - Before you go
  - Your Wellness Plan and check-ins
  - Provider-ready notes and PDF downloads
  - Family profiles
  - Your conversations and health profile stay in your account.
  - Keep my plan
  - Yes, cancel subscription

#### M-2.15 PolicyUpdate

- **File:** `src/apps/mobile/screens/account/PolicyUpdate/PolicyUpdate.tsx`
- **Web twin:** present
- _(no extractable chrome strings)_

## 6. Chat scripts & flows (shared — identical on mobile and web)

Full transcript copy lives under `src/shared/data/conversation/`. Both platforms run the same engine.

- **`conversation/chatIntake.json`** — ~189 copy strings · e.g. “Sleep & energy”
- **`conversation/checkin.json`** — ~5 copy strings · e.g. “Partly”
- **`conversation/debrief.json`** — ~16 copy strings · e.g. “Tell the Oracle”
- **`conversation/flows/firstConsult.json`** — ~102 copy strings · e.g. “I can't sleep through the night”
- **`conversation/flows/proxyConsult.json`** — ~30 copy strings · e.g. “Asking about: {name} · Proxy session — Elderly / caregiver”
- **`conversation/flows/returningConsult.json`** — ~47 copy strings · e.g. “Something new is happening”
- **`conversation/flows/sandraConsult.json`** — ~74 copy strings · e.g. “I’m exhausted all the time”
- **`conversation/guardrails.json`** — ~11 copy strings · e.g. “This could be an emergency.”
- **`conversation/intake.json`** — ~230 copy strings · e.g. “Hi {name}, before we start: who is this profile for?”
- **`conversation/provider-review.json`** — ~6 copy strings · e.g. “You reported: {concerns}. I hear your concern, and it is worth bringing directly to a healthcare professional.”
- **`conversation/scripts/after-provider.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/anxious-parent.json`** — ~11 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/endo-daughter.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/family-fatigue.json`** — ~6 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/gas-bloating.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/generic.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/hot-flashes-sleep.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/lab-review.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/out-of-scope-ankle.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/pms-gen-pro.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/sleep-3am.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/sleep-night.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/teen-irregular-periods.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/scripts/thyroid-fatigue.json`** — ~10 copy strings · e.g. “What I'm Hearing”
- **`conversation/suggestions.json`** — ~20 copy strings · e.g. “I can't sleep through the night”

## 7. How to use this audit

- Change clinical / question / chat wording in **shared JSON** once — both apps update.
- Change chrome (buttons, empty states, sheet titles) in **both** mobile and web twin files.
- Anything marked `status: placeholder` is not Deborah-approved clinical copy.
- For glossary / naming mismatches, see [copy-glossary-and-inventory.md](./copy-glossary-and-inventory.md).

---

_Generated 2026-10-31 from live `src/` (shared data + twin screen extract)._
