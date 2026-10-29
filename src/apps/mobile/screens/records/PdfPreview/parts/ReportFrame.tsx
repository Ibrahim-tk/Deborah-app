/**
 * Corporate report page for M-9.6 (designer, 2026-10-29): letterhead, document-control table, numbered
 * sections with hairline rules and a page footer. Plain and document-like — no cards, tints or chat styling.
 */
import type { ReactNode } from 'react';
import { persona } from '@shared/data';
import styles from './Report.module.css';

export interface ReportMeta { label: string; value: string }

export interface ReportFrameProps {
  title: string;
  /** Document-control rows, e.g. Patient · Date of birth · Prepared. */
  meta: ReportMeta[];
  /** One line under the letterhead saying what the document is. */
  purpose?: string;
  footer: string[];
  placeholder?: boolean;
  children: ReactNode;
}

export function ReportFrame({ title, meta, purpose, footer, placeholder, children }: ReportFrameProps) {
  return (
    <article className={styles.page} aria-label={title} data-placeholder={placeholder || undefined}>
      <header className={styles.letterhead}>
        <p className={styles.org}>{persona.brand.appName}</p>
        <p className={styles.docType}>Health education summary</p>
      </header>
      <h2 className={styles.title}>{title}</h2>
      {purpose && <p className={styles.purpose}>{purpose}</p>}
      <dl className={styles.meta}>
        {meta.map((m) => (
          <div key={m.label} className={styles.metaRow}>
            <dt>{m.label}</dt>
            <dd>{m.value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.sections}>{children}</div>
      <footer className={styles.footer}>
        {footer.map((line) => <p key={line}>{line}</p>)}
        <p className={styles.pageNo}>Page 1 of 1</p>
      </footer>
    </article>
  );
}

export function ReportSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.h3}><span className={styles.num}>{String(n).padStart(2, '0')}</span>{title}</h3>
      {children}
    </section>
  );
}

