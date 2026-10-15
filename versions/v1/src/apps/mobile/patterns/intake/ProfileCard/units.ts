/** Height / weight display units. Values are stored metric; the toggle defaults from the device locale. */
export type Units = 'metric' | 'imperial';

export function localeUnits(locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language): Units {
  // US, Liberia and Myanmar use imperial body measures.
  return /-(US|LR|MM)$/i.test(locale) ? 'imperial' : 'metric';
}

export function formatHeight(cm: number, u: Units): string {
  if (u === 'metric') return `${cm} cm`;
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)} ft ${inches % 12} in`;
}

export function formatWeight(kg: number, u: Units): string {
  return u === 'metric' ? `${kg} kg` : `${Math.round(kg / 0.4536)} lb`;
}

export function regionFromLocale(locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language): string {
  return locale.split('-')[1]?.toUpperCase() ?? 'US';
}
