/**
 * @screen  M-9.6 · PDF preview
 * @flow    F09 My Health records (opened from an answer's "Save PDF" in F02 and from M-9.2)
 * @states  preview (from message) · preview (from conversation) · nothing to print
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-96--pdf-preview-not-in-wireframes
 * @xref    web: W-9.6 (apps/web/screens/records/PdfPreview) — not built
 */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Button, Modal } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { PdfPage } from './parts/PdfPage';
import { resolveSource } from './parts/resolveSource';
import styles from './PdfPreview.module.css';

export default function PdfPreview() {
  const params = useScreenParams<{ messageId: string; conversationId: string }>();
  const { dismissModal } = useNav();
  const toast = useToast();
  const source = useAppStore(useShallow((s) => resolveSource(s, params)));
  const profileName = useAppStore((s) => (source ? s.profiles.byId[source.conversation.profileId]?.name : undefined));

  return (
    <div className={styles.root} data-xref="M-9.6 · PDF preview">
      <Modal
        title="PDF preview"
        right={<Button variant="ghost" size="md" onClick={dismissModal}>Done</Button>}
        footer={
          source && (
            <div className={styles.actions}>
              <Button variant="secondary" leadingIcon="share" onClick={() => toast('Shared (demo)')}>Share</Button>
              {/* Optional per spec: prints the page only (print CSS hides the app around it). */}
              <Button variant="secondary" leadingIcon="file" onClick={() => window.print()}>Print</Button>
            </div>
          )
        }
      >
        {source ? (
          <div className={styles.body}>
            <PdfPage
              answer={source.message.answer}
              topic={source.conversation.topic}
              profileName={profileName ?? 'You'}
              date={formatShortDate(source.message.createdAt)}
            />
            {/* OPEN: Premium gating for PDF (brief lists it under Premium) — allowed for all in the prototype. */}
            <p className={styles.footnote}>Printable summaries are part of Premium.</p>
          </div>
        ) : (
          <EmptyState icon="pdf" text="There’s no answer to print yet. Once Deborah answers, you can save a summary here." />
        )}
      </Modal>
    </div>
  );
}
