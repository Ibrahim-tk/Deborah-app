/**
 * @screen  M-1.5 · Terms / Privacy sheet
 * @flow    F01 First launch & onboarding
 * @presentation sheet over Welcome (M-1.2), from its "terms and services" / "Privacy Notice" links
 * @states  terms · privacy
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md (OPEN: add M-1.5)
 * @xref    web: W-1.5 — not built · full document: M-10.5 Legal
 *
 * A standard heading and body text, nothing else. Copy: data/legal/consent.json (placeholder).
 */
import { consentDoc } from '@shared/data';
import { Button, Sheet } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './LegalSheet.module.css';

export default function LegalSheet() {
  const { dismissSheet } = useNav();
  const { section = 'terms' } = useScreenParams<{ section: 'terms' | 'privacy' }>();
  const doc = section === 'privacy' ? consentDoc.privacy : consentDoc.terms;
  return (
    <div data-xref="M-1.5 · Terms / Privacy sheet">
      <Sheet title={doc.title} detent="large" footer={<Button fullWidth onClick={dismissSheet}>Done</Button>}>
        <div className={styles.body} data-placeholder={consentDoc.status === 'placeholder' || undefined}>
          {doc.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
