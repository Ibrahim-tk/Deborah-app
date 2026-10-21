/**
 * @shell ScreenNote — sticky note beside the phone with the story/intent of the visible screen.
 *
 * Internal: seeded from screen-notes.json, editable, hide via Toggles.
 * Client: body-only guide on a short list of screens (clientGuide.ts); silent elsewhere.
 */
import { useEffect, useState } from 'react';
import { selectActiveConversation, useAppStore } from '@shared/store';
import seed from '@shared/data/screen-notes.json';
import { useShellStore } from '../../shell.store';
import { CLIENT_GUIDE } from './clientGuide';
import styles from './ScreenNote.module.css';

interface Seed {
  title: string;
  flow: string;
  note: string;
}
const NOTES = seed as Record<string, Seed>;
const KEY = 'oc.screen-notes';

function readAll(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable (private mode): edits last for this session only.
  }
}

/** Which client sticky to show for this screen, or null to hide. */
function clientNoteKey(screenId: string, chatEmpty: boolean, recordsGuide: string | null): string | null {
  if (screenId === 'M-2.1') return chatEmpty ? 'chat-empty' : 'chat-running';
  if (screenId === 'M-9.7') return 'visit-notes';
  if (screenId === 'M-7.3') return 'healing-plan';
  if (screenId === 'M-9.1') {
    if (recordsGuide === 'records-labs' || recordsGuide === 'records-attachments' || recordsGuide === 'records-notes') {
      return recordsGuide;
    }
    return 'records-notes';
  }
  if (screenId === 'M-9.5' || screenId === 'M-5.3' || screenId === 'M-5.4') return 'records-labs';
  if (screenId === 'M-11.1' || screenId === 'M-11.3') return 'records-attachments';
  return null;
}

export interface ScreenNoteProps {
  /** Client page: guide copy only. Internal: editable + hide via Toggles. */
  audience?: 'internal' | 'client';
}

export function ScreenNote({ audience = 'internal' }: ScreenNoteProps) {
  const forClient = audience === 'client';
  const appScreen = useShellStore((s) => s.screen);
  const recordsGuide = useShellStore((s) => s.clientGuide);
  const isLocked = useAppStore((s) => s.isLocked);
  const conversation = useAppStore(selectActiveConversation);
  const screen = isLocked ? { id: 'M-5.1', title: 'Lock screen' } : appScreen;
  const [edits, setEdits] = useState<Record<string, string>>(readAll);
  const [collapsed, setCollapsed] = useState(false);
  const hide = useShellStore((s) => s.setShowNotes);

  useEffect(() => {
    if (forClient) return;
    writeAll(edits);
  }, [edits, forClient]);

  if (!screen) return null;

  if (forClient) {
    const chatEmpty = !(conversation?.messages?.length);
    const key = clientNoteKey(screen.id, chatEmpty, recordsGuide);
    const text = key ? CLIENT_GUIDE[key] : undefined;
    if (!text) return null;
    return (
      <aside className={styles.root} data-audience="client" aria-label="Guide">
        <p className={styles.clientBody}>{text}</p>
      </aside>
    );
  }

  const base = NOTES[screen.id];
  const edited = screen.id in edits;
  const text = edited ? edits[screen.id] : base?.note ?? '';

  const reset = () =>
    setEdits((all) => {
      const next = { ...all };
      delete next[screen.id];
      return next;
    });

  return (
    <aside className={styles.root} data-collapsed={collapsed || undefined} aria-label="Screen story">
      <header className={styles.head}>
        <button type="button" className={styles.toggle} onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed}>
          <span className={styles.id}>{screen.id}</span>
          <span className={styles.title}>{base?.title ?? screen.title}</span>
        </button>
        {edited && !collapsed && (
          <button type="button" className={styles.reset} onClick={reset} title="Restore the original note">
            Reset
          </button>
        )}
        <button type="button" className={styles.reset} onClick={() => hide(false)} title="Hide notes (turn back on in Toggles)" aria-label="Hide screen notes">
          ✕
        </button>
      </header>
      {!collapsed && (
        <>
          {base?.flow && <p className={styles.flow}>{base.flow}</p>}
          <textarea
            key={screen.id}
            className={styles.text}
            value={text}
            placeholder="Why does this screen exist? Who's here, what should they feel and do?"
            onChange={(e) => setEdits((all) => ({ ...all, [screen.id]: e.target.value }))}
            rows={6}
          />
          <p className={styles.hint}>{edited ? 'Edited · saved in this browser' : 'Click to edit · saved in this browser'}</p>
        </>
      )}
    </aside>
  );
}
