/**
 * @pattern BriefDocument — printable My Visit Notes sections (Miro Step 5)
 * @usedBy  M-9.7, M-9.6
 * @spec    docs/ux/F09b-visit-brief.md
 */
import type { VisitBriefContent } from '@shared/types/domain';
import { BriefLabs, BriefMeds, BriefQuestions } from './BriefLists';
import { TextArea } from '@mobile/ui';
import styles from './BriefDocument.module.css';

export interface BriefDocumentProps {
  brief: VisitBriefContent;
  /** When set, chief complaint + lists are editable (review mode). */
  onChange?: (brief: VisitBriefContent) => void;
}

export function BriefDocument({ brief, onChange }: BriefDocumentProps) {
  const { header } = brief;
  const editable = Boolean(onChange);
  const patch = (p: Partial<VisitBriefContent>) => onChange?.({ ...brief, ...p });

  return (
    <article className={styles.page} aria-label="My Visit Notes" data-placeholder={brief.status === 'placeholder' || undefined}>
      <header className={styles.pageHeader}>
        <p className={styles.brand}>Your Oracle Clinician · Pre-visit brief</p>
        <h2 className={styles.h2}>For My Provider</h2>
        <p className={styles.purpose}>{header.whatThisIs}</p>
        <dl className={styles.meta}>
          <div>
            <dt>Patient</dt>
            <dd>{header.name}</dd>
          </div>
          {header.dob && (
            <div>
              <dt>Date of birth</dt>
              <dd>{header.dob}</dd>
            </div>
          )}
          {header.priority && (
            <div>
              <dt>Priority</dt>
              <dd>Urgent — review with clinician</dd>
            </div>
          )}
        </dl>
      </header>

      <section className={styles.block}>
        <h3 className={styles.h3}>1. Chief Complaint</h3>
        {editable ? (
          <TextArea
            className={styles.edit}
            label="Chief complaint"
            minRows={4}
            maxRows={10}
            value={brief.chiefComplaint}
            onChange={(e) => patch({ chiefComplaint: e.target.value })}
          />
        ) : (
          <p className={styles.body}>{brief.chiefComplaint}</p>
        )}
      </section>

      <section className={styles.block}>
        <h3 className={styles.h3}>2. Clinical Context — What Deborah AI Identified</h3>
        <p className={styles.body}>{brief.clinicalContext}</p>
      </section>

      {editable ? (
        <BriefLabs brief={brief} onChange={patch} />
      ) : (
        <section className={styles.block}>
          <h3 className={styles.h3}>3. Tests to Discuss</h3>
          {brief.labs.length === 0 ? (
            <p className={styles.muted}>No tests listed from this conversation.</p>
          ) : (
            <ul className={styles.list}>
              {brief.labs.map((lab) => (
                <li key={`${lab.tier}-${lab.name}`}>
                  <span className={styles.tier}>{lab.tier === 'primary' ? 'Primary' : 'Also request'}</span>
                  <span className={styles.itemTitle}>{lab.name}</span>
                  {lab.reason && <span className={styles.why}>{lab.reason}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {editable ? (
        <BriefQuestions brief={brief} onChange={patch} />
      ) : (
        <section className={styles.block}>
          <h3 className={styles.h3}>4. Questions for My Provider</h3>
          {brief.questions.length === 0 ? (
            <p className={styles.muted}>No questions listed from this conversation.</p>
          ) : (
            <ol className={styles.numbered}>
              {brief.questions.map((q) => (
                <li key={q.text}>
                  <span className={styles.itemTitle}>{q.text}</span>
                  {q.why && <span className={styles.why}>{q.why}</span>}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {editable ? (
        <BriefMeds brief={brief} onChange={patch} />
      ) : (
        <section className={styles.block}>
          <h3 className={styles.h3}>5. Current Medications & Supplements</h3>
          {brief.medications.length === 0 ? (
            <p className={styles.muted}>None on the Health Profile.</p>
          ) : (
            <ul className={styles.list}>
              {brief.medications.map((m) => (
                <li key={m.name} className={m.genesisGoldNote ? styles.gold : undefined}>
                  <span className={styles.itemTitle}>{m.name}{m.dose ? ` · ${m.dose}` : ''}</span>
                  {m.genesisGoldNote && <span className={styles.why}>{m.genesisGoldNote}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className={styles.block}>
        <h3 className={styles.h3}>6. Red Flags — Screened by Deborah AI</h3>
        <p className={styles.body}>{brief.redFlagsSummary}</p>
      </section>

      <section className={styles.block}>
        <h3 className={styles.h3}>7. Deborah AI’s Recommendation</h3>
        <p className={styles.body}>{brief.recommendation}</p>
      </section>

      <footer className={styles.disclaimer}>
        <ul>
          {brief.disclaimer.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
