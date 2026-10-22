/** The white A4 page: header, provider questions, tests, section summary, closing line, disclaimer. */
import { consentDoc, persona } from '@shared/data';
import type { Answer } from '@shared/types/domain';
import { firstSentence } from './resolveSource';
import styles from '../PdfPreview.module.css';

export interface PdfPageProps {
  answer: Answer;
  profileName: string;
  date: string;
  topic?: string;
}

const LISTED = new Set(['providerQuestions', 'tests']);

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.block}>
      <h3 className={styles.h3}>{title}</h3>
      <ul className={styles.bullets}>
        {items.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </section>
  );
}

export function PdfPage({ answer, profileName, date, topic }: PdfPageProps) {
  const section = (key: string) => answer.sections.find((s) => s.key === key);
  const others = answer.sections.filter((s) => !LISTED.has(s.key));
  const placeholder = answer.status === 'placeholder' || undefined;

  return (
    <article className={styles.page} aria-label="Printable summary" data-placeholder={placeholder}>
      <header className={styles.pageHeader}>
        <p className={styles.brand}>{persona.brand.appName}</p>
        <h2 className={styles.h2}>{topic ?? 'Consultation summary'}</h2>
        <p className={styles.small}>{`${profileName} · ${date}`}</p>
      </header>

      <Bullets title="Questions for your provider" items={section('providerQuestions')?.bullets ?? []} />
      <Bullets title="Tests worth discussing" items={section('tests')?.bullets ?? []} />

      <section className={styles.block}>
        <h3 className={styles.h3}>Summary</h3>
        <dl className={styles.summary}>
          {others.map((s) => (
            <div key={s.key}>
              <dt className={styles.dt}>{s.title}</dt>
              <dd className={styles.dd}>{firstSentence(s.body)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className={styles.closing}>{answer.closingLine}</p>

      <footer className={styles.disclaimer}>
        {`${consentDoc.aiDisclosureShort} ${consentDoc.summaryBullets[1] ?? ''}`.trim()}
      </footer>
    </article>
  );
}
