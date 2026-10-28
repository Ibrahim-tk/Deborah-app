/** M-11.4 — what Deborah picked up, then "Ask Deborah to review it now?" */
import type { DocumentExtraction } from '@shared/types/domain';
import styles from '../UploadDocument.module.css';

export function ResultStep({ title, extraction, askDeborah = true }: { title: string; extraction?: DocumentExtraction; askDeborah?: boolean }) {
  return (
    <div className={styles.body}>
      <p className={styles.saved}>{`${title} is saved.`}</p>
      {extraction && extraction.fields.length > 0 && (
        <section aria-labelledby="doc-details" className={styles.details}>
          <h3 id="doc-details" className={styles.sectionTitle}>Key details</h3>
          <dl className={styles.fields}>
            {extraction.fields.map((f) => (
              <div key={f.label} className={styles.fieldRow}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {extraction.status !== 'approved' && <p className={styles.hint}>Example details for the prototype.</p>}
        </section>
      )}
      {askDeborah && <p className={styles.question}>Ask Oracle to review it now?</p>}
    </div>
  );
}
