/**
 * @pattern BrandNav — preauth logo bar. Canvas fade top → transparent; logo only.
 */
import { persona } from '@shared/data';
import styles from './BrandNav.module.css';

const LOGO_SRC = '/images/splash/tree-of-life.svg';

export function BrandNav() {
  return (
    <header className={styles.bar} aria-label={`${persona.brand.appName} brand`}>
      <div className={styles.fade} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img className={styles.logo} src={LOGO_SRC} alt="" width={44} height={44} />
          <span className={styles.name}>{persona.brand.appName}</span>
        </div>
      </div>
    </header>
  );
}
