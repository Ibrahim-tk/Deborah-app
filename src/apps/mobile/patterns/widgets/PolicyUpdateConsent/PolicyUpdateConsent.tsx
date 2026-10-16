/**
 * @pattern PolicyUpdateConsent — returning-user re-consent when legal version bumps.
 * @usedBy  Navigator soft gate · Widget lab
 * @status  placeholder
 */
import { useState } from 'react';
import { Button } from '@mobile/ui';
import styles from './PolicyUpdateConsent.module.css';

export interface PolicyUpdateConsentProps {
  version: string;
  onReviewTerms: () => void;
  onReviewPrivacy: () => void;
  onAccept: () => void;
}

export function PolicyUpdateConsent({ version, onReviewTerms, onReviewPrivacy, onAccept }: PolicyUpdateConsentProps) {
  const [checked, setChecked] = useState(false);
  return (
    <div className={styles.root} role="dialog" aria-labelledby="policy-update-title" data-placeholder>
      <h2 id="policy-update-title" className={styles.title}>
        Terms updated
      </h2>
      <p className={styles.body}>
        We’ve updated our Terms & Disclaimer and Privacy Notice (version {version}). Please review and accept to keep using Your
        Oracle Clinician.
      </p>
      <div className={styles.links}>
        <button type="button" className={styles.link} onClick={onReviewTerms}>
          Review Terms & Disclaimer
        </button>
        <button type="button" className={styles.link} onClick={onReviewPrivacy}>
          Review Privacy Notice
        </button>
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span>I have reviewed and accept the updated terms</span>
      </label>
      <Button fullWidth disabled={!checked} onClick={onAccept}>
        Continue
      </Button>
    </div>
  );
}
