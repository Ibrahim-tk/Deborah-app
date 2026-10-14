/**
 * @shell autopilot — one "user" action per tick on the phone's top screen, for the Auto demo button.
 * Works only through the DOM (fills fields, taps buttons) so it never reaches into the app's code and
 * moves through screens the same way a person would (CLAUDE.md: states, not screens, in the navbar).
 */

/** Demo-only test values (prototype has no backend; nothing leaves the browser). */
const DEMO = { name: 'Maria', email: 'maria@example.com', password: 'demo-password-1' };

/** Where the demo ends: the first consultation, the chat or Home. */
const END = /^M-2\.(0|1|12)\b/;

/** Tap order: the forward action a presenter would pick on each kind of screen. */
const FORWARD = [/^none$/i, /^myself/i, /continue/i, /get started/i, /start my journey/i, /^next/i, /^done/i, /^save/i, /^agree|accept/i, /^sign in$/i];
const NEVER = /back|previous|close|dismiss|info|menu|terms|privacy|cancel|skip/i;

const visible = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
};

const label = (el: HTMLElement) => `${el.getAttribute('aria-label') ?? ''} ${el.textContent ?? ''}`.trim();

/** Sets a React-controlled input the way typing would. */
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function demoValue(input: HTMLInputElement) {
  if (input.type === 'password') return DEMO.password;
  if (input.type === 'email' || /email/i.test(input.autocomplete)) return DEMO.email;
  return DEMO.name;
}

export type Tick = { done: true; screen?: string } | { done: false; screen?: string; acted: boolean };

export function tick(): Tick {
  const phone = document.querySelector<HTMLElement>('.phone-root');
  if (!phone) return { done: true };
  const screens = [...phone.querySelectorAll<HTMLElement>('[data-xref]')].filter(visible);
  const top = screens[screens.length - 1];
  const screen = top?.dataset.xref;
  if (!top) return { done: false, acted: false };
  if (screen && END.test(screen)) return { done: true, screen };

  // 1. Fill one empty field.
  const empty = [...top.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([readonly])')]
    .find((i) => visible(i) && !i.disabled && !i.value);
  if (empty) {
    type(empty, demoValue(empty));
    return { done: false, screen, acted: true };
  }

  // 2. Tap the forward action.
  const buttons = [...top.querySelectorAll<HTMLButtonElement>('button')].filter((b) => visible(b) && !b.disabled && !NEVER.test(label(b)));
  for (const re of FORWARD) {
    const hit = buttons.find((b) => re.test((b.textContent ?? '').trim()));
    if (hit) { hit.click(); return { done: false, screen, acted: true }; }
  }
  const submit = buttons.find((b) => b.type === 'submit');
  if (submit) { submit.click(); return { done: false, screen, acted: true }; }

  // 3. Otherwise pick the first answer on the screen (choice rows, tiles).
  const option = buttons.find((b) => b.type === 'button' && (b.textContent ?? '').trim());
  if (option) { option.click(); return { done: false, screen, acted: true }; }
  return { done: false, screen, acted: false };
}
