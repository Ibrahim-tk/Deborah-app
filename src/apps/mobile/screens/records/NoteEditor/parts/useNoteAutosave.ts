/**
 * Debounced autosave for M-9.4. The first save of a new note creates it (addNote); later saves
 * patch it (updateNote stamps updatedAt). An empty new note is never created.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@shared/store';
import type { NoteKind } from '@shared/types/domain';
import { nowFrom, uid } from '@shared/utils';

export interface NoteDraft {
  title: string;
  kind: NoteKind;
  body: string;
}

const DEBOUNCE_MS = 500;
const snapshot = (d: NoteDraft) => `${d.title}\u0000${d.kind}\u0000${d.body}`;

export const DEFAULT_TITLE: Record<NoteKind, string> = {
  questions: 'Questions for my visit',
  'after-visit': 'After my visit',
  'saved-answer': 'Saved from Deborah',
  free: 'Note',
};

export function useNoteAutosave(draft: NoteDraft, profileId: string, initialId?: string) {
  const id = useRef(initialId);
  const saved = useRef(false);
  const dirty = useRef(false);
  const timer = useRef<number>();
  const latest = useRef(draft);
  // Last persisted (or initial) content: unchanged drafts never save (also StrictMode-safe).
  const last = useRef(snapshot(draft));

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    if (!dirty.current) return;
    dirty.current = false;
    const { title, kind, body } = latest.current;
    last.current = snapshot(latest.current);
    const s = useAppStore.getState();
    if (id.current) {
      s.updateNote(id.current, { title: title.trim() || DEFAULT_TITLE[kind], kind, body });
    } else {
      if (!title.trim() && !body.trim()) return;
      id.current = uid('n');
      s.addNote({ id: id.current, profileId, kind, title: title.trim() || DEFAULT_TITLE[kind], body, updatedAt: nowFrom(s).toISOString() });
    }
    saved.current = true;
  }, [profileId]);

  const { title, kind, body } = draft;
  useEffect(() => {
    latest.current = { title, kind, body };
    window.clearTimeout(timer.current);
    dirty.current = snapshot(latest.current) !== last.current;
    if (!dirty.current) return;
    timer.current = window.setTimeout(flush, DEBOUNCE_MS);
  }, [title, kind, body, flush]);

  // Leaving by any route (scenario load, profile switch) still keeps the last keystrokes.
  useEffect(() => flush, [flush]);

  return {
    flush,
    /** Drop pending changes (after Delete). */
    cancel: () => {
      window.clearTimeout(timer.current);
      dirty.current = false;
    },
    get noteId() {
      return id.current;
    },
    get didSave() {
      return saved.current;
    },
  };
}
