/** M-9.6 provider brief as a corporate report: the same content as M-9.7, laid out as a printed document. */
import type { VisitBriefContent } from '@shared/types/domain';
import { ReportFrame, ReportSection, type ReportMeta } from './ReportFrame';
import s from './Report.module.css';

export function BriefReport({ brief, date }: { brief: VisitBriefContent; date: string }) {
  const { header } = brief;
  const meta: ReportMeta[] = [
    { label: 'Patient', value: header.name },
    ...(header.dob ? [{ label: 'Date of birth', value: header.dob }] : []),
    ...(brief.providerName?.trim() ? [{ label: 'Provider', value: brief.providerName.trim() }] : []),
    ...(header.priority ? [{ label: 'Priority', value: 'Urgent — review with provider' }] : []),
    { label: 'Prepared', value: date },
  ];

  return (
    <ReportFrame title={brief.title ?? 'Notes for your provider'} purpose={header.whatThisIs} meta={meta} footer={brief.disclaimer} placeholder={brief.status === 'placeholder'}>
      <ReportSection n={1} title="Chief complaint"><p className={s.body}>{brief.chiefComplaint}</p></ReportSection>
      <ReportSection n={2} title="Context from the conversation"><p className={s.body}>{brief.clinicalContext}</p></ReportSection>
      <ReportSection n={3} title="Tests to discuss">
        {brief.labs.length === 0 ? <p className={s.muted}>No tests listed.</p> : (
          <ul className={s.table}>
            {brief.labs.map((lab) => (
              <li key={`${lab.tier}-${lab.name}`}>
                <span className={s.cellLabel}>{lab.tier === 'primary' ? 'Primary' : 'Also request'}</span>
                <span>{lab.name}{lab.reason && <span className={s.cellNote}>{lab.reason}</span>}</span>
              </li>
            ))}
          </ul>
        )}
      </ReportSection>
      <ReportSection n={4} title="Questions for the provider">
        {brief.questions.length === 0 ? <p className={s.muted}>No questions listed.</p> : (
          <ol className={s.numbered}>
            {brief.questions.map((q) => (
              <li key={q.text}>{q.text}{q.why && <span className={s.cellNote}>{q.why}</span>}</li>
            ))}
          </ol>
        )}
      </ReportSection>
      <ReportSection n={5} title="Current medications and supplements">
        {brief.medications.length === 0 ? <p className={s.muted}>None recorded.</p> : (
          <ul className={s.table}>
            {brief.medications.map((m) => (
              <li key={m.name}>
                <span className={s.cellLabel}>{m.dose || '—'}</span>
                <span>{m.name}{m.genesisGoldNote && <span className={s.cellNote}>{m.genesisGoldNote}</span>}</span>
              </li>
            ))}
          </ul>
        )}
      </ReportSection>
      <ReportSection n={6} title="Red flags screened"><p className={s.body}>{brief.redFlagsSummary}</p></ReportSection>
      <ReportSection n={7} title="Suggested next steps"><p className={s.body}>{brief.recommendation}</p></ReportSection>
    </ReportFrame>
  );
}
