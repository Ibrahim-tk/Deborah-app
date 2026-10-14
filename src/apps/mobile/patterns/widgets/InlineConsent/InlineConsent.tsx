/**
 * @pattern InlineConsent — health-data consent + disclaimer as an inline chat widget, not a bottom sheet
 *          (design direction 2026-10-14). Privacy policy and Terms open as plain text inside the card.
 * @usedBy  M-2.1, M-2.12 (first message after sign-up), widget lab (/wid)
 * @xref    web: — not built
 * OPEN: consent and data-protection wording is placeholder until Deborah and legal approve it.
 */
import { useState } from 'react';
import { consentDoc } from '@shared/data';
import { Button, Icon } from '@mobile/ui';
import styles from './InlineConsent.module.css';

type Doc = 'privacy' | 'terms';
const DOCS: Record<Doc, { link: string; title: string; body: string[] }> = {
  privacy: { link: 'Privacy policy', title: consentDoc.privacy.title, body: consentDoc.privacy.body },
  // Terms carries the medical disclaimer; the AI disclosure is part of it here.
  terms: { link: 'Terms', title: consentDoc.terms.title, body: [...consentDoc.terms.body, consentDoc.aiDisclosure] },
};

export interface InlineConsentProps {
  onAgree: () => void;
  onDecline: () => void;
  /** After a choice: the card stays in the thread as a quiet record. */
  answered?: 'agreed' | 'declined';
  /**
   * Layout exploration (2026-10-14), compared in the widget lab (/wid):
   * `row` (default, chosen 2026-10-14) compact, actions side by side · `stacked` · `strip` plum rule, one action + text link ·
   * `dark` midnight card, highest contrast.
   */
  variant?: 'stacked' | 'row' | 'strip' | 'dark';
}

export function InlineConsent({ onAgree, onDecline, answered, variant = 'row' }: InlineConsentProps) {
  const [doc, setDoc] = useState<Doc>();
  const link = (d: Doc) => (
    <button type="button" className={styles.link} aria-expanded={doc === d} onClick={() => setDoc(doc === d ? undefined : d)}>{DOCS[d].link}</button>
  );

  return (
    <section className={styles.root} data-variant={variant} aria-label="Health data consent" data-placeholder>
      <h3 className={styles.title}>Can I use your health details?</h3>
      <p className={styles.body}>
        Only to tailor my guidance. You accept our {link('privacy')} and {link('terms')}.
      </p>
      {doc && (
        <div key={doc} className={styles.doc}>
          <p className={styles.docTitle}>{DOCS[doc].title}</p>
          {DOCS[doc].body.map((p) => <p key={p}>{p}</p>)}
        </div>
      )}
      {answered ? (
        <p className={styles.done}><Icon name="check" size={16} /> {answered === 'agreed' ? 'You agreed. Thank you.' : 'Not now. Your answers stay on this phone.'}</p>
      ) : (
        <div className={styles.actions}>
          {variant === 'strip' ? (
            <>
              <Button size="md" className={styles.agree} onClick={onAgree}>Agree and continue</Button>
              <button type="button" className={styles.textLink} onClick={onDecline}>Not now</button>
            </>
          ) : (
            <>
              <Button size={variant === 'stacked' ? 'lg' : 'md'} fullWidth className={styles.agree} onClick={onAgree}>{variant === 'stacked' ? 'Agree and continue' : 'Agree'}</Button>
              <Button size={variant === 'stacked' ? 'lg' : 'md'} variant="ghost" fullWidth className={styles.notNow} onClick={onDecline}>Not now</Button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
