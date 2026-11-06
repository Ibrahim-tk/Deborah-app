/**
 * Sheet content for an area: title, the person's symptoms as small pills (where they came
 * from · other areas they touch), then the rest of the area as quieter pills.
 */
import { cx } from '@shared/utils';
import { sourceOf, type SymptomMapResult } from '@shared/engine';
import type { SymptomMapDomain } from '@shared/types/health';
import styles from './Content.module.css';

interface Props {
  domains: SymptomMapDomain[];
  domain: SymptomMapDomain;
  result: SymptomMapResult;
  reported: string[];
  highlight: string[];
  onJump: (domainId: string) => void;
}

function sourceLine(sources: Set<string>, isNew: boolean): string {
  if (isNew) return 'New from this chat';
  const parts = [sources.has('profile') && 'your health profile', sources.has('chat') && 'your chats'].filter(Boolean);
  if (parts.length) return `From ${parts.join(' and ')}`;
  return '';
}

export function AreaContent({ domains, domain, result, reported, highlight, onJump }: Props) {
  const others = domain.symptoms.filter((s) => !reported.includes(s));
  const mapped = reported.map((s) => sourceOf(s, result));
  const sources = new Set(mapped.map((m) => m?.source ?? 'seed'));
  const isNew = reported.some((s) => highlight.some((h) => h.toLowerCase() === s.toLowerCase()));
  const alsoIds = new Set(mapped.flatMap((m) => m?.domainIds ?? []).filter((id) => id !== domain.id));
  const also = domains.filter((d) => alsoIds.has(d.id));
  // Seeded demo symptoms carry no source line.
  const source = sourceLine(sources, isNew);

  return (
    <>
      <h2 className={styles.title}>{domain.title}</h2>
      <section className={styles.sections} aria-label={`${domain.title} symptoms`}>
        <div className={styles.block}>
          <p className={styles.eyebrow}>Yours</p>
          {reported.length > 0 ? (
            <>
              <ul className={styles.pills}>
                {reported.map((s) => <li key={s} className={cx(styles.pill, styles.pillYours)}>{s}</li>)}
              </ul>
              {(source || also.length > 0) && (
              <p className={styles.meta}>
                {source}
                {also.length > 0 && (
                  <>
                    {source ? ' · Also in ' : 'Also in '}
                    {also.map((d, i) => (
                      <span key={d.id}>
                        {i > 0 && ', '}
                        <button type="button" className={styles.inlineLink} onClick={() => onJump(d.id)}>{d.short}</button>
                      </span>
                    ))}
                  </>
                )}
              </p>
              )}
            </>
          ) : (
            <p className={styles.none}>None of your symptoms sit here yet.</p>
          )}
        </div>
        {others.length > 0 && (
          <div className={styles.block}>
            <p className={styles.eyebrow}>Also part of this area</p>
            <ul className={styles.pills}>
              {others.map((s) => <li key={s} className={styles.pill}>{s}</li>)}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
