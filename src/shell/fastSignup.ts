/**
 * When JourneyRunner plays PDF persona paths, the sign-up sheet (M-1.4) + OTP should blaze through.
 * Apps read `document.documentElement.dataset.yocFastSignup` so shell never imports into mobile.
 */
export const FAST_SIGNUP_FLAG = 'yocFastSignup';

export function setFastSignup(on: boolean) {
  if (on) document.documentElement.dataset[FAST_SIGNUP_FLAG] = '1';
  else delete document.documentElement.dataset[FAST_SIGNUP_FLAG];
}

export function isFastSignup() {
  return document.documentElement.dataset[FAST_SIGNUP_FLAG] === '1';
}
