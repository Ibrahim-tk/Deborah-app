/**
 * @screen  M-9.2 · Consultation detail
 * @flow    F09 My Health records
 * @states  answered · in progress (no answer yet) · with labs · other profile (no Continue chat) · not found
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598
 * @spec    docs/ux/F09-records.md#m-92--consultation-detail
 * @xref    web: W-9.2 (apps/web/screens/records/ConsultationDetail) — not built
 */
import type { ReactNode } from 'react';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Button } from '@web/ui';
import { EmptyState } from '@web/patterns/health';
import { DerivedPage } from '@web/patterns/shell';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@web/navigation';
import { useDetailHost } from '../../DetailHost';
import { Transcript } from './parts/Transcript';
import { conversationToText } from './parts/transcriptModel';
import styles from './ConsultationDetail.module.css';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked in some browsers; the toast still confirms the demo action.
  }
}

export default function ConsultationDetail() {
  const { conversationId = '' } = useScreenParams<{ conversationId: string }>();
  const { pop, open, returnToConversation } = useNav();
  const { canGoBack } = useRoute();
  const detailHost = useDetailHost();
  const toast = useToast();
  const conversation = useAppStore((s) => s.conversations.byId[conversationId]);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const back = detailHost ? detailHost.clear : canGoBack ? pop : undefined;

  const wrap = (title: string, body: ReactNode) =>
    detailHost ? (
      <div className={styles.embed} data-xref="M-9.2 · Consultation detail">{body}</div>
    ) : (
      <DerivedPage title={title} composerPlaceholder="Ask Oracle about this visit…">
        <div className={styles.stack} data-xref="M-9.2 · Consultation detail">{body}</div>
      </DerivedPage>
    );

  if (!conversation) {
    return wrap(
      'Consultation',
      <EmptyState icon="chat" text="This consultation is no longer available." actionLabel="Back to records" onAction={back ?? pop} />,
    );
  }

  const topic = conversation.topic ?? (conversation.scriptId === 'checkin' ? 'Check-in' : 'Consultation');
  const date = formatShortDate(conversation.countedAt ?? conversation.startedAt);
  const canContinue = conversation.profileId === activeProfileId;

  const share = async () => {
    await copy(conversationToText(conversation, topic));
    toast('Copied');
  };

  // Reopen with memory: park whatever is open in Ask, then make this conversation active again.
  const continueChat = () => {
    const s = useAppStore.getState();
    const { profileId, id } = conversation;
    if (s.conversations.activeByProfile[profileId] !== id) s.archiveActive(profileId);
    s.setConversation(id, { archived: false });
    s.setActiveConversation(profileId, id);
    returnToConversation();
  };

  return wrap(
    topic,
    <>
      <p className={styles.date}>{date}</p>
      <Transcript messages={conversation.messages} onShop={(productId) => open('M-2.7', { productId })} />
      <div className={styles.actions}>
        <Button variant="secondary" size="sm" leadingIcon="pdf" onClick={() => open('M-9.6', { conversationId })}>Download PDF</Button>
        <Button variant="secondary" size="sm" leadingIcon="share" onClick={share}>Share</Button>
        {canContinue && (
          <Button size="sm" leadingIcon="deborah" onClick={continueChat}>Continue conversation</Button>
        )}
      </div>
    </>,
  );
}
