/**
 * @screen  M-2.15 · Terms updated (re-consent)
 * @flow    Returning users when consent.json version bumps
 * @presentation modal (non-dismissible)
 * @status  placeholder
 */
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { PolicyUpdateConsent } from '@web/patterns/widgets';
import { useNav } from '@web/navigation';
import styles from './PolicyUpdate.module.css';

export default function PolicyUpdate() {
  const { open, dismissModal } = useNav();
  return (
    <div className={styles.root} data-xref="M-2.15 · Terms updated">
      <PolicyUpdateConsent
        version={consentDoc.version}
        onReviewTerms={() => open('M-10.5', { section: 'terms' })}
        onReviewPrivacy={() => open('M-10.5', { section: 'privacy' })}
        onAccept={() => {
          useAppStore.getState().acceptConsent(consentDoc.version);
          dismissModal();
        }}
      />
    </div>
  );
}
