/** @pattern AuthLayout — sign-in frame: plum brand panel leading, a single form column trailing. */
import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

const LOGO_SRC = '/images/splash/tree-of-life.svg';

export function AuthLayout({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className={styles.root}>
      <div className={styles.brand}>
        <img src={LOGO_SRC} alt="" width={48} height={48} className={styles.logo} />
        <p className={styles.brandName}>Oracle Admin</p>
        <p className={styles.brandLine}>Client management, case review and compliance for Your Oracle Clinician.</p>
      </div>
      <main className={styles.formCol}>
        <div className={styles.form}>
          <h1 className={styles.title}>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
