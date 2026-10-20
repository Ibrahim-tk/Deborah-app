/**
 * Sign-up persistence (design 2026-10-20): once she signs up, the store (account, intake progress…) is
 * kept in localStorage so a page reload lands back on her Home. Reset or picking a scenario clears it.
 * Prototype-only; every read/write is guarded (private windows, blocked storage).
 */
import { useAppStore } from './index';
import type { AppState } from './types';

const KEY = 'oracle.signup.v1';
const FLOW_PREFIX = 'oracle.flow.';

const data = (s: AppState) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function'));

/** Starts saving on every change while the account came through sign-up. Call once at startup. */
export function watchSignup() {
  return useAppStore.subscribe((s) => {
    if (s.authFlow === 'login') return clearSignup();
    if (s.authFlow !== 'signup') return;
    try { localStorage.setItem(KEY, JSON.stringify(data(s))); } catch { /* storage unavailable */ }
  });
}

/** Restores a saved sign-up for this scenario, landing on Home. Returns false when there is none. */
export function restoreSignup(scenarioId: string): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as Partial<AppState>;
    if (saved.scenario?.id !== scenarioId) return false;
    const prev = useAppStore.getState();
    useAppStore.setState({
      ...saved,
      dev: prev.dev,
      clockAnchor: Date.now(),
      scenario: { ...saved.scenario, start: { kind: 'screen', root: 'main', tab: 'ask', stack: ['M-2.0'] }, loadNonce: prev.scenario.loadNonce + 1 },
    } as Partial<AppState>);
    return true;
  } catch {
    return false;
  }
}

export function clearSignup() {
  try {
    localStorage.removeItem(KEY);
    Object.keys(localStorage).filter((k) => k.startsWith(FLOW_PREFIX)).forEach((k) => localStorage.removeItem(k));
  } catch { /* storage unavailable */ }
}

/** Scripted-chat progress (the Sandra chat) rides along with the sign-up snapshot. */
export function readFlow<T>(key: string): T | undefined {
  try { const raw = localStorage.getItem(FLOW_PREFIX + key); return raw ? (JSON.parse(raw) as T) : undefined; } catch { return undefined; }
}
export function writeFlow(key: string, value: unknown) {
  try { localStorage.setItem(FLOW_PREFIX + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
