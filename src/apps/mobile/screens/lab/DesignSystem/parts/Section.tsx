/** Design system section: Cormorant heading, one-line lede, and its content. The id is the sidebar anchor. */
import type { ReactNode } from 'react';
import styles from './parts.module.css';

export interface SectionProps {
  id: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}

export function Section({ id, title, lede, children }: SectionProps) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.sectionTitle}>{title}</h2>
      {lede && <p className={styles.lede}>{lede}</p>}
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

/** A sub-heading inside a section (e.g. "Surfaces" under Colour). */
export function Group({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      {note && <p className={styles.groupNote}>{note}</p>}
      {children}
    </div>
  );
}
