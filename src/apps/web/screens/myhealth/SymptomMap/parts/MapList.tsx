/** "View as list": the same map as plain grouped text — for screen readers and anyone who prefers it. */
import { reportedInDomain, type SymptomMapResult } from '@shared/engine';
import type { SymptomMapCore, SymptomMapDomain } from '@shared/types/health';
import styles from './MapList.module.css';

interface Props {
  core: SymptomMapCore;
  domains: SymptomMapDomain[];
  result: SymptomMapResult;
}

export function MapList({ core, domains, result }: Props) {
  // Areas holding the person's symptoms first, then the rest.
  const ordered = [...domains].sort((a, b) => Number(result.domainsHit.includes(b.id)) - Number(result.domainsHit.includes(a.id)));

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h2 className={styles.title}>{core.title}</h2>
        <p className={styles.note}>{core.why}</p>
      </section>
      {ordered.map((d) => {
        const reported = reportedInDomain(d.id, result);
        return (
          <section key={d.id} className={styles.section} aria-label={d.title}>
            <h3 className={styles.area}>{d.title}</h3>
            <p className={styles.note}>{reported.length ? `${reported.length} of yours` : 'None of yours yet'}</p>
            <ul className={styles.list}>
              {d.symptoms.map((s) => (
                <li key={s} className={reported.includes(s) ? styles.reported : undefined}>
                  {s}
                  {reported.includes(s) && <span className={styles.srOnly}> (reported)</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
