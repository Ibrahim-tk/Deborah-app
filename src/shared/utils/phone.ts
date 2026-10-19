/**
 * Phone adapter (industry standard libphonenumber via `libphonenumber-js`). The library is imported only
 * here, so formatting / validation can be swapped in one file. Non-visual: no UI.
 */
import { AsYouType, getCountries, getCountryCallingCode, getExampleNumber, isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';

export type { CountryCode };

export interface Country {
  iso: CountryCode;
  name: string;
  dial: string;
  flag: string;
  /** National example, formatted (placeholder). */
  sample: string;
}

/** Shown first in the picker. */
const PRIORITY: CountryCode[] = ['US', 'CA', 'GB', 'AU', 'MX', 'IN'];

const names = new Intl.DisplayNames(['en'], { type: 'region' });
const flagOf = (iso: string) => String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

function build(iso: CountryCode): Country {
  const example = getExampleNumber(iso, examples);
  return {
    iso,
    name: names.of(iso) ?? iso,
    dial: `+${getCountryCallingCode(iso)}`,
    flag: flagOf(iso),
    sample: example?.formatNational() ?? '',
  };
}

export const COUNTRIES: Country[] = (() => {
  const all = getCountries().map(build).sort((a, b) => a.name.localeCompare(b.name));
  const top = PRIORITY.map((iso) => all.find((c) => c.iso === iso)!).filter(Boolean);
  return [...top, ...all.filter((c) => !PRIORITY.includes(c.iso))];
})();

export const countryFor = (iso?: string, dial?: string): Country =>
  COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];

/** Formats the national number as it is typed, e.g. "5551234" → "(555) 123-4". */
export const formatAsYouType = (iso: CountryCode, digits: string) => new AsYouType(iso).input(digits);

export const isValidPhone = (iso: CountryCode, national: string) => {
  try {
    return isValidPhoneNumber(national, iso);
  } catch {
    return false;
  }
};
