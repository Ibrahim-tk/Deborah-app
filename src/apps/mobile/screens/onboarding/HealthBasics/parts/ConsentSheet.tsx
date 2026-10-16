/**
 * Medical-advocate consent as a bottom sheet over Health Basics (same copy + checkboxes).
 * Not dismissible by scrim — back or Continue only. Placeholder until legal review.
 */
import { Fragment, type ReactNode } from 'react';
import { consentDoc } from '@shared/data';
import { Button, Checkbox } from '@mobile/ui';
import styles from './ConsentSheet.module.css';

export interface ConsentSheetProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

/** Split `{name}` placeholders and wrap the person name at medium weight (≤500). */
function withName(template: string, who: string): ReactNode {
  const parts = template.split('{name}');
  if (parts.length === 1) return template;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <strong className={styles.name}>{who}</strong>}
      {part}
    </Fragment>
  ));
}

export function ConsentSheet({ name, value, onChange, onContinue, onBack }: ConsentSheetProps) {
  const { title, body, options } = consentDoc.profileConsent;
  const who = name.trim() || 'them';
  const canContinue = ['agreed', 'guardian', 'proxy', 'yes'].includes(value);

  return (
    <div className={styles.root} data-overlay data-placeholder>
      {/* Scrim: tap returns to the previous question (same as back). */}
      <button type="button" className={styles.scrim} onClick={onBack} aria-label="Back" />
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advocate-consent-title"
      >
        <span className={styles.handle} aria-hidden />
        <div className={styles.content}>
          <h2 id="advocate-consent-title" className={styles.title}>
            {title.replaceAll('{name}', who)}
          </h2>
          <p className={styles.body}>{withName(body, who)}</p>
          <div className={styles.checks} role="group" aria-label="Confirm your authority">
            {options.map((o) => (
              <Checkbox
                key={o.value}
                checked={value === o.value}
                onChange={(on) => onChange(on ? o.value : '')}
                label={withName(o.label, who)}
              />
            ))}
          </div>
        </div>
        <div className={styles.footer}>
          <Button fullWidth disabled={!canContinue} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
