/**
 * @screen  M-10.5 · Terms & disclaimer
 * @flow    F10 Account (opened read-only from M-1.3 in F01)
 * @states  default · scrolled to section (terms | privacy | ai)
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F10-account-privacy.md#m-105--terms--disclaimer-not-in-wireframes
 * @xref    web: W-10.5 (apps/web/screens/account/Legal)
 */
import { useEffect, useRef } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { DerivedPage } from '@web/patterns/shell';
import { useScreenParams } from '@web/navigation';
import styles from './Legal.module.css';

export default function Legal() {
  const { section } = useScreenParams<{ section: 'terms' | 'privacy' | 'ai' }>();
  const acceptedAt = useAppStore((s) => s.consentAcceptedAt);
  const version = useAppStore((s) => s.consentVersion);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const placeholder = consentDoc.status === 'placeholder' || undefined;

  useEffect(() => {
    const target = section ? refs.current[section] : null;
    const body = target?.closest('[data-scroll-body]') ?? target?.closest(`.${styles.doc}`);
    if (target && body instanceof HTMLElement) body.scrollTop = target.offsetTop - (body === target.parentElement ? 0 : body.scrollTop);
    else if (target) target.scrollIntoView({ block: 'start' });
  }, [section]);

  const docs = [
    { key: 'terms', title: consentDoc.terms.title, body: consentDoc.terms.body },
    { key: 'privacy', title: consentDoc.privacy.title, body: consentDoc.privacy.body },
    { key: 'ai', title: 'AI disclosure', body: [consentDoc.aiDisclosure] },
  ];

  return (
    <DerivedPage title="Terms & disclaimer" composerPlaceholder="Ask Oracle about your account…">
      <div className={styles.doc} data-xref="M-10.5 · Terms & disclaimer" data-scroll-body>
        {docs.map((d) => (
          <section key={d.key} ref={(el) => (refs.current[d.key] = el)} className={styles.section} data-placeholder={placeholder}>
            {/* The page title already says "Terms & disclaimer"; the first section skips its own heading (2026-10-29). */}
            {d.key !== 'terms' && <h2 className={styles.heading}>{d.title}</h2>}
            {d.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        <p className={styles.footer}>
          {acceptedAt ? `You accepted version ${version} on ${formatShortDate(acceptedAt)}.` : `Version ${consentDoc.version}.`}
        </p>
      </div>
    </DerivedPage>
  );
}
