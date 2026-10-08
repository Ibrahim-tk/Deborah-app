/**
 * @screen  M-1.3 · Before we begin
 * @flow    F01 First launch & onboarding
 * @states  unchecked (button disabled) · checked · reading terms (modal)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184
 * @spec    docs/ux/F01-onboarding.md#m-13--before-we-begin-consent
 * @xref    web: W-1.3 (apps/web/screens/onboarding/Consent) — not built
 */
import { useState } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Button, Card, Checkbox, Header, ListRow, Panel } from '@mobile/ui';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './Consent.module.css';

export default function Consent() {
  const { pop, open, resetTo } = useNav();
  const { previousTitle } = useRoute();
  const acceptConsent = useAppStore((s) => s.acceptConsent);
  const [agreed, setAgreed] = useState(false);
  const placeholder = consentDoc.status === 'placeholder' || undefined;

  const start = () => {
    acceptConsent(consentDoc.version);
    resetTo('main', 'M-2.0');
  };

  return (
    <div className={styles.root} data-xref="M-1.3 · Before we begin">
      <Header title="Before we begin" onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        <Card>
          <ul className={styles.bullets} data-placeholder={placeholder}>
            {consentDoc.summaryBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Card>
        <Panel tone="lilac" icon="info">
          <p className={styles.callout} data-placeholder={placeholder}>{consentDoc.aiDisclosure}</p>
        </Panel>
        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          label={
            <>
              I have read and agree to the{' '}
              <button
                type="button"
                className={styles.inlineLink}
                onClick={(e) => {
                  // Opening the terms must not toggle the checkbox.
                  e.preventDefault();
                  e.stopPropagation();
                  open('M-10.5', { section: 'terms' });
                }}
              >
                {consentDoc.terms.title}
              </button>
            </>
          }
        />
        <div className={styles.privacy}>
          <ListRow title="How your health data is protected" subtitle="HIPAA / CCPA" onPress={() => open('M-10.5', { section: 'privacy' })} />
        </div>
      </div>
      <div className={styles.footer}>
        <Button fullWidth disabled={!agreed} onClick={start}>
          I agree, let’s start
        </Button>
      </div>
    </div>
  );
}
