/**
 * @pattern PageFooter — one centred copyright line pinned to the bottom of a full-page screen
 *          (Welcome, Health Basics). Muted ink; transparent so it sits on the page's own background.
 * @usedBy  M-1.2 Welcome · M-1.8 Health Basics (same line as the landing footer)
 */
import styles from './PageFooter.module.css';

export function PageFooter() {
  return (
    <footer className={styles.root}>
      <span>© {new Date().getFullYear()} Your Oracle. All rights reserved.</span>
      <nav className={styles.links}>
        <a className={styles.link} href="#">Privacy Policy</a>
        <a className={styles.link} href="#">Terms</a>
      </nav>
    </footer>
  );
}
