/** @pattern Section — a titled group inside a page; space separates sections, not rules. */
import type { ReactNode } from 'react';
import styles from './Section.module.css';

/** `description`: one supporting line set tight under the title. */
export function Section({ title, description, trailing, children, surface }: { title: string; description?: ReactNode; trailing?: ReactNode; children: ReactNode; surface?: boolean }) {
  return (
    <section className={styles.root} data-section="">
      <div className={styles.head}>
        <div className={styles.titles}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {trailing}
      </div>
      <div className={surface ? styles.surface : styles.body}>{children}</div>
    </section>
  );
}
