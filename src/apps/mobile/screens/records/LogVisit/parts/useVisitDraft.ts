/** Draft of a visit outcome while M-9.8 is open. `dirty` drives the unsaved-changes alert. */
import { useState } from 'react';
import type { VisitOutcome } from '@shared/types/domain';

export type VisitDraftUpdate = (fn: (d: VisitOutcome) => VisitOutcome) => void;

export function useVisitDraft(initial: VisitOutcome) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const update: VisitDraftUpdate = (fn) => {
    setDraft(fn);
    setDirty(true);
  };
  /** Rows left blank are dropped on save. */
  const cleaned = (): VisitOutcome => ({
    ...draft,
    tests: draft.tests.filter((t) => t.name.trim()),
    medChanges: draft.medChanges.filter((m) => m.name.trim()),
    nextSteps: draft.nextSteps.filter((n) => n.text.trim()),
  });
  return { draft, update, dirty, cleaned, reset: (o: VisitOutcome) => { setDraft(o); setDirty(false); } };
}
