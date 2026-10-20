/**
 * "Save to my profile" under the seven cards: what Deborah noted in a premade chat, through the chat's own
 * ReviewFactsCard. Saving is simulated in the card's state.
 * OPEN: wire to the store's pending-fact flow once the premade chat writes real facts.
 */
import { useState } from 'react';
import type { PendingFact } from '@shared/types/domain';
import { ReviewFactsCard } from '@mobile/patterns/chat';

export function ProfileFacts({ facts, onEdit }: { facts: { label: string; value: string }[]; onEdit: () => void }) {
  const [list, setList] = useState<PendingFact[]>(() =>
    facts.map((f, i) => ({ id: `pf${i}`, key: f.label, label: f.label, value: f.value, patch: {}, source: 'answer', status: 'pending' })),
  );
  const mark = (ids: string[], status: PendingFact['status']) => setList((xs) => xs.map((f) => (ids.includes(f.id) ? { ...f, status } : f)));
  return (
    <ReviewFactsCard
      facts={list}
      onConfirm={(keep, drop) => { mark(keep, 'confirmed'); mark(drop, 'discarded'); }}
      onEdit={onEdit}
      onDiscard={(ids) => mark(ids, 'discarded')}
    />
  );
}
