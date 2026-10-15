/** Generic mock page for non-shop links (e.g. the drugs.com interaction checker). Never loads the real site. */
import styles from './InAppShop.module.css';

export function MockPage({ title, host }: { title: string; host: string }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.name}>{title}</h1>
      <p className={styles.description}>This is a mock of {host} for the prototype. The real site opens here in the app.</p>
    </main>
  );
}
