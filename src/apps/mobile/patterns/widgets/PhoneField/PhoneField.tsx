/**
 * @pattern PhoneField — one field: fixed country-code prefix (+1 by default), national number typed
 *          after it; trailing flag opens a bottom sheet with search + country codes.
 * @usedBy  M-1.4 CreateProfile · M-4.3 CreateAccount · M-10.1 Account · Widget lab · Design System
 * @status  placeholder
 */
import { useEffect, useId, useMemo, useState } from 'react';
import { cx } from '@shared/utils';
import {
  AnimatePresence,
  DURATION,
  EASE_IOS,
  Icon,
  IconButton,
  MotionDiv,
  Overlay,
  REDUCED_FADE,
  useReducedMotionPref,
} from '@mobile/ui';
import styles from './PhoneField.module.css';

export interface PhoneValue {
  countryCode: string;
  number: string;
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

const CODES = [
  { value: '+1', flag: '🇺🇸', label: 'United States / Canada', sample: '(555) 123-4567' },
  { value: '+44', flag: '🇬🇧', label: 'United Kingdom', sample: '7700 900123' },
  { value: '+61', flag: '🇦🇺', label: 'Australia', sample: '412 345 678' },
  { value: '+64', flag: '🇳🇿', label: 'New Zealand', sample: '21 123 4567' },
  { value: '+353', flag: '🇮🇪', label: 'Ireland', sample: '85 123 4567' },
  { value: '+91', flag: '🇮🇳', label: 'India', sample: '98765 43210' },
  { value: '+27', flag: '🇿🇦', label: 'South Africa', sample: '82 123 4567' },
  { value: '+49', flag: '🇩🇪', label: 'Germany', sample: '1512 3456789' },
  { value: '+33', flag: '🇫🇷', label: 'France', sample: '6 12 34 56 78' },
  { value: '+34', flag: '🇪🇸', label: 'Spain', sample: '612 34 56 78' },
  { value: '+39', flag: '🇮🇹', label: 'Italy', sample: '312 345 6789' },
  { value: '+31', flag: '🇳🇱', label: 'Netherlands', sample: '6 12345678' },
  { value: '+32', flag: '🇧🇪', label: 'Belgium', sample: '470 12 34 56' },
  { value: '+41', flag: '🇨🇭', label: 'Switzerland', sample: '78 123 45 67' },
  { value: '+43', flag: '🇦🇹', label: 'Austria', sample: '664 123456' },
  { value: '+46', flag: '🇸🇪', label: 'Sweden', sample: '70 123 45 67' },
  { value: '+47', flag: '🇳🇴', label: 'Norway', sample: '406 12 345' },
  { value: '+45', flag: '🇩🇰', label: 'Denmark', sample: '20 12 34 56' },
  { value: '+358', flag: '🇫🇮', label: 'Finland', sample: '40 123 4567' },
  { value: '+351', flag: '🇵🇹', label: 'Portugal', sample: '912 345 678' },
  { value: '+30', flag: '🇬🇷', label: 'Greece', sample: '691 234 5678' },
  { value: '+48', flag: '🇵🇱', label: 'Poland', sample: '512 345 678' },
  { value: '+420', flag: '🇨🇿', label: 'Czechia', sample: '601 123 456' },
  { value: '+36', flag: '🇭🇺', label: 'Hungary', sample: '20 123 4567' },
  { value: '+40', flag: '🇷🇴', label: 'Romania', sample: '712 345 678' },
  { value: '+380', flag: '🇺🇦', label: 'Ukraine', sample: '50 123 4567' },
  { value: '+7', flag: '🇷🇺', label: 'Russia / Kazakhstan', sample: '912 345-67-89' },
  { value: '+90', flag: '🇹🇷', label: 'Turkey', sample: '501 234 5678' },
  { value: '+972', flag: '🇮🇱', label: 'Israel', sample: '50-123-4567' },
  { value: '+971', flag: '🇦🇪', label: 'United Arab Emirates', sample: '50 123 4567' },
  { value: '+966', flag: '🇸🇦', label: 'Saudi Arabia', sample: '50 123 4567' },
  { value: '+20', flag: '🇪🇬', label: 'Egypt', sample: '100 123 4567' },
  { value: '+234', flag: '🇳🇬', label: 'Nigeria', sample: '802 123 4567' },
  { value: '+254', flag: '🇰🇪', label: 'Kenya', sample: '712 123456' },
  { value: '+55', flag: '🇧🇷', label: 'Brazil', sample: '11 91234-5678' },
  { value: '+52', flag: '🇲🇽', label: 'Mexico', sample: '55 1234 5678' },
  { value: '+54', flag: '🇦🇷', label: 'Argentina', sample: '11 2345-6789' },
  { value: '+57', flag: '🇨🇴', label: 'Colombia', sample: '300 1234567' },
  { value: '+56', flag: '🇨🇱', label: 'Chile', sample: '9 1234 5678' },
  { value: '+51', flag: '🇵🇪', label: 'Peru', sample: '912 345 678' },
  { value: '+81', flag: '🇯🇵', label: 'Japan', sample: '90-1234-5678' },
  { value: '+82', flag: '🇰🇷', label: 'South Korea', sample: '10-1234-5678' },
  { value: '+86', flag: '🇨🇳', label: 'China', sample: '131 2345 6789' },
  { value: '+852', flag: '🇭🇰', label: 'Hong Kong', sample: '5123 4567' },
  { value: '+65', flag: '🇸🇬', label: 'Singapore', sample: '8123 4567' },
  { value: '+60', flag: '🇲🇾', label: 'Malaysia', sample: '12-345 6789' },
  { value: '+66', flag: '🇹🇭', label: 'Thailand', sample: '81 234 5678' },
  { value: '+62', flag: '🇮🇩', label: 'Indonesia', sample: '812-3456-7890' },
  { value: '+63', flag: '🇵🇭', label: 'Philippines', sample: '917 123 4567' },
  { value: '+84', flag: '🇻🇳', label: 'Vietnam', sample: '91 234 56 78' },
  { value: '+92', flag: '🇵🇰', label: 'Pakistan', sample: '300 1234567' },
  { value: '+880', flag: '🇧🇩', label: 'Bangladesh', sample: '1712 345678' },
  { value: '+94', flag: '🇱🇰', label: 'Sri Lanka', sample: '71 234 5678' },
] as const;

type Code = (typeof CODES)[number]['value'];

function entryFor(code: string) {
  return CODES.find((c) => c.value === code) ?? CODES[0];
}

export function PhoneField({
  value,
  onChange,
  label = 'Phone number',
  hint,
  optional = true,
  error,
  className,
}: PhoneFieldProps) {
  const inputId = useId();
  const messageId = `${inputId}-msg`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const reduced = useReducedMotionPref();
  const code = (value.countryCode || '+1') as Code;
  const current = entryFor(code);
  const title = optional ? `${label} (optional)` : label;

  const close = () => {
    setQuery('');
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      CODES.filter(
        (c) =>
          !q ||
          c.value.includes(q) ||
          c.label.toLowerCase().includes(q) ||
          c.flag.includes(query.trim()),
      ),
    [q, query],
  );

  const slide = reduced
    ? REDUCED_FADE
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: DURATION.sheet, ease: EASE_IOS } };

  return (
    <div className={cx(styles.root, className)} data-placeholder>
      <label htmlFor={inputId} className={styles.label}>
        {title}
      </label>
      <div className={cx(styles.control, error && styles.invalid)}>
        <span className={styles.code} aria-hidden="true">
          {current.value}
        </span>
        <input
          id={inputId}
          className={styles.number}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={current.sample}
          value={value.number}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          onChange={(e) => onChange({ ...value, number: e.target.value.replace(/[^\d\s()-]/g, '') })}
        />
        <button
          type="button"
          className={styles.flagBtn}
          aria-label="Country code"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <span className={styles.flag} aria-hidden="true">
            {current.flag}
          </span>
          <Icon name="chevronDown" size={16} />
        </button>
      </div>
      {error ? (
        <p id={messageId} className={styles.error} role="alert">
          <Icon name="alert" size={18} /> {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className={styles.hint}>
            {hint}
          </p>
        )
      )}

      <Overlay>
        <AnimatePresence>
          {open && (
            <div className={styles.layer} key="country-sheet">
              <MotionDiv
                className={styles.scrim}
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
              />
              <MotionDiv className={styles.panel} role="dialog" aria-modal="true" aria-label="Country code" {...slide}>
                <span className={styles.grabber} aria-hidden />
                <header className={styles.head}>
                  <h2 className={styles.sheetTitle}>Country code</h2>
                  <IconButton icon="close" label="Close" className={styles.close} onClick={close} />
                </header>
                <label className={styles.search}>
                  <Icon name="search" size={18} />
                  <input
                    className={styles.searchInput}
                    value={query}
                    placeholder="Search country or code"
                    aria-label="Search country or code"
                    autoFocus
                    enterKeyHint="search"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <div className={styles.list} role="listbox" aria-label="Country codes">
                  {filtered.map((c) => {
                    const selected = c.value === code;
                    return (
                      <button
                        key={`${c.value}-${c.label}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={styles.row}
                        data-selected={selected || undefined}
                        onClick={() => {
                          onChange({ ...value, countryCode: c.value });
                          close();
                        }}
                      >
                        <span className={styles.rowFlag} aria-hidden>
                          {c.flag}
                        </span>
                        <span className={styles.rowCode}>{c.value}</span>
                        <span className={styles.rowLabel}>{c.label}</span>
                        {selected && <Icon name="check" size={18} className={styles.rowCheck} />}
                      </button>
                    );
                  })}
                  {!filtered.length && <p className={styles.empty}>No matching countries.</p>}
                </div>
              </MotionDiv>
            </div>
          )}
        </AnimatePresence>
      </Overlay>
    </div>
  );
}

export function formatPhone(v: PhoneValue | undefined): string | undefined {
  if (!v?.number?.trim()) return undefined;
  return `${v.countryCode || '+1'} ${v.number.trim()}`;
}
