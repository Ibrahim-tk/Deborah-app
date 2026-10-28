/**
 * @pattern SaveHealthProfile — after guidance: checkbox list of facts to add to the health profile
 * @usedBy  M-2.1 (First Consult + Conversation after-guidance trail)
 * @spec    docs/ux/F02g-after-guidance-trail.md
 * @xref    web: apps/web/patterns/chat/SaveHealthProfile — not built
 */
import { useState } from 'react';
import type { PendingFact } from '@shared/types/domain';
import { ReviewFactsCard } from '../ReviewFactsCard';

export interface HealthFact {
  label: string;
  value: string;
}

export interface SaveHealthProfileProps {
  facts: HealthFact[];
  onEdit?: () => void;
  /** Answered: how many facts were saved (0 = none). The screen shows the toast (designer, 2026-10-28). */
  onResult?: (saved: number) => void;
}

/** Demo seed when the engine has not proposed facts yet (prototype, F02g). */
export const DEMO_HEALTH_FACTS: HealthFact[] = [
  { label: 'Hormonal stage', value: 'Periods less predictable (possible perimenopause)' },
  { label: 'Hormone therapy', value: 'None' },
  { label: 'Medications', value: 'Levothyroxine, 50 mcg' },
  { label: 'Sleep', value: '5–6 hours, waking 2–3 a.m.' },
  { label: 'Exercise', value: 'Walks 30 minutes, 3 times a week' },
  { label: 'Genesis Gold®', value: 'Not tried yet' },
];

export function SaveHealthProfile({ facts, onEdit, onResult }: SaveHealthProfileProps) {
  const [list, setList] = useState<PendingFact[]>(() =>
    facts.map((f, i) => ({
      id: `hp${i}`,
      key: f.label,
      label: f.label,
      value: f.value,
      patch: {},
      source: 'answer',
      status: 'pending',
    })),
  );
  const mark = (ids: string[], status: PendingFact['status']) =>
    setList((xs) => xs.map((f) => (ids.includes(f.id) ? { ...f, status } : f)));

  return (
    <ReviewFactsCard
      facts={list}
      onConfirm={(keep, drop) => {
        mark(keep, 'confirmed');
        mark(drop, 'discarded');
        onResult?.(keep.length);
      }}
      onEdit={onEdit ?? (() => {})}
      onDiscard={(ids) => {
        mark(ids, 'discarded');
        onResult?.(0);
      }}
    />
  );
}
