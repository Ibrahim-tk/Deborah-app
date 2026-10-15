/**
 * @flow-v1/shell journeyPilot — one user action per tick for a journey run (see journeys.ts). DOM only, like the Auto
 * demo autopilot: it reads what's on the phone and taps it, never reaching into the app's code.
 */
import { tick as onboardingTick } from '../AutoDemo/autopilot';
import type { JourneyRun, ProfileAnswers } from './journeys';

export interface PilotState {
  sent: boolean;
  typed: boolean;
  editing: boolean;
  /** The answer finished once; the next quiet tick ends the run. */
  answered?: boolean;
}

export type PilotTick = { done: boolean; acted: boolean; step?: string };

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

const DONE = /Saved to your health profile|Nothing from this conversation was saved/;
const THIS_YEAR = new Date().getFullYear();

function typeInput(el: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** One action on the onboarding profile (M-1.8): tile, name, year, consent, then Continue. */
function profileTick(p: ProfileAnswers, top: HTMLElement): PilotTick {
  const options = buttons(top).filter((b) => b.getAttribute('role') === 'radio' && !b.closest('[role="slider"]'));
  if (options.length) {
    const pick = p.picks.map((re) => options.find((o) => re.test(text(o)))).find(Boolean) ?? options[0];
    pick.click();
    return { done: false, acted: true, step: `Picks “${text(pick).split(/(?<=[a-z])(?=[A-Z])/)[0]}”` };
  }
  const name = top.querySelector<HTMLInputElement>('input:not([type=checkbox])');
  if (name && p.name && name.value !== p.name) { typeInput(name, p.name); return { done: false, acted: true, step: `Types “${p.name}”` }; }
  const wheel = top.querySelector<HTMLElement>('[role="slider"]');
  const year = String(THIS_YEAR - p.age);
  if (wheel && wheel.getAttribute('aria-valuenow') !== year) {
    const row = [...wheel.querySelectorAll<HTMLButtonElement>('button')].find((b) => text(b) === year);
    if (row) { row.click(); return { done: false, acted: true, step: `Birth year ${year}` }; }
  }
  const box = top.querySelector<HTMLInputElement>('input[type=checkbox]');
  if (box && !box.checked) { box.click(); return { done: false, acted: true, step: 'Gives consent' }; }
  const next = find(top, /^Continue$/);
  if (next) { next.click(); return { done: false, acted: true, step: 'Continue' }; }
  return { done: false, acted: false, step: 'M-1.8' };
}

export function journeyTick(run: JourneyRun, st: PilotState): PilotTick {
  const phone = document.querySelector<HTMLElement>('.phone-root');
  if (!phone) return { done: true, acted: false };
  const screens = [...phone.querySelectorAll<HTMLElement>('[data-xref]')].filter(visible);
  const top = screens.at(-1);
  const screen = top?.dataset.xref ?? '';
  // A sheet closing under a hidden or slow page can linger in the DOM: once the chat exists, it wins.
  const inChat = Boolean(phone.querySelector('[data-xref^="M-2.1 "]'));

  // Onboarding (DN-01 to DN-04): the Auto demo autopilot until the first conversation is open.
  if (run.onboarding && !inChat && !/^M-2\.(1|13)\b/.test(screen)) {
    const t = onboardingTick();
    return { done: false, acted: t.done ? false : t.acted, step: screen };
  }

  // Onboarding profile from S03: fill it, then start the chat from Deborah's welcome.
  if (run.profile && top && !inChat) {
    if (/^M-1\.10/.test(screen)) return { done: true, acted: false, step: 'Ask a parent (age gate)' };
    if (/^M-1\.8/.test(screen)) return profileTick(run.profile, top);
    if (/^M-1\.9/.test(screen)) {
      const start = find(top, /^Start/);
      if (start) { start.click(); return { done: false, acted: true, step: text(start) }; }
      return { done: false, acted: false, step: screen };
    }
  }

  // M-2.13 sheet open (Edit): save everything from there.
  if (/^M-2\.13/.test(screen) && top) {
    const save = find(top, /^Save to my profile$/);
    if (save) { save.click(); st.editing = false; return { done: false, acted: true, step: 'Review: save from M-2.13' }; }
    return { done: false, acted: false, step: screen };
  }

  if (DONE.test(phone.textContent ?? '') && !phone.textContent?.includes('This deserves a provider')) return { done: true, acted: false, step: 'Review and Confirm resolved' };

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
  if (!st.sent && box && !phone.querySelector('[data-role="user"], [class*="user"]')) {
    if (!st.typed) { typeInto(box, run.message); st.typed = true; return { done: false, acted: true, step: `Types “${run.message}”` }; }
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    st.sent = true;
    return { done: false, acted: true, step: 'Sends the message' };
  }

  // No facts to confirm (pregnancy, nothing new): the finished answer, or the follow-up offer, ends the run.
  if (/^M-2\.8/.test(screen)) return { done: true, acted: false, step: 'Follow-up offer' };
  // The answer's action row (Visit Notes…) means it finished; wait one beat for a Review and Confirm card.
  if (st.sent && find(phone, /Visit Notes/)) {
    if (!st.answered) { st.answered = true; return { done: false, acted: true, step: 'Answer delivered' }; }
    return { done: true, acted: false, step: 'Answer delivered' };
  }
  return { done: false, acted: false, step: screen };
}
