/** Admin password rules (stories 1.2, 7.2, 12.2): at least 8 characters with upper and lower case, a number and a
 *  special character. Shared by change password, reset password and admin account setup. */
export const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'num', label: 'A number', test: (p: string) => /\d/.test(p) },
  { id: 'sym', label: 'A special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const PASSWORD_RULES_ERROR =
  'Your password needs at least 8 characters, including an uppercase letter, a lowercase letter, a number and a special character.';

export const meetsPasswordRules = (p: string) => PASSWORD_RULES.every((r) => r.test(p));
