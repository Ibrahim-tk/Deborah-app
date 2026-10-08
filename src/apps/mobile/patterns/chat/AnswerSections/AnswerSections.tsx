/**
 * @pattern AnswerSections — 7-section Deborah answer, fixed order, product slot in §6
 * @usedBy  M-2.1, M-9.2
 * @spec    docs/ux/F02-consultation.md#answer-sections · DESIGN.md › Answer sections
 * @xref    web: apps/web/patterns/chat/AnswerSections — not built
 */
import { useState, type ReactNode } from 'react';
import type { Answer, SectionKey } from '@shared/types/domain';
import { Button, Icon } from '@mobile/ui';
import { Section } from './Section';
import styles from './AnswerSections.module.css';

export interface AnswerSectionsProps {
  answer: Answer;
  streaming?: boolean;
  activeSection?: SectionKey;
  /** Rendered at the end of §6 once that section has finished streaming. */
  productSlot?: ReactNode;
  onAddQuestion?: (question: string) => void;
  /** Lab-informed answer: "Based on your labs from {date}" as plain text (no tag). */
  labsNote?: string;
}

const DEFAULT_OPEN: SectionKey[] = ['hearing'];

export function AnswerSections({ answer, streaming, activeSection, productSlot, onAddQuestion, labsNote }: AnswerSectionsProps) {
  const [userOpen, setOpen] = useState<SectionKey[]>(DEFAULT_OPEN);
  // While streaming, the streaming section is open and the previous one collapses (except §1).
  const open = streaming && activeSection ? ['hearing', activeSection] : userOpen;

  const allOpen = open.length === answer.sections.length;
  const activeIndex = answer.sections.findIndex((s) => s.key === activeSection);
  const doNowIndex = answer.sections.findIndex((s) => s.key === 'doNow');
  const productReady = !streaming || activeIndex > doNowIndex;

  return (
    <div className={styles.root} data-placeholder={answer.status === 'placeholder' || undefined}>
      {labsNote && (
        <p className={styles.labsNote}>
          <Icon name="labs" size={18} /> {labsNote}
        </p>
      )}
      {!streaming && (
        <div className={styles.tools}>
          <Button variant="ghost" size="sm" onClick={() => setOpen(allOpen ? DEFAULT_OPEN : answer.sections.map((s) => s.key))}>
            {allOpen ? 'Collapse all' : 'Expand all'}
          </Button>
        </div>
      )}
      {answer.sections.map((section, i) => (
        <Section
          key={section.key}
          number={i + 1}
          section={section}
          open={open.includes(section.key)}
          pending={Boolean(streaming) && activeIndex >= 0 && i > activeIndex}
          streaming={Boolean(streaming) && section.key === activeSection}
          onToggle={() => setOpen((o) => (o.includes(section.key) ? o.filter((k) => k !== section.key) : [...o, section.key]))}
          onAddQuestion={section.key === 'providerQuestions' ? onAddQuestion : undefined}
          extra={section.key === 'doNow' && productReady ? productSlot : undefined}
        />
      ))}
    </div>
  );
}
