/**
 * @pattern InlineConsent — health-data consent + disclaimer as an inline chat widget, not a bottom sheet
 *          (design direction 2026-10-14). Privacy policy and Terms (with the disclaimer) open in a bottom sheet.
 * @usedBy  M-2.1, M-2.12 (first message after sign-up), widget lab (/wid)
 * @xref    web: — not built
 * OPEN: consent and data-protection wording is placeholder until clinical review and legal approve it.
 */
import { useRef, useState } from 'react';
import { consentDoc } from '@shared/data';
import { BottomSheet, Button, Icon } from '@web/ui';
import styles from './InlineConsent.module.css';

type Doc = 'privacy' | 'terms';
const DOCS: Record<Doc, { link: string; title: string; body: string[] }> = {
  privacy: { link: 'Privacy policy', title: consentDoc.privacy.title, body: consentDoc.privacy.body },
  // Terms carries the medical disclaimer; the AI disclosure is part of it here.
  terms: { link: 'Terms', title: 'Terms and disclaimer', body: [...consentDoc.terms.body, consentDoc.aiDisclosure] },
};

export interface InlineConsentProps {
  title?: string;
  /** null preserves a question's original wording without adding the lab's explanation. */
  description?: string | null;
  agreeLabel?: string;
  declineLabel?: string;
  disabled?: boolean;
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

export function InlineConsent({ onAgree, onDecline, answered, variant = 'row', title, description, agreeLabel, declineLabel, disabled }: InlineConsentProps) {
  const [doc, setDoc] = useState<Doc>();
  // Last opened document stays rendered while the sheet animates out.
  const [lastDoc, setLastDoc] = useState<Doc | undefined>(undefined);
  const openDoc = (d: Doc) => { setLastDoc(d); setDoc(d); };
  const shown = lastDoc ? DOCS[lastDoc] : undefined;
  const submitted = useRef(false);
  const act = (agree: boolean) => {
    if (disabled || submitted.current) return;
    submitted.current = true;
    (agree ? onAgree : onDecline)();
  };
  const link = (d: Doc) => (
    <button type="button" className={styles.link} aria-haspopup="dialog" onClick={() => openDoc(d)}>{DOCS[d].link}</button>
  );

  return (
    <section className={styles.root} data-variant={variant} aria-label="Health data consent" data-placeholder>
      <h3 className={styles.title}>{title ?? 'Can the Oracle use your health information?'}</h3>
      {description !== null && <p className={styles.body}>
        {description ?? <>Only to tailor the Oracle’s guidance. You accept our {link('privacy')} and {link('terms')}.</>}
      </p>}
      {answered ? (
        <p className={styles.done}>
          <span>{answered === 'agreed' ? 'You agreed. Thank you.' : 'Not now. Your answers stay on this phone.'}</span>
          <Icon name="check" size={16} aria-hidden />
        </p>
      ) : (
        <div className={styles.actions}>
          {variant === 'strip' ? (
            <>
              <Button size="md" disabled={disabled} className={styles.agree} onClick={() => act(true)}>{agreeLabel ?? 'Agree and continue'}</Button>
              <button type="button" disabled={disabled} className={styles.textLink} onClick={() => act(false)}>{declineLabel ?? 'Not now'}</button>
            </>
          ) : (
            <>
              <Button size={variant === 'stacked' ? 'lg' : 'md'} disabled={disabled} fullWidth className={styles.agree} onClick={() => act(true)}>{agreeLabel ?? (variant === 'stacked' ? 'Agree and continue' : 'Agree')}</Button>
              <Button size={variant === 'stacked' ? 'lg' : 'md'} disabled={disabled} variant="ghost" fullWidth className={styles.notNow} onClick={() => act(false)}>{declineLabel ?? 'Not now'}</Button>
            </>
          )}
        </div>
      )}
      <BottomSheet showClose titleEnd={<h2 id="legal-title" className={styles.sheetTitle}>{shown?.title}</h2>} open={Boolean(doc)} onClose={() => setDoc(undefined)}>
        <div className={styles.sheet} role="group" aria-labelledby="legal-title">
          <div className={styles.sheetBody}>
            {shown?.body.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
