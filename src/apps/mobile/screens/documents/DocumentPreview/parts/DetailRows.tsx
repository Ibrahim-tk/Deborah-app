/** A labelled list of label → value rows (metadata, extracted details). */
import styles from '../DocumentPreview.module.css';

export function DetailRows({ label, rows, footnote }: { label: string; rows: [string, string][]; footnote?: string }) {
  return (
    <section className={styles.section} aria-label={label}>
      <h2 className={styles.sectionTitle}>{label}</h2>
      <dl className={styles.rows}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.row}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </section>
  );
}
