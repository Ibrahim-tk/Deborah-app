/** useAuthSecurity — sign-in rules from story 1.1/1.2, simulated in the browser:
 *  3 failed sign-ins in a row lock the account (a password reset unlocks it); the emailed code works for
 *  10 minutes, once, and stops after 5 wrong attempts; it can be resent after 60 s; idle sessions end after 15 min.
 *  Prototype stand-ins: the password "wrong" fails, the code 000000 is wrong. */
import { create } from 'zustand';
import { useAdminStore } from './store';

export const CODE_TTL_MS = 10 * 60_000;
export const RESEND_AFTER_S = 60;
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
};

interface AuthSecurityState {
  failures: number;
  locked: boolean;
  codeSentAt: number;
  codeAttempts: number;
  codeUsed: boolean;
  /** Shown on Sign in after an automatic sign-out. */
  notice: string;
  /** Returns an error message, or '' when the password is accepted. */
  checkPassword: (email: string, password: string) => string;
  sendCode: () => void;
  /** Returns an error message, or '' when the code is accepted. */
  checkCode: (code: string) => string;
  unlock: () => void;
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
  checkPassword: (email, password) => {
    if (get().locked) return AUTH_COPY.locked;
    if (password.toLowerCase() === 'wrong') {
      const failures = get().failures + 1;
      set({ failures, locked: failures >= 3 });
      log(`Failed sign-in for ${email}`);
      if (failures >= 3) log(`Account locked after 3 failed sign-ins: ${email}`);
      return failures >= 3 ? AUTH_COPY.locked : AUTH_COPY.wrongCredentials;
    }
    set({ failures: 0 });
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
  signOutIdle: () => {
    log('Signed out after 15 minutes of inactivity');
    useAdminStore.setState({ signedIn: false });
    set({ notice: AUTH_COPY.idle });
  },
  clearNotice: () => set({ notice: '' }),
}));
