/** One framework, laid out to scan: flag and name, two headline facts (delete data, breach notice), then a
 *  checklist of what it requires. Legal summaries are placeholder until reviewed (CLAUDE.md §9). */
import type { ComplianceFramework } from '@shared/admin';
import { Icon, StatusText } from '@admin/ui';
import styles from './FrameworkCard.module.css';

export function FrameworkCard({ framework: f }: { framework: ComplianceFramework }) {
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <span className={styles.mark} aria-hidden>
          {f.flag ? <span className={styles.flag}>{f.flag}</span> : <Icon name="shield" size={24} />}
        </span>
        <div className={styles.titles}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{f.name}</h3>
            {f.state === 'applies' ? <StatusText tone="success">Applies</StatusText> : <StatusText tone="info">In progress</StatusText>}
          </div>
          <p className={styles.region}>{f.region}</p>
        </div>
      </header>
      <p className={styles.full}>{f.fullName}</p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Delete data</dt>
          <dd className={styles.factValue}>{f.deletionShort}</dd>
          <dd className={styles.factNote}>{f.deletionWindow}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Breach notice</dt>
          <dd className={styles.factValue}>{f.breachShort}</dd>
          <dd className={styles.factNote}>{f.breachNotice}</dd>
        </div>
      </dl>

      <div className={styles.req}>
        <p className={styles.reqTitle}>What it requires</p>
        <ul className={styles.list}>
          {f.obligations.map((o) => (
            <li key={o}>
              <Icon name="check" size={16} className={styles.tick} />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
