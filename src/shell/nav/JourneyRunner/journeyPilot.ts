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
  /** The answer finished once; the next quiet tick ends the run. */
  answered?: boolean;
  /** Next index into profile.picks for Health Basics choice tiles. */
  pickIndex?: number;
}

/** Demo credentials for the M-1.4 burst (nothing leaves the browser). */
const SIGNUP = { email: 'persona@example.com', password: 'demo-password-1', code: '444444' };

export type PilotTick = { done: boolean; acted: boolean; step?: string; passed?: boolean };

const visible = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
};
const text = (el: Element) => (el.textContent ?? '').trim();
const buttons = (root: ParentNode) => [...root.querySelectorAll<HTMLButtonElement>('button')].filter((b) => visible(b) && !b.disabled);
const find = (root: ParentNode, re: RegExp) => buttons(root).find((b) => re.test(text(b)));

/** Sets a React-controlled textarea the way typing would. */
function typeInto(el: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function typeInput(el: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

const DONE = /Saved to your health profile|Nothing from this conversation was saved/;
const THIS_YEAR = new Date().getFullYear();
const BASICS = /^M-1\.(8|9|10)\b/;

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

/** Welcome (M-1.2): name + Get Started in the fewest taps. */
function welcomeBurst(top: HTMLElement): PilotTick {
  const name = [...top.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([type=checkbox])')]
    .find((i) => visible(i) && !i.disabled);
  if (name && !name.value) {
    typeInput(name, 'Alex');
    return { done: false, acted: true, step: 'Welcome name' };
  }
  const go = find(top, /get started/i);
  if (go) { go.click(); return { done: false, acted: true, step: 'Get Started' }; }
  return { done: false, acted: false, step: 'M-1.2' };
}

/** One action on the onboarding profile (M-1.8): tiles, year, consent, gender branches, meds, Continue. */
function profileTick(p: ProfileAnswers, top: HTMLElement, st: PilotState): PilotTick {
  const pickIndex = st.pickIndex ?? 0;
  const options = buttons(top).filter((b) => b.getAttribute('role') === 'radio' && !b.closest('[role="slider"]'));
  if (options.length) {
    const remaining = p.picks.slice(pickIndex);
    const pick = remaining.map((re) => options.find((o) => re.test(text(o)))).find(Boolean) ?? options[0];
    const matchedAt = remaining.findIndex((re) => re.test(text(pick)));
    st.pickIndex = pickIndex + (matchedAt >= 0 ? matchedAt + 1 : 1);
    pick.click();
    return { done: false, acted: true, step: `Picks “${text(pick).split(/(?<=[a-z])(?=[A-Z])/)[0]}”` };
  }

  const name = top.querySelector<HTMLInputElement>('input:not([type=checkbox]):not([type=radio])');
  if (name && p.name && name.value !== p.name && !name.closest('[role="slider"]')) {
    // Prefer named member field over ChipPicker "Other" when both exist — member name has autocomplete words.
    if (name.autocomplete === 'off' || /first name/i.test(name.getAttribute('aria-label') ?? name.placeholder ?? '')) {
      typeInput(name, p.name);
      return { done: false, acted: true, step: `Types “${p.name}”` };
    }
  }

  const wheel = top.querySelector<HTMLElement>('[role="slider"]');
  const year = String(THIS_YEAR - p.age);
  if (wheel && wheel.getAttribute('aria-valuenow') !== year) {
    const row = [...wheel.querySelectorAll<HTMLButtonElement>('button')].find((b) => text(b) === year);
    if (row) { row.click(); return { done: false, acted: true, step: `Birth year ${year}` }; }
  }

  const box = top.querySelector<HTMLInputElement>('input[type=checkbox]');
  if (box && !box.checked) { box.click(); return { done: false, acted: true, step: 'Gives consent' }; }

  // Meds / supplements: one-tap None.
  const none = find(top, /^None$/);
  if (none) { none.click(); return { done: false, acted: true, step: 'Answers “None”' }; }

  // Required free-text (puberty start): open Other if needed, type default, Continue.
  const defaults = p.textDefaults ?? {};
  const other = find(top, /^Other$/);
  const draft = top.querySelector<HTMLInputElement>('input:not([type=checkbox]):not([type=radio])');
  if (other && !draft?.value) {
    other.click();
    return { done: false, acted: true, step: 'Opens Other' };
  }
  if (draft && visible(draft) && !draft.value && !draft.closest('[role="slider"]')) {
    const fill = defaults.pubertyStart ?? defaults[draft.name] ?? '14';
    typeInput(draft, fill);
    return { done: false, acted: true, step: `Types “${fill}”` };
  }

  const next = find(top, /^Continue$/);
  if (next) { next.click(); return { done: false, acted: true, step: 'Continue' }; }
  return { done: false, acted: false, step: 'M-1.8' };
}

export function journeyTick(run: JourneyRun, st: PilotState): PilotTick {
  const phone = document.querySelector<HTMLElement>('.phone-root');
  if (!phone) return { done: true, acted: false, passed: false };
  const screens = [...phone.querySelectorAll<HTMLElement>('[data-xref]')].filter(visible);
  const top = screens.at(-1);
  const screen = top?.dataset.xref ?? '';
  // A sheet closing under a hidden or slow page can linger in the DOM: once the chat exists, it wins.
  const inChat = Boolean(phone.querySelector('[data-xref^="M-2.1 "]'));

  if (run.stopAt === 'deborah' && inChat) {
    return { done: true, acted: false, step: 'Ask Deborah', passed: true };
  }
  if (run.stopAt === 'gate' && /^M-1\.10/.test(screen)) {
    return { done: true, acted: false, step: 'Ask adult (under-13 gate)', passed: true };
  }

  // Onboarding: PDF personas burst through Welcome + M-1.4 (sign-up + OTP); otherwise autopilot.
  if (run.onboarding && !inChat && !/^M-2\.(1|13)\b/.test(screen)) {
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
  if (run.profile && top && !inChat) {
    if (/^M-1\.10/.test(screen)) {
      if (run.stopAt === 'gate') return { done: true, acted: false, step: 'Ask adult (under-13 gate)', passed: true };
      return { done: true, acted: false, step: 'Ask a parent (age gate)', passed: true };
    }
    if (/^M-1\.8/.test(screen)) return profileTick(run.profile, top, st);
    if (/^M-1\.9/.test(screen)) {
      const start = find(top, /^Start/);
      if (start) { start.click(); return { done: false, acted: true, step: text(start) }; }
      if (run.stopAt === 'deborah') return { done: true, acted: false, step: 'Deborah welcome', passed: true };
      return { done: false, acted: false, step: screen };
    }
  }

  // M-2.13 sheet open (Edit): save everything from there.
  if (/^M-2\.13/.test(screen) && top) {
    const save = find(top, /^Save to my profile$/);
    if (save) { save.click(); st.editing = false; return { done: false, acted: true, step: 'Review: save from M-2.13' }; }
    return { done: false, acted: false, step: screen };
  }

  if (DONE.test(phone.textContent ?? '') && !phone.textContent?.includes('This deserves a provider')) {
    return { done: true, acted: false, step: 'Review and Confirm resolved', passed: true };
  }

  // DN-05 consent card.
  const agree = find(phone, /^Agree$/);
  if (agree) { agree.click(); return { done: false, acted: true, step: 'Consent: Agree' }; }

  // /wid widgets keep resolved controls in history, so locate the one with enabled choices.
  const panel = [...phone.querySelectorAll<HTMLElement>('[data-question-choices]')]
    .find((p) => buttons(p).some((b) => b.hasAttribute('data-choice-id')));
  if (panel) {
    const options = buttons(panel).filter((b) => b.hasAttribute('data-choice-id'));
    if (panel.dataset.multi && options.some((o) => o.getAttribute('aria-pressed') === 'true' || o.getAttribute('aria-checked') === 'true')) {
      const next = find(panel, /^Continue$/);
      if (next) { next.click(); return { done: false, acted: true, step: 'Confirms selected answers' }; }
    }
    const pick = run.answers.map((re) => options.find((o) => re.test(text(o)))).find(Boolean) ?? options[0];
    if (pick) { pick.click(); return { done: false, acted: true, step: `Answers “${text(pick)}”` }; }
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

  // Questions done without a red-flag screen (teen and child paths): ask for the answer.
  const ready = find(phone, /^Tell me what you think$/);
  if (ready) { ready.click(); return { done: false, acted: true, step: 'Tell me what you think' }; }

  // Opening message: type, then send with Enter on the next tick.
  const box = phone.querySelector<HTMLTextAreaElement>('textarea');
  if (!st.sent && run.message && box && !phone.querySelector('[data-role="user"], [class*="user"]')) {
    if (!st.typed) { typeInto(box, run.message); st.typed = true; return { done: false, acted: true, step: `Types “${run.message}”` }; }
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    st.sent = true;
    return { done: false, acted: true, step: 'Sends the message' };
  }

  // Empty message + deborah stop already handled; empty message without stopAt ends when chat is open.
  if (!run.message && inChat) return { done: true, acted: false, step: 'Ask Deborah', passed: true };

  // No facts to confirm (pregnancy, nothing new): the finished answer, or the follow-up offer, ends the run.
  if (/^M-2\.8/.test(screen)) return { done: true, acted: false, step: 'Follow-up offer', passed: true };
  // The answer's action row (Visit Notes…) means it finished; wait one beat for a Review and Confirm card.
  if (st.sent && find(phone, /Visit Notes/)) {
    if (!st.answered) { st.answered = true; return { done: false, acted: true, step: 'Answer delivered' }; }
    return { done: true, acted: false, step: 'Answer delivered', passed: true };
  }
  return { done: false, acted: false, step: screen };
}
