/** @pattern Section — a titled group inside a page; space separates sections, not rules. */
import type { ReactNode } from 'react';
import styles from './Section.module.css';

export function Section({ title, trailing, children, surface }: { title: string; trailing?: ReactNode; children: ReactNode; surface?: boolean }) {
  return (
    <section className={styles.root}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {trailing}
      </div>
      <div className={surface ? styles.surface : undefined}>{children}</div>
    </section>
  );
}
