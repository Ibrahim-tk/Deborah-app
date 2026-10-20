/**
 * @pattern PhoneField — the shared ui/Input (MUI Base UI field): country dial code prefix, national number formatted as you type
 *          (libphonenumber), validated on blur. The trailing flag opens a searchable dropdown of every
 *          country (common ones first) — a Base UI Combobox via `ui/Combobox`, not a full sheet.
 * @usedBy  M-1.4 CreateProfile · M-4.3 CreateAccount · M-10.1 Account · Widget lab · Design System
 * @status  placeholder
 */
import { useId, useRef, useState } from 'react';
import { COUNTRIES, countryFor, formatAsYouType, isValidPhone, type Country, type CountryCode } from '@shared/utils/phone';
import { Combobox, Icon, Input } from '@mobile/ui';
import styles from './PhoneField.module.css';

export interface PhoneValue {
  /** Dial code, e.g. "+1". */
  countryCode: string;
  /** National number as shown (formatted). */
  number: string;
  /** ISO country (dial codes are shared, e.g. +1 = US and Canada). */
  country?: string;
}

export interface PhoneFieldProps {
  value: PhoneValue;
  onChange: (next: PhoneValue) => void;
  label?: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  className?: string;
}

const digitsOf = (s: string) => s.replace(/\D/g, '');

export function PhoneField({ value, onChange, label = 'Phone number', hint, optional = true, error, className }: PhoneFieldProps) {
  const inputId = useId();
  const current = countryFor(value.country, value.countryCode || '+1');
  const [invalid, setInvalid] = useState(false);
  const last = useRef(value.number);
  const title = optional ? `${label} (optional)` : label;
  const shownError = error ?? (invalid ? `Enter a valid ${current.name} number.` : undefined);

  const setNumber = (raw: string) => {
    let digits = digitsOf(raw);
    // Deleting a formatting character (")", "-", " ") removes the digit before it instead.
    if (raw.length < last.current.length && digits === digitsOf(last.current)) digits = digits.slice(0, -1);
    const formatted = digits ? formatAsYouType(current.iso as CountryCode, digits) : '';
    last.current = formatted;
    setInvalid(false);
    onChange({ countryCode: current.dial, country: current.iso, number: formatted });
  };

  const pickCountry = (c: Country) => {
    const digits = digitsOf(value.number);
    const formatted = digits ? formatAsYouType(c.iso, digits) : '';
    last.current = formatted;
    setInvalid(false);
    onChange({ countryCode: c.dial, country: c.iso, number: formatted });
  };

  return (
    <div className={className} data-placeholder>
      <Input
        id={inputId}
        label={title}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={current.sample}
        value={value.number}
        error={shownError}
        hint={hint}
        leading={current.dial}
        onChange={(e) => setNumber(e.target.value)}
        onBlur={() => setInvalid(Boolean(value.number) && !isValidPhone(current.iso as CountryCode, value.number))}
        trailing={
          <span className={styles.trailing}>
            <Combobox<Country>
              label="Country code"
              items={COUNTRIES}
              value={current}
              onValueChange={pickCountry}
              itemKey={(c) => c.iso}
              itemToString={(c) => `${c.name} ${c.dial}`}
              searchPlaceholder="Search country or code"
              emptyText="No matching countries."
              renderItem={(c) => (
                <>
                  <span className={styles.rowFlag} aria-hidden>
                    {c.flag}
                  </span>
                  <span className={styles.rowLabel}>{c.name}</span>
                  <span className={styles.rowCode}>{c.dial}</span>
                </>
              )}
              trigger={
                <button type="button" className={styles.flagBtn}>
                  <span className={styles.flag} aria-hidden="true">
                    {current.flag}
                  </span>
                  <Icon name="chevronDown" size={16} />
                </button>
              }
            />
          </span>
        }
      />
    </div>
  );
}

export function formatPhone(v: PhoneValue | undefined): string | undefined {
  if (!v?.number?.trim()) return undefined;
  return `${v.countryCode || '+1'} ${v.number.trim()}`;
}
