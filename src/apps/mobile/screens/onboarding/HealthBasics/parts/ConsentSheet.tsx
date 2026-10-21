/**
 * Medical-advocate consent on the shared ui/BottomSheet over Health Basics (same copy + checkboxes).
 * Drag, scrim tap or Escape go back a question (same as back); Continue moves on. Placeholder until legal review.
 */
import { properName } from '@shared/utils';
import { Fragment, type ReactNode } from 'react';
import { consentDoc } from '@shared/data';
import { BottomSheet, Button, Checkbox } from '@mobile/ui';
import styles from './ConsentSheet.module.css';

export interface ConsentSheetProps {
  open: boolean;
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

export function ConsentSheet({ open, name, value, onChange, onContinue, onBack }: ConsentSheetProps) {
  const { title, body, options } = consentDoc.profileConsent;
  const who = properName(name.trim()) || 'them';
  const canContinue = ['agreed', 'guardian', 'proxy', 'yes'].includes(value);

  return (
    <BottomSheet
      open={open}
      onClose={onBack}
      title={title.replaceAll('{name}', who)}
      footer={
        <Button fullWidth disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      }
    >
      <div className={styles.content} data-placeholder>
        <p className={styles.body}>{withName(body, who)}</p>
        <div className={styles.checks} role="group" aria-label="Confirm your authority">
          {options.map((o) => (
            <Checkbox
              key={o.value}
              emphasis
              checked={value === o.value}
              onChange={(on) => onChange(on ? o.value : '')}
              label={withName(o.label, who)}
            />
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
