/**
 * Health-data consent as our own bottom sheet (not a system alert): one short line with the Privacy policy
 * and Terms as inline links (they open as plain text inside the same sheet, at the same height).
 * Shown once, on the first message after sign-up's health basics (M-1.8).
 * OPEN: consent and data-protection wording is placeholder until Deborah and legal approve it.
 */
import { useRef, useState } from 'react';
import { consentDoc } from '@shared/data';
import { Button, IconButton } from '@mobile/ui';
import styles from './ConsentSheet.module.css';

type Doc = 'privacy' | 'terms';

export interface ConsentSheetProps {
  onAgree: () => void;
  onDecline: () => void;
}

const DOCS: Record<Doc, { link: string; title: string; body: string[] }> = {
  privacy: { link: 'Privacy policy', title: consentDoc.privacy.title, body: consentDoc.privacy.body },
  // Terms carries the medical disclaimer; the AI disclosure is part of it here.
  terms: { link: 'Terms', title: consentDoc.terms.title, body: [...consentDoc.terms.body, consentDoc.aiDisclosure] },
};

export function ConsentSheet({ onAgree, onDecline }: ConsentSheetProps) {
  const [doc, setDoc] = useState<Doc>();
  // The sheet keeps the consent view's height when a document opens; the document scrolls inside it.
  const sheetRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const openDoc = (d: Doc) => {
    setHeight(sheetRef.current?.offsetHeight);
    setDoc(d);
  };
  const link = (d: Doc) => (
    <button type="button" className={styles.link} onClick={() => openDoc(d)}>{DOCS[d].link}</button>
  );

  return (
    <div className={styles.root}>
      <button type="button" className={styles.scrim} onClick={onDecline} aria-label="Not now" />
      <div ref={sheetRef} className={styles.sheet} style={doc && height ? { height } : undefined} role="dialog" aria-modal="true" aria-labelledby="consent-title" data-placeholder>
        <span className={styles.handle} aria-hidden />
        {doc ? (
          <div key={doc} className={styles.view}>
            <div className={styles.docHead}>
              <IconButton icon="back" label="Back to consent" onClick={() => setDoc(undefined)} />
              <h2 id="consent-title" className={styles.docTitle}>{DOCS[doc].title}</h2>
            </div>
            <div className={styles.docBody}>
              {DOCS[doc].body.map((p) => <p key={p}>{p}</p>)}
            </div>
          </div>
        ) : (
          <div key="consent" className={styles.view}>
            <h2 id="consent-title" className={styles.title}>Can I use your health details?</h2>
            <p className={styles.body}>
              By agreeing, you accept our {link('privacy')} and {link('terms')}.
            </p>
            <div className={styles.actions}>
              <Button fullWidth onClick={onAgree}>Agree and continue</Button>
              <Button variant="ghost" fullWidth onClick={onDecline}>Not now</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
