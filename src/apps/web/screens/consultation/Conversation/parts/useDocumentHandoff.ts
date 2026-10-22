/**
 * F11 behaviour hosted by M-2.1 (docs/ux/F11-documents.md › Deborah handoff):
 * - `documentId` (Document preview "Discuss with Deborah", upload "Yes, ask Deborah") attaches the
 *   document once, then is consumed;
 * - otherwise an upload saved with "Not now" is offered once, when the chat is idle on screen.
 */
import { useEffect, useRef } from 'react';
import { useAppStore } from '@shared/store';
import type { ConversationStatus } from '@shared/types/domain';
import { useNavStore, useRoute } from '@web/navigation';

export interface DocumentHandoffOptions {
  shareDocument: (documentId: string) => unknown;
  offerDocument: (documentId: string) => unknown;
  status: ConversationStatus | undefined;
  busy: boolean;
}

// Mid-intake or mid-answer, an offer would interrupt; it waits for the next quiet open.
const QUIET: (ConversationStatus | undefined)[] = [undefined, 'empty', 'answered'];

export function useDocumentHandoff({ shareDocument, offerDocument, status, busy }: DocumentHandoffOptions) {
  const { route } = useRoute();
  const setRouteParams = useNavStore((s) => s.setRouteParams);
  const documentId = route.params?.documentId as string | undefined;
  const pendingId = useAppStore((s) => s.documents.pendingChatPromptId);
  const pendingProfile = useAppStore((s) => (pendingId ? s.documents.byId[pendingId]?.profileId : undefined));
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const onScreen = useNavStore((s) => s.root === 'main' && s.layers.length === 0 && s.activeTab === 'ask');

  // StrictMode runs effects twice; the ref keeps one attach per route + document.
  const consumed = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!documentId) return;
    const key = `${route.key}:${documentId}`;
    if (consumed.current === key) return;
    consumed.current = key;
    setRouteParams(route.key, { ...route.params, documentId: undefined });
    const s = useAppStore.getState();
    if (s.documents.pendingChatPromptId === documentId) s.setDocumentChatPrompt(undefined);
    shareDocument(documentId);
  }, [documentId, route, setRouteParams, shareDocument]);

  const ready = Boolean(pendingId) && !documentId && pendingProfile === activeProfileId && onScreen && !busy && QUIET.includes(status);
  useEffect(() => {
    if (!ready || !pendingId) return;
    const s = useAppStore.getState();
    // Read the store, not the render value: a second run in the same commit must not offer twice.
    if (s.documents.pendingChatPromptId !== pendingId) return;
    s.setDocumentChatPrompt(undefined);
    offerDocument(pendingId);
  }, [ready, pendingId, offerDocument]);
}
