/**
 * Sheet content for an area, written around the person (designer, 2026-11-06: "nothing relevant with me").
 * Reads top-down as three answers: what is this area · which of my symptoms point here · how they connect.
 * The area's other signs follow, always shown. Left-aligned throughout (designer, 2026-11-07).
 */
import { cx } from '@shared/utils';
import { sourceOf, type SymptomMapResult } from '@shared/engine';
import type { SymptomMapDomain } from '@shared/types/health';
import styles from './Content.module.css';

interface Props {
  domain: SymptomMapDomain;
  result: SymptomMapResult;
  reported: string[];
  highlight: string[];
}

function sourceText(sources: Set<string>, isNew: boolean): string {
  if (isNew) return ' · new from this chat';
  if (sources.has('profile') && sources.has('chat')) return ' · from your health profile and chats';
  if (sources.has('profile')) return ' · from your health profile';
  if (sources.has('chat')) return ' · from your chats';
  return '';
}

export function AreaContent({ domain, result, reported, highlight }: Props) {
  const others = domain.symptoms.filter((s) => !reported.includes(s));
  const mapped = reported.map((s) => ({ label: s, src: sourceOf(s, result) }));
  const sources = new Set(mapped.map((m) => m.src?.source ?? 'seed'));
  const isNew = reported.some((s) => highlight.some((h) => h.toLowerCase() === s.toLowerCase()));
  const n = reported.length;

  return (
    <>
      {/* The area's name sits on the disc; the sheet leads with what it means (designer, 2026-11-07). */}
      <h2 className={styles.question}>{domain.plain}</h2>

      <section className={styles.sections} aria-label={`Your symptoms in ${domain.short}`}>
        <div className={styles.block}>
          <p className={styles.statement}>
            Your symptoms
            {n > 0 && <span className={styles.statementSource}>{sourceText(sources, isNew)}</span>}
          </p>
          {n === 0 && <p className={styles.none}>None here yet</p>}
          {n > 0 && (
            <ul className={styles.pills}>
              {reported.map((s) => <li key={s} className={cx(styles.pill, styles.pillYours)}>{s}</li>)}
            </ul>
          )}
        </div>

        {others.length > 0 && (
          <div className={styles.block}>
            <p className={styles.eyebrow}>Other signs in this area</p>
            <ul className={styles.pills}>
              {others.map((s) => <li key={s} className={styles.pill}>{s}</li>)}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
