/** useAuthSecurity — sign-in rules from story 1.1/1.2, simulated in the browser:
 *  3 failed sign-ins in a row lock the account (a password reset unlocks it); the emailed code works for
 *  10 minutes, once, and stops after 5 wrong attempts; it can be resent after 60 s; idle sessions end after 15 min.
 *  Reset links (story 1.2) last 60 minutes, work once, and a newer link cancels older ones.
 *  Prototype stand-ins: the password "wrong" fails, the code 000000 is wrong. The password typed at sign-in is
 *  remembered as "current" so a reset or change can reject reusing it. */
import { create } from 'zustand';
import { useAdminStore } from './store';

export const CODE_TTL_MS = 10 * 60_000;
export const RESEND_AFTER_S = 60;
export const RESET_TTL_MS = 60 * 60_000;
/** 15 minutes; `?idle=<seconds>` on the URL shortens it for demos. */
export const IDLE_MS = (() => {
  const s = Number(new URLSearchParams(globalThis.location?.search ?? '').get('idle'));
  return s > 0 ? s * 1000 : 15 * 60_000;
})();

export const AUTH_COPY = {
  wrongCredentials: 'Incorrect email or password. Please try again.',
  locked: 'Your account has been temporarily locked after too many attempts. Please reset your password to continue.',
  codeEmpty: 'Please enter the verification code sent to your email.',
  codeWrong: 'That code doesn’t match. Please check your email and try again.',
  codeExpired: 'This code has expired. Please request a new one.',
  idle: 'You’ve been signed out after 15 minutes of inactivity. Please sign in again.',
  linkExpired: 'This link has expired. Please request a new one.',
  reused: 'Please choose a password you haven’t used before.',
  currentWrong: 'Your current password isn’t right. Please try again.',
};

interface AuthSecurityState {
  failures: number;
  locked: boolean;
  codeSentAt: number;
  codeAttempts: number;
  codeUsed: boolean;
  /** Shown on Sign in after an automatic sign-out. */
  notice: string;
  /** The current password (prototype only; '' until the first sign-in). */
  password: string;
  /** Latest reset link issued; older ids are dead. */
  resetLink: { id: number; issuedAt: number; used: boolean };
  /** Returns an error message, or '' when the password is accepted. */
  checkPassword: (email: string, password: string) => string;
  sendCode: () => void;
  /** Returns an error message, or '' when the code is accepted. */
  checkCode: (code: string) => string;
  unlock: () => void;
  /** Issues a new reset link; any earlier one stops working. */
  requestReset: () => void;
  /** Returns an error message, or '' when the link is still valid. */
  openResetLink: (id: number) => string;
  /** True when the given password matches the current one. */
  isCurrent: (password: string) => boolean;
  /** Sets a new password; a reset also uses up the link. */
  setPassword: (password: string, viaReset?: boolean) => void;
  signOutIdle: () => void;
  clearNotice: () => void;
}

const log = (text: string) => useAdminStore.getState().log(text);

export const useAuthSecurity = create<AuthSecurityState>((set, get) => ({
  failures: 0,
  locked: false,
  codeSentAt: 0,
  codeAttempts: 0,
  codeUsed: false,
  notice: '',
  password: '',
  resetLink: { id: 0, issuedAt: 0, used: false },
  checkPassword: (email, password) => {
    if (get().locked) return AUTH_COPY.locked;
    if (password.toLowerCase() === 'wrong') {
      const failures = get().failures + 1;
      set({ failures, locked: failures >= 3 });
      log(`Failed sign-in for ${email}`);
      if (failures >= 3) log(`Account locked after 3 failed sign-ins: ${email}`);
      return failures >= 3 ? AUTH_COPY.locked : AUTH_COPY.wrongCredentials;
    }
    set({ failures: 0, password });
    log(`Password accepted for ${email}; verification code sent`);
    return '';
  },
  sendCode: () => set({ codeSentAt: Date.now(), codeAttempts: 0, codeUsed: false }),
  checkCode: (code) => {
    const { codeSentAt, codeAttempts, codeUsed } = get();
    if (code.length < 6) return AUTH_COPY.codeEmpty;
    if (codeUsed || codeAttempts >= 5 || Date.now() - codeSentAt > CODE_TTL_MS) return AUTH_COPY.codeExpired;
    if (code === '000000') {
      set({ codeAttempts: codeAttempts + 1 });
      log('Wrong verification code entered');
      return codeAttempts + 1 >= 5 ? AUTH_COPY.codeExpired : AUTH_COPY.codeWrong;
    }
    set({ codeUsed: true });
    return '';
  },
  unlock: () => set({ failures: 0, locked: false }),
  requestReset: () => set((s) => ({ resetLink: { id: s.resetLink.id + 1, issuedAt: Date.now(), used: false } })),
  openResetLink: (id) => {
    const { resetLink } = get();
    const dead = id !== resetLink.id || resetLink.used || Date.now() - resetLink.issuedAt > RESET_TTL_MS;
    return dead ? AUTH_COPY.linkExpired : '';
  },
  isCurrent: (password) => {
    const { password: current } = get();
    // Before any sign-in the prototype has no stored password; "wrong" stands in for a mismatch.
    return current ? password === current : password.toLowerCase() !== 'wrong';
  },
  setPassword: (password, viaReset) =>
    set((s) => ({ password, ...(viaReset ? { resetLink: { ...s.resetLink, used: true } } : {}) })),
  signOutIdle: () => {
    log('Signed out after 15 minutes of inactivity');
    useAdminStore.setState({ signedIn: false });
    set({ notice: AUTH_COPY.idle });
  },
  clearNotice: () => set({ notice: '' }),
}));
