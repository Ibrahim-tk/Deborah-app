/**
 * @shell journeyPilot — one user action per tick for a journey run (see journeys.ts / pdfPersonas.ts).
 * DOM only, like the Auto demo autopilot: it reads what's on the phone and taps it, never reaching into
 * the app's code. PDF persona runs burst-fill the M-1.4 sign-up sheet + OTP in as few ticks as possible.
 */
import { tick as onboardingTick } from '../AutoDemo/autopilot';
import type { JourneyRun, ProfileAnswers } from './journeys';

export interface PilotState {
  sent: boolean;
  typed: boolean;
  editing: boolean;
  /** The answer finished once; the next quiet tick ends the run (unless afterAnswer continues). */
  answered?: boolean;
  /** Next index into profile.picks for Health Basics choice tiles. */
  pickIndex?: number;
  /** Miro: typed early “Tell me what you think” during intake. */
  earlyTyped?: boolean;
  earlyLookSent?: boolean;
  earlyLookSeen?: boolean;
  /** Miro: Whats next OptionRow already tapped. */
  nextStepTapped?: boolean;
  /** Mid-intake free-text: placeholder key we already typed for (avoids resend loops). */
  intakeTextKey?: string;
  intakeTextTyped?: boolean;
  /** Start chatting already tapped — don't re-tap if M-1.9 sheet lingers over chat. */
  deborahStarted?: boolean;
}

/** Demo credentials for the M-1.4 burst (nothing leaves the browser). */
const SIGNUP = { email: 'persona@example.com', password: 'demo-password-1', code: '444444' };

export type PilotTick = { done: boolean; acted: boolean; step?: string; passed?: boolean };

const laidOut = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
};
/** Screens: must intersect the phone frame (dismissed sheets can linger laid-out below it). */
const visible = (el: HTMLElement) => {
  if (!laidOut(el)) return false;
  const phone = el.closest('.phone-root') as HTMLElement | null;
  if (!phone) return true;
  const r = el.getBoundingClientRect();
  const pr = phone.getBoundingClientRect();
  return r.bottom > pr.top + 8 && r.top < pr.bottom - 8 && r.right > pr.left && r.left < pr.right;
};
const text = (el: Element) => (el.textContent ?? '').trim();
/** Choice / action buttons: laid-out is enough (lists often scroll; off-fold options must stay clickable). */
const buttons = (root: ParentNode) =>
  [...root.querySelectorAll<HTMLButtonElement>('button')].filter((b) => laidOut(b) && !b.disabled);
const find = (root: ParentNode, re: RegExp) => buttons(root).find((b) => re.test(text(b)));

/** Sets a React-controlled textarea the way typing would. */
function typeInto(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }));
}

