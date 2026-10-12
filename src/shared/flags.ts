/**
 * Feature flags. `intakeV2` (frictionless in-chat health intake) is on by default in dev;
 * set VITE_INTAKE_V2=off to fall back to the per-consultation intake questions.
 */
export const FLAGS = {
  intakeV2: import.meta.env.VITE_INTAKE_V2 !== 'off' && (import.meta.env.DEV || import.meta.env.VITE_INTAKE_V2 === 'on'),
} as const;
