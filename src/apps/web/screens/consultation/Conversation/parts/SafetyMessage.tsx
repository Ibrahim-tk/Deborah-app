/** Renders F03 safety messages inside the Conversation (docs/ux/F03-safety.md). */
import { useEffect, useRef } from 'react';
import { guardrailsData as g, suggestionsData } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { Message } from '@shared/types/domain';
import { useAlert } from '@web/ui';
import { CrisisSupportCard, EmergencyInterrupt, EscalationCard, MedicationSafetyCard, OutOfScopeReply } from '@web/patterns/safety';
import { useToast } from '@web/hooks/toast.store';
import { useNav } from '@web/navigation';
import type { useConversation } from '@web/hooks/useConversation';

export interface SafetyMessageProps {
  message: Message;
  conversationId: string;
  busy: boolean;
  chat: ReturnType<typeof useConversation>;
  onFocusComposer: () => void;
}

function useTeamNotifyToast(message: Message, conversationId: string, active: boolean, copy?: string) {
  const toast = useToast();
  const seen = useRef(false);
  useEffect(() => {
    if (!active || seen.current || message.meta?.teamNotified) return;
    seen.current = true;
    useAppStore.getState().patchMessage(conversationId, message.id, { meta: { ...message.meta, teamNotified: true } });
    toast(copy ?? 'Care team prioritized and notified (demo)');
  }, [active, conversationId, copy, message.id, message.meta, toast]);
}

export function SafetyMessage({ message: m, conversationId, busy, chat, onFocusComposer }: SafetyMessageProps) {
  const alert = useAlert();
  const toast = useToast();
  const { open, push } = useNav();
  const teamAlert = useAppStore((s) => s.conversations.byId[conversationId]?.teamAlert);
  const uncovered = m.kind === 'outOfScope' && teamAlert?.level === 'uncovered';
  useTeamNotifyToast(
    m,
    conversationId,
    (m.kind === 'emergency' && !m.meta?.acknowledged) || m.kind === 'crisis' || uncovered,
    uncovered ? 'Summary sent to the support team (demo)' : undefined,
  );

  const call = async (title: string, demo: string) => {
    const choice = await alert({ title, buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Call' }] });
    if (choice === 1) toast(demo);
  };

  switch (m.kind) {
    case 'emergency':
      return (
        <EmergencyInterrupt
          title={g.emergency.title}
          body={m.text ?? g.emergency.body}
          acknowledged={m.meta?.acknowledged}
          onCall={() => call('Call 911?', 'Calling 911… (demo)')}
          onFindER={() => toast('Opens Maps (demo)')}
          onSafe={() => chat.acknowledgeEmergency(m.id)}
        />
      );
    case 'crisis':
      return (
        <CrisisSupportCard
          body={m.text ?? g.crisis.body}
          lifelineLabel={g.crisis.lifeline.label}
          moreSupport={g.crisis.moreSupport}
          onCall={() => call(`Call or text ${g.crisis.lifeline.tel}?`, `Connecting to ${g.crisis.lifeline.tel}… (demo)`)}
          onCall911={() => call('Call 911?', 'Calling 911… (demo)')}
          onText={() => call('Text HOME to 741741?', 'Opening Messages… (demo)')}
          onKeepTalking={onFocusComposer}
        />
      );
    case 'medicationSafety':
      return (
        <MedicationSafetyCard
          body={m.text ?? g.medication.body}
          linkLabel={g.medication.interactionLink.label}
          onCheckInteractions={() => open('M-2.7', { url: g.medication.interactionLink.url, title: 'Drug interaction checker' })}
        />
      );
    case 'outOfScope':
      return <OutOfScopeReply suggestions={suggestionsData.default} disabled={busy} onBook={() => push('M-8.2')} onSelect={(s) => chat.send(s.text, s.scriptId)} />;
    case 'escalation':
      return (
        <EscalationCard
          body={m.text ?? g.escalation.body}
          dismissed={m.meta?.dismissed}
          onBook={() => push('M-8.2')}
          onDismiss={() => useAppStore.getState().patchMessage(conversationId, m.id, { meta: { dismissed: true } })}
        />
      );
    default:
      return null;
  }
}
