/**
 * @screen  M-9.6 · PDF preview
 * @flow    F09 My Health records (opened from an answer’s "Save PDF" in F02, M-9.2, M-9.7 brief, or F11 Saved Reports)
 * @states  preview (from message) · preview (from conversation) · preview (provider brief) · nothing to print
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-96--pdf-preview-not-in-wireframes · docs/ux/F09b-visit-brief.md
 * @xref    web: W-9.6 (apps/web/screens/records/PdfPreview) — not built
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { assembleVisitBrief, hasEnoughDetailForVisitBrief, latestCompletedAnswer } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { VisitBriefContent } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { Button, Modal } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { BriefDocument } from '../VisitBrief/parts/BriefDocument';
import { PdfPage } from './parts/PdfPage';
import { resolveSource } from './parts/resolveSource';
import styles from './PdfPreview.module.css';

export default function PdfPreview() {
  const params = useScreenParams<{ messageId: string; conversationId: string; briefNoteId: string }>();
  const { dismissModal } = useNav();
  const toast = useToast();
  const source = useAppStore(useShallow((s) => resolveSource(s, params)));
  const profileName = useAppStore((s) => (source ? s.profiles.byId[source.conversation.profileId]?.name : undefined));

  const briefNoteId = params.briefNoteId;
  const savedBrief = useAppStore((s) => (briefNoteId ? s.notes.byId[briefNoteId]?.brief : undefined));
  const brief = useMemo((): VisitBriefContent | undefined => {
    if (savedBrief) return savedBrief;
    if (!source) return undefined;
    // Prefer structured visit brief when the conversation has enough detail (Miro Step 5).
    if (!hasEnoughDetailForVisitBrief(source.conversation)) return undefined;
    const s = useAppStore.getState();
    const profile = s.profiles.byId[source.conversation.profileId];
    const msg = source.message ?? latestCompletedAnswer(source.conversation);
    if (!profile || !msg?.answer) return undefined;
    return assembleVisitBrief(source.conversation, profile, msg.answer);
  }, [savedBrief, source]);

  const hasContent = Boolean(brief || source);

  return (
    <div className={styles.root} data-xref="M-9.6 · PDF preview">
      <Modal
        title="PDF preview"
        right={<Button variant="ghost" size="md" onClick={dismissModal}>Done</Button>}
        footer={
          hasContent && (
            <div className={styles.footerStack}>
              {/* F11 Saved Reports: "Print or Download as PDF" (Miro). Prototype: no file is written. */}
              <Button fullWidth leadingIcon="download" onClick={() => toast('PDF downloaded')}>Download PDF</Button>
              <div className={styles.actions}>
                <Button variant="secondary" leadingIcon="share" onClick={() => toast('Shared (demo)')}>Share</Button>
                <Button variant="secondary" leadingIcon="file" onClick={() => window.print()}>Print</Button>
              </div>
            </div>
          )
        }
      >
        {brief ? (
          <div className={styles.body}>
            <BriefDocument brief={brief} />
            <p className={styles.footnote}>Printable summaries are part of Premium.</p>
          </div>
        ) : source ? (
          <div className={styles.body}>
            <PdfPage
              answer={source.message.answer}
              topic={source.conversation.topic}
              profileName={profileName ?? 'You'}
              date={formatShortDate(source.message.createdAt)}
            />
            <p className={styles.footnote}>Printable summaries are part of Premium.</p>
          </div>
        ) : (
          <EmptyState icon="pdf" text="There’s no answer to print yet. Once Deborah answers, you can save a summary here." />
        )}
      </Modal>
    </div>
  );
}