function clickSend(phone: HTMLElement, box: HTMLTextAreaElement) {
  const sendBtn =
    [...phone.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => laidOut(b) && !b.disabled && b.getAttribute('aria-label') === 'Send',
    ) ?? find(phone, /^Send$/);
  if (sendBtn) sendBtn.click();
  else box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

function typeInput(el: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

const DONE = /Saved to your health profile|Nothing from this conversation was saved/;
const EARLY_LOOK = /early first look|don.?t have enough yet for full guidance/i;
const UNCOVERED = /outside what the Oracle|approved educational materials|cataract/i;
const LABS_REFRESH = /updated this with your labs/i;
const FREE_TEXT_PLACEHOLDER = /Type your goal|Type your answer|Or type your answer|Or type something else|Or type a/i;
const THIS_YEAR = new Date().getFullYear();
const BASICS = /^M-1\.(8|9|10)\b/;
const ASK = 'Tell me what you think';
const DEFAULT_GOAL = 'Sleep through the night without waking at 3am';

function activeChoicePanel(phone: HTMLElement) {
  return [...phone.querySelectorAll<HTMLElement>('[data-question-choices]')].find((p) =>
    buttons(p).some((b) => b.hasAttribute('data-choice-id') && !b.disabled),
  );
}

/** Expand multi tick is icon-only with aria-label Continue. */
function findContinue(panel: HTMLElement) {
  return (
    find(panel, /^Continue$/) ??
    [...panel.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => visible(b) && !b.disabled && b.getAttribute('aria-label') === 'Continue',
    )
  );
}

function freeTextValue(run: JourneyRun, placeholder: string) {
  const texts = run.textAnswers ?? {};
  if (/goal/i.test(placeholder)) return texts.goal ?? DEFAULT_GOAL;
  return texts.answer ?? texts.goal ?? DEFAULT_GOAL;
}

function wantsAfterAnswer(run: JourneyRun) {
  return Boolean(run.afterAnswer && run.afterAnswer !== 'none');
}

function fieldValue(el: HTMLInputElement): string {
  if (el.inputMode === 'numeric' || el.autocomplete === 'one-time-code') return '';
  if (el.type === 'password') return SIGNUP.password;
  if (el.type === 'email' || /email/i.test(el.autocomplete)) return SIGNUP.email;
  return 'Alex';
}

/**
 * Fastest path through M-1.4: fill every credential field in one tick, submit next tick, paste OTP
 * in one tick. Used for PDF persona runs (and any onboarding+profile run).
 */
function signupBurst(top: HTMLElement): PilotTick {
  const otpGroup = top.querySelector<HTMLElement>('[aria-label="Verification code"]');
  if (otpGroup) {
    const boxes = [...otpGroup.querySelectorAll<HTMLInputElement>('input')].filter((i) => visible(i) && !i.disabled);
    if (boxes.some((b) => !b.value)) {
      const dt = new DataTransfer();
      dt.setData('text', SIGNUP.code);
      otpGroup.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      // Fallback if paste is ignored: write each box (React may only keep the last without paste).
      if (boxes.some((b) => !b.value)) {
        boxes.forEach((b, i) => {
          typeInput(b, SIGNUP.code[i] ?? '4');
          b.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      return { done: false, acted: true, step: 'OTP pasted' };
    }
    return { done: false, acted: false, step: 'OTP verifying' };
  }

  const empties = [...top.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([readonly])')]
    .filter((i) => visible(i) && !i.disabled && !i.value);
  if (empties.length) {
    for (const el of empties) typeInput(el, fieldValue(el));
    return { done: false, acted: true, step: 'Sign-up fields filled' };
  }

  const create = find(top, /^Create account$/) ?? find(top, /^Sign in$/);
  if (create) { create.click(); return { done: false, acted: true, step: 'Create account' }; }
  const submit = buttons(top).find((b) => b.type === 'submit');
  if (submit) { submit.click(); return { done: false, acted: true, step: 'Submit sign-up' }; }
  return { done: false, acted: false, step: 'M-1.4' };
}

/** Welcome (M-1.2): name + Get Started in the fewest taps. V1 also needs Terms / Privacy checkboxes. */
function welcomeBurst(top: HTMLElement): PilotTick {
  const name = [...top.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([type=checkbox])')]
    .find((i) => visible(i) && !i.disabled);
  if (name && !name.value) {
    typeInput(name, 'Alex');
    return { done: false, acted: true, step: 'Welcome name' };
  }
  const unchecked = [...top.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].find(
    (box) => visible(box) && !box.checked,
  );
  if (unchecked) {
    unchecked.click();
    return { done: false, acted: true, step: 'Welcome consent' };
  }
  const go = find(top, /get started/i);
  if (go) { go.click(); return { done: false, acted: true, step: 'Get Started' }; }
  return { done: false, acted: false, step: 'M-1.2' };
}

/** One action on the onboarding profile (M-1.8): tiles, year, consent, gender branches, meds, Continue. */
function profileTick(p: ProfileAnswers, top: HTMLElement, st: PilotState): PilotTick {
  const pickIndex = st.pickIndex ?? 0;
  // ProfileFor / FullChoicePills use role=radio; QuestionChoices use ChoicePills (data-choice-id).
  const options = buttons(top).filter(
    (b) =>
      !b.closest('[role="slider"]') &&
      (b.getAttribute('role') === 'radio' || b.hasAttribute('data-choice-id')),
  );
  if (options.length) {
    const remaining = p.picks.slice(pickIndex);
    const scripted = remaining.map((re) => options.find((o) => re.test(text(o)))).find(Boolean);
    const isOn = (o: HTMLElement) =>
      o.getAttribute('aria-checked') === 'true' || o.getAttribute('aria-pressed') === 'true';
    if (scripted) {
      const matchedAt = remaining.findIndex((re) => re.test(text(scripted)));
      st.pickIndex = pickIndex + matchedAt + 1;
      if (!isOn(scripted)) {
        scripted.click();
        return { done: false, acted: true, step: `Picks “${text(scripted).split(/(?<=[a-z])(?=[A-Z])/)[0]}”` };
      }
      // Already selected — fall through to Continue.
    } else if (!options.some(isOn)) {
      // Branch step with no scripted match yet — pick the first option once.
      options[0].click();
      return { done: false, acted: true, step: `Picks “${text(options[0]).split(/(?<=[a-z])(?=[A-Z])/)[0]}”` };
    }
    // Selection present and no further scripted pick for this step → Continue below.
  }

  const name = top.querySelector<HTMLInputElement>('input:not([type=checkbox]):not([type=radio])');
  if (name && p.name && name.value !== p.name && !name.closest('[role="slider"]')) {
    // Prefer named member field over ChipPicker "Other" when both exist — member name has autocomplete words.
    if (name.autocomplete === 'off' || /first name/i.test(name.getAttribute('aria-label') ?? name.placeholder ?? '')) {
      typeInput(name, p.name);
      return { done: false, acted: true, step: `Types “${p.name}”` };
    }
  }

  // Date of birth (month · day · year) or legacy year-only wheel.
  const year = String(THIS_YEAR - p.age);
  const yearWheel =
    [...top.querySelectorAll<HTMLElement>('[role="slider"]')].find(
      (el) => /year/i.test(el.getAttribute('aria-label') ?? ''),
    ) ?? top.querySelector<HTMLElement>('[role="slider"]');
  if (yearWheel && yearWheel.getAttribute('aria-valuenow') !== year) {
    const row = [...yearWheel.querySelectorAll<HTMLButtonElement>('button')].find((b) => text(b) === year);
    if (row) { row.click(); return { done: false, acted: true, step: `Birth year ${year}` }; }
  }

  // Medical-advocate checkboxes (M-1.8 consent): guardian for minors, agreed for adults.
  const consentBoxes = [...top.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
  if (consentBoxes.length >= 2 && !consentBoxes.some((b) => b.checked)) {
    const labels = consentBoxes.map((b) => {
      const lab = b.id ? top.querySelector(`label[for="${CSS.escape(b.id)}"]`) : null;
      return { box: b, text: (lab?.textContent ?? '').replace(/\s+/g, ' ').trim() };
    });
    const pick =
      (p.age < 18
        ? labels.find((l) => /parent or legal guardian/i.test(l.text))
        : labels.find((l) => /knows I.m adding them/i.test(l.text))) ??
      labels.find((l) => /authorised to act/i.test(l.text)) ??
      labels[0];
    pick?.box.click();
    return { done: false, acted: true, step: 'Gives consent' };
  }
  const box = consentBoxes[0];
  if (box && !box.checked && consentBoxes.length === 1) {
    box.click();
    return { done: false, acted: true, step: 'Gives consent' };
  }

  // Meds / supplements / body / procedures: one-tap None.
  const none = find(top, /^None( of these)?$/);
  if (none) { none.click(); return { done: false, acted: true, step: 'Answers “None”' }; }

  // Required free-text (puberty age wheel fallback / optional notes): open Other if needed, type default, Continue.
  const defaults = p.textDefaults ?? {};
  const other = find(top, /^Other$/);
  const draft = top.querySelector<HTMLInputElement>('input:not([type=checkbox]):not([type=radio])');
  if (other && !draft?.value) {
    other.click();
    return { done: false, acted: true, step: 'Opens Other' };
  }
  if (draft && visible(draft) && !draft.value && !draft.closest('[role="slider"]')) {
    const fill = defaults.pubertyStart ?? defaults.pubertyAge ?? defaults[draft.name] ?? '14';
    typeInput(draft, fill);
    return { done: false, acted: true, step: `Types “${fill}”` };
  }

  const next = find(top, /^Continue$/);
  if (next) { next.click(); return { done: false, acted: true, step: 'Continue' }; }
  return { done: false, acted: false, step: 'M-1.8' };
}

/** Miro Whats next / labs sheet / confirm modal. */
function afterAnswerTick(run: JourneyRun, phone: HTMLElement, screen: string, st: PilotState): PilotTick | null {
  if (!wantsAfterAnswer(run)) return null;

  // Follow-up opt-in can cover Book (M-8.2) after Review — dismiss so the book finish can fire.
  if (/^M-2\.8/.test(screen) || [...phone.querySelectorAll<HTMLElement>('[data-xref^="M-2.8 "]')].some(visible)) {
    const skip = find(phone, /^Not now$/);
    if (skip) { skip.click(); return { done: false, acted: true, step: 'Follow-up: Not now' }; }
    return { done: false, acted: false, step: 'Waiting for follow-up sheet' };
  }

  // Labs confirm modal.
  if (/^M-5\.4/.test(screen)) {
    const send = find(phone, /^Add Report$/) ?? find(phone, /^Save changes$/);
    if (send) {
      send.click();
      return { done: false, acted: true, step: 'Send labs to the Oracle' };
    }
  }

  // Add labs sheet: camera path (file picker is hard for the DOM pilot).
  if (/^M-5\.3/.test(screen) || [...phone.querySelectorAll<HTMLElement>('[data-xref^="M-5.3 "]')].some(visible)) {
    const sheetBody = phone.textContent ?? '';
    if (/Reading your report/i.test(sheetBody)) {
      return { done: false, acted: false, step: 'Waiting for lab report read' };
    }
    const use = find(phone, /^Use photo$/);
    if (use) { use.click(); return { done: false, acted: true, step: 'Use photo' }; }
    const shutter = phone.querySelector<HTMLButtonElement>('button[aria-label="Take photo"]');
    if (shutter && laidOut(shutter) && !shutter.disabled) {
      shutter.click();
      return { done: false, acted: true, step: 'Take photo' };
    }
    const photo = find(phone, /^Take a photo$/);
    if (photo) { photo.click(); return { done: false, acted: true, step: 'Open camera' }; }
    return { done: false, acted: false, step: 'Waiting on labs sheet' };
  }

  if (run.afterAnswer === 'whatsNext-labs' && LABS_REFRESH.test(phone.textContent ?? '')) {
    return { done: true, acted: false, step: 'Lab summary refreshed', passed: true };
  }

  if (
    run.afterAnswer === 'whatsNext-book' &&
    (/^M-8\./.test(screen) ||
      [...phone.querySelectorAll<HTMLElement>('[data-xref]')].some(
        (el) => visible(el) && /^M-8\./.test(el.dataset.xref ?? ''),
      ))
  ) {
    return { done: true, acted: false, step: 'Book consultation', passed: true };
  }

  if (run.afterAnswer === 'whatsNext-followUp' && st.nextStepTapped) {
    const box = phone.querySelector<HTMLTextAreaElement>('textarea');
    if (box && document.activeElement === box) {
      return { done: true, acted: false, step: 'Ask a follow-up', passed: true };
    }
  }

  // Review and Confirm still open — Save first so What’s next Book is not raced.
  if (run.review === 'save') {
    const save = find(phone, /^Save to my profile$/);
    if (save) {
      save.click();
      return { done: false, acted: true, step: 'Review: save' };
    }
  } else if (find(phone, /^Save to my profile$/)) {
    return null;
  }

  if (!st.nextStepTapped) {
    const row =
      run.afterAnswer === 'whatsNext-book'
        ? find(phone, /^Consult with support team$/) || find(phone, /^Consult with support team$/)
        : run.afterAnswer === 'whatsNext-followUp'
          ? find(phone, /^Ask a follow-up$/)
          : find(phone, /^Upload labs or results$/);
    if (row) {
      row.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      row.click();
      st.nextStepTapped = true;
      return { done: false, acted: true, step: `What’s next: ${text(row)}` };
    }
    const label =
      run.afterAnswer === 'whatsNext-book'
        ? /^Consult with support team$|^Consult with support team$/
        : run.afterAnswer === 'whatsNext-followUp'
          ? /^Ask a follow-up$/
          : /^Upload labs or results$/;
    const disabledRow = [...phone.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => laidOut(b) && b.disabled && label.test(text(b)),
    );
    if (disabledRow || st.answered) {
      return { done: false, acted: false, step: 'Waiting for What’s next' };
    }
  }

  return null;
}

/** True while Deborah is generating / streaming the 7-section answer (no Visit Notes action yet). */
function waitingForGuidanceStream(phone: HTMLElement) {
  if (find(phone, /Visit Notes/)) return false;
  // Scope to chat — phone-root also includes library copy (“hypothalamus”, etc.).
  const chat =
    [...phone.querySelectorAll<HTMLElement>('[data-xref^="M-2.1 "]')].filter(visible).at(-1) ?? phone;
  const body = chat.textContent ?? '';
  if (/Reading your answer|Let me look at this through my framework/i.test(body)) return true;
  if (/the Oracle is reviewing|Looking through my Handbook|Writing to you/i.test(body)) return true;
  // Sections streaming before the action row appears.
  if (/What I.?m Hearing|The Hypothalamic Connection/i.test(body) && !find(phone, /Visit Notes/)) return true;
  return false;
}

export function journeyTick(run: JourneyRun, st: PilotState): PilotTick {
  const phone = document.querySelector<HTMLElement>('.phone-root');
  if (!phone) return { done: true, acted: false, passed: false };
  const screens = [...phone.querySelectorAll<HTMLElement>('[data-xref]')].filter(visible);
  let top = screens.at(-1);
  let screen = top?.dataset.xref ?? '';
  const chatEl = [...phone.querySelectorAll<HTMLElement>('[data-xref^="M-2.1 "]')].filter(visible).at(-1);
  const startChat =
    find(phone, /^Start chatting$/) ?? find(phone, /^Start talking about/) ?? undefined;
  const welcomeUp = screens.some((el) => /^M-1\.9/.test(el.dataset.xref ?? '')) || /^M-1\.9/.test(screen);
  // Welcome sheet can sit above M-1.8; keep tapping while M-1.9 is present.
  if (startChat && welcomeUp) {
    startChat.click();
    st.deborahStarted = true;
    return { done: false, acted: true, step: text(startChat) };
  }
  // Onboarding sheets (M-1.8–1.10) can sit above a residual M-2.1 — treat top sheet as truth until chat wins.
  const onboardingSheet = /^M-1\.(8|9|10)\b/.test(screen);
  if (st.deborahStarted && onboardingSheet && chatEl) {
    top = chatEl;
    screen = chatEl.dataset.xref ?? screen;
  }
  const inChat = Boolean(chatEl) && (!onboardingSheet || Boolean(st.deborahStarted));
  const body = phone.textContent ?? '';

  if (run.stopAt === 'deborah' && inChat) {
    return { done: true, acted: false, step: 'Ask Oracle', passed: true };
  }
  if (run.stopAt === 'gate' && /^M-1\.10/.test(screen)) {
    return { done: true, acted: false, step: 'Ask adult (under-13 gate)', passed: true };
  }
  if (/^M-1\.9/.test(screen)) {
    if (run.stopAt === 'deborah') return { done: true, acted: false, step: 'The Oracle welcome', passed: true };
    return { done: false, acted: false, step: 'Waiting for Start chatting' };
  }

  // After Start chatting: Home can win a tick before M-2.1 mounts — open Ask Deborah (don't run AutoDemo END).
  if (/^M-2\.0\b/.test(screen) && (run.message || wantsAfterAnswer(run) || run.earlyAnswer)) {
    const openAsk =
      [...phone.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => visible(b) && b.getAttribute('aria-label') === 'Message the Oracle',
      ) ?? find(phone, /^Message the Oracle$/);
    if (openAsk) {
      openAsk.click();
      return { done: false, acted: true, step: 'Opens Ask Oracle from Home' };
    }
    return { done: false, acted: false, step: 'Waiting for Ask Oracle on Home' };
  }

  // Onboarding: PDF personas burst through Welcome + M-1.4 (sign-up + OTP); otherwise autopilot.
  // Exclude Home (M-2.0) — AutoDemo treats it as END and the journey would idle-timeout.
  if (run.onboarding && !inChat && !/^M-2\.(0|1|13)\b/.test(screen) && !/^M-5\./.test(screen) && !/^M-8\./.test(screen)) {
    if (run.profile && BASICS.test(screen)) {
      // Fall through to profile handling below.
    } else if (run.profile && top && /^M-1\.4\b/.test(screen)) {
      return signupBurst(top);
    } else if (run.profile && top && /^M-1\.2\b/.test(screen)) {
      return welcomeBurst(top);
    } else {
      const t = onboardingTick();
      return { done: false, acted: t.done ? false : t.acted, step: screen };
    }
  }

  // Onboarding profile from S03 / S01: fill it, then start the chat from Deborah's welcome.
  if (run.profile && top && (!inChat || onboardingSheet)) {
    if (/^M-1\.10/.test(screen)) {
      if (run.stopAt === 'gate') return { done: true, acted: false, step: 'Ask adult (under-13 gate)', passed: true };
      return { done: true, acted: false, step: 'Ask a parent (age gate)', passed: true };
    }
    if (/^M-1\.8/.test(screen)) return profileTick(run.profile, top, st);
  }

  // Miro Step 4 post-guidance (Whats next / labs / book) — before Review DONE short-circuit.
  const after = afterAnswerTick(run, phone, screen, st);
  if (after) return after;

  // M-2.13 sheet open (Edit): save everything from there.
  if (/^M-2\.13/.test(screen) && top) {
    const save = find(top, /^Save to my profile$/);
    if (save) { save.click(); st.editing = false; return { done: false, acted: true, step: 'Review: save from M-2.13' }; }
    return { done: false, acted: false, step: screen };
  }

  // Care disclaimer over the answer — dismiss so Review / What’s next can proceed.
  const gotIt = find(phone, /^Got it$/);
  if (gotIt && (wantsAfterAnswer(run) || run.earlyAnswer)) {
    gotIt.click();
    return { done: false, acted: true, step: 'Dismisses care disclaimer' };
  }

  // Follow-up sheet can sit above chat even when data-xref top is still M-2.1.
  if (wantsAfterAnswer(run)) {
    const followUpSheet = [...phone.querySelectorAll<HTMLElement>('[data-xref^="M-2.8 "]')].find(visible);
    if (followUpSheet) {
      const notNow = find(followUpSheet, /^Not now$/) ?? find(phone, /^Not now$/);
      if (notNow) {
        notNow.click();
        return { done: false, acted: true, step: 'Dismisses follow-up opt-in' };
      }
    }
  }

  if (st.sent && waitingForGuidanceStream(phone)) {
    return { done: false, acted: false, step: 'Waiting for guidance stream' };
  }

  if (DONE.test(body) && !body.includes('This deserves a provider') && !wantsAfterAnswer(run)) {
    if (run.earlyAnswer && !st.earlyLookSeen) {
      // Keep going until early look happened and a later answer finished.
    } else {
      return { done: true, acted: false, step: 'Review and Confirm resolved', passed: true };
    }
  }

  // DN-05 consent card.
  const agree = find(phone, /^Agree$/);
  if (agree) { agree.click(); return { done: false, acted: true, step: 'Consent: Agree' }; }

  // Miro early first look: AnswerCTA only shows at ready — type the ask during intake.
  if (run.earlyAnswer && !st.earlyLookSeen) {
    if (EARLY_LOOK.test(body)) {
      st.earlyLookSeen = true;
      return { done: false, acted: true, step: 'Early first look' };
    }
    if (!st.earlyLookSent) {
      const box = phone.querySelector<HTMLTextAreaElement>('textarea');
      // Prefer phone-frame visibility; fall back to laid-out so choice panels don't block typing.
      if (box && (visible(box) || laidOut(box))) {
        if (!st.earlyTyped || box.value.trim() !== ASK) {
          typeInto(box, ASK);
          st.earlyTyped = true;
          return { done: false, acted: true, step: `Types “${ASK}” (early)` };
        }
        // Only mark sent when Send is enabled (React draft caught up) — Enter alone often no-ops.
        const sendBtn = [...phone.querySelectorAll<HTMLButtonElement>('button')].find(
          (b) => laidOut(b) && !b.disabled && b.getAttribute('aria-label') === 'Send',
        );
        if (!sendBtn) return { done: false, acted: false, step: 'Waiting for early ask draft' };
        clickSend(phone, box);
        st.earlyLookSent = true;
        st.sent = true;
        return { done: false, acted: true, step: 'Sends early ask' };
      }
    }
    // Wait for early-look copy before answering more intake.
    if (st.earlyLookSent) return { done: false, acted: false, step: 'Waiting for early first look' };
  }

  // /wid widgets keep resolved controls in history, so locate the one with enabled choices.
  const panel = activeChoicePanel(phone);
  if (panel) {
    const options = buttons(panel).filter((b) => b.hasAttribute('data-choice-id'));
    if (panel.dataset.multi && options.some((o) => o.getAttribute('aria-pressed') === 'true' || o.getAttribute('aria-checked') === 'true')) {
      const next = findContinue(panel);
      if (next) { next.click(); return { done: false, acted: true, step: 'Confirms selected answers' }; }
    }
    const pick = run.answers.map((re) => options.find((o) => re.test(text(o)))).find(Boolean) ?? options[0];
    if (pick) {
      pick.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      pick.click();
      return { done: false, acted: true, step: `Answers “${text(pick)}”` };
    }
  }
  const consent = [...phone.querySelectorAll<HTMLElement>('[aria-label="Health data consent"]')]
    .map((p) => find(p, /^(Yes|Agree|Agree and continue)$/)).find(Boolean);
  if (consent) { consent.click(); return { done: false, acted: true, step: 'Health-data consent' }; }

  // DN-13 Review and Confirm.
  const save = find(phone, /^Save to my profile$/);
  if (save) {
    const target = run.review === 'save' ? save : run.review === 'discard' ? find(phone, /^Don’t save$/) : find(phone, /^Edit$/);
    if (target) { target.click(); return { done: false, acted: true, step: `Review: ${run.review}` }; }
  }

  // Mid-intake free text (session-goal etc.): composer-only — no choice pills. Works after opening send.
  const box = phone.querySelector<HTMLTextAreaElement>('textarea');
  if (st.sent && box && visible(box) && !activeChoicePanel(phone)) {
    const ph = box.getAttribute('placeholder') ?? '';
    if (FREE_TEXT_PLACEHOLDER.test(ph)) {
      const key = ph;
      // Already sent for this placeholder — wait until Deborah advances (placeholder/choices change).
      if (st.intakeTextKey === `sent:${key}`) {
        return { done: false, acted: false, step: 'Waiting after intake text' };
      }
      if (st.intakeTextKey !== key) {
        st.intakeTextKey = key;
        st.intakeTextTyped = false;
      }
      const value = freeTextValue(run, ph);
      if (!st.intakeTextTyped) {
        typeInto(box, value);
        st.intakeTextTyped = true;
        return { done: false, acted: true, step: `Types intake “${value.slice(0, 40)}${value.length > 40 ? '…' : ''}”` };
      }
      clickSend(phone, box);
      st.intakeTextTyped = false;
      st.intakeTextKey = `sent:${key}`;
      return { done: false, acted: true, step: 'Sends intake text' };
    }
  }

  // Questions done without a red-flag screen (teen and child paths): ask for the answer.
  const ready = find(phone, /^Tell me what you think$/);
  if (ready) { ready.click(); return { done: false, acted: true, step: 'Tell me what you think' }; }

  // Opening message: type, then send with Enter on the next tick.
  if (!st.sent && run.message && box && !phone.querySelector('[data-role="user"], [class*="user"]')) {
    if (!st.typed) { typeInto(box, run.message); st.typed = true; return { done: false, acted: true, step: `Types “${run.message}”` }; }
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    st.sent = true;
    return { done: false, acted: true, step: 'Sends the message' };
  }

  // Seeded chats (S04 labs / S23 early) may already have user bubbles — send opening only if needed.
  if (!st.sent && run.message && box) {
    if (!st.typed) { typeInto(box, run.message); st.typed = true; return { done: false, acted: true, step: `Types “${run.message}”` }; }
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    st.sent = true;
    return { done: false, acted: true, step: 'Sends the message' };
  }

  // Empty message without afterAnswer: end when chat is open (PDF deborah stop / self-child handled above).
  if (!run.message && inChat && !run.earlyAnswer && !wantsAfterAnswer(run)) {
    return { done: true, acted: false, step: 'Ask Oracle', passed: true };
  }

  // Labs / Whats next seeds: treat as already past the opening send.
  if (!run.message && (run.earlyAnswer || wantsAfterAnswer(run))) st.sent = true;

  // Uncovered: after request, handoff copy without Visit Notes.
  if (UNCOVERED.test(run.message) && /outside what the Oracle|approved educational/i.test(body) && st.sent) {
    const choicesLeft = [...phone.querySelectorAll<HTMLElement>('[data-question-choices]')].some((p) =>
      buttons(p).some((b) => b.hasAttribute('data-choice-id')),
    );
    if (!choicesLeft && !find(phone, /^Tell me what you think$/)) {
      return { done: true, acted: false, step: 'Out of coverage handoff', passed: true };
    }
  }

  // No facts to confirm (pregnancy, nothing new): the finished answer, or the follow-up offer, ends the run.
  if (/^M-2\.8/.test(screen) && !wantsAfterAnswer(run)) {
    if (run.earlyAnswer && !st.earlyLookSeen) return { done: false, acted: false, step: screen };
    return { done: true, acted: false, step: 'Follow-up offer', passed: true };
  }

  // The answer's action row (Visit Notes…) means it finished; wait one beat for a Review and Confirm card.
  if (st.sent && find(phone, /Visit Notes/)) {
    if (wantsAfterAnswer(run)) {
      st.answered = true;
      // Prefer tapping What’s next now (Book / labs) instead of idling until timeout.
      const again = afterAnswerTick(run, phone, screen, st);
      if (again) return again;
      return { done: false, acted: false, step: 'Answer delivered — What’s next' };
    }
    if (run.earlyAnswer && !st.earlyLookSeen) {
      return { done: false, acted: false, step: 'Waiting for early first look before finish' };
    }
    if (!st.answered) { st.answered = true; return { done: false, acted: true, step: 'Answer delivered' }; }
    return { done: true, acted: false, step: 'Answer delivered', passed: true };
  }
  return { done: false, acted: false, step: screen };
}
