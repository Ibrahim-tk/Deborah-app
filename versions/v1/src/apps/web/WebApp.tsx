/**
 * @app WebApp — desktop web app. Reserved: empty until a web spec exists (docs/web/README.md).
 * Must not import from apps/mobile or reuse mobile token files (docs/12-design-system.md §6).
 */
import styles from './WebApp.module.css';

export default function WebApp() {
  return (
    <div className={styles.placeholder}>
      <p>Web app — not started. See docs/web/README.md</p>
    </div>
  );
}
