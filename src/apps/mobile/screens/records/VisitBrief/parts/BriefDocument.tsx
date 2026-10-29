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
  /** Straight on the page, no card surface (M-9.7, design 2026-10-20). The PDF keeps the card. */
  flat?: boolean;
}

export function BriefDocument({ brief, onChange, flat }: BriefDocumentProps) {
  const { header } = brief;
  const editable = Boolean(onChange);
  const patch = (p: Partial<VisitBriefContent>) => onChange?.({ ...brief, ...p });

  return (
    <article className={styles.page} data-flat={flat || undefined} aria-label="My Visit Notes" data-placeholder={brief.status === 'placeholder' || undefined}>
      <header className={styles.pageHeader}>
        {/* M-9.7 drops the purpose line (design 2026-10-20); the PDF keeps it. */}
        {!flat && <p className={styles.purpose}>{header.whatThisIs}</p>}
        <dl className={styles.meta}>
          <div>
            <dt>Patient</dt>
            <dd>{header.name}</dd>
          </div>
          {brief.providerName?.trim() && (
            <div>
              <dt>Provider</dt>
              <dd>{brief.providerName.trim()}</dd>
            </div>
          )}
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
        <h3 className={styles.h3}>2. Context from the Conversation</h3>
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
        <h3 className={styles.h3}>6. Red Flags — Screened by the Oracle</h3>
        <p className={styles.body}>{brief.redFlagsSummary}</p>
      </section>

      <section className={styles.block}>
        <h3 className={styles.h3}>7. The Oracle’s Recommendation</h3>
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
