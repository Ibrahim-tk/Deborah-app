/** Single-answer summary as a corporate report: provider questions, tests, section summary, closing line. */
import { consentDoc } from '@shared/data';
import type { Answer } from '@shared/types/domain';
import { firstSentence } from './resolveSource';
import { ReportFrame, ReportSection } from './ReportFrame';
import s from './Report.module.css';

export interface PdfPageProps {
  answer: Answer;
  profileName: string;
  date: string;
  topic?: string;
}

const LISTED = new Set(['providerQuestions', 'tests']);

export function PdfPage({ answer, profileName, date, topic }: PdfPageProps) {
  const section = (key: string) => answer.sections.find((x) => x.key === key);
  const others = answer.sections.filter((x) => !LISTED.has(x.key));
  const questions = section('providerQuestions')?.bullets ?? [];
  const tests = section('tests')?.bullets ?? [];
  let n = 0;

  return (
    <ReportFrame
      title={topic ?? 'Conversation summary'}
      meta={[{ label: 'Prepared for', value: profileName }, { label: 'Prepared', value: date }]}
      footer={[consentDoc.aiDisclosureShort, consentDoc.careLine]}
      placeholder={answer.status === 'placeholder'}
    >
      {questions.length > 0 && (
        <ReportSection n={++n} title="Questions for the provider">
          <ol className={s.numbered}>{questions.map((q) => <li key={q}>{q}</li>)}</ol>
        </ReportSection>
      )}
      {tests.length > 0 && (
        <ReportSection n={++n} title="Tests to discuss">
          <ul className={s.table}>{tests.map((t) => <li key={t}><span className={s.cellLabel}>Test</span><span>{t}</span></li>)}</ul>
        </ReportSection>
      )}
      <ReportSection n={++n} title="Summary">
        <ul className={s.table}>
          {others.map((x) => (
            <li key={x.key}><span className={s.cellLabel}>{x.title}</span><span>{firstSentence(x.body)}</span></li>
          ))}
        </ul>
      </ReportSection>
      {answer.closingLine && <p className={s.muted}>{answer.closingLine}</p>}
    </ReportFrame>
  );
}
