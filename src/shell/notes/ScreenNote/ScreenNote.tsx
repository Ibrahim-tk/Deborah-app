/**
 * @shell ScreenNote — sticky note beside the phone with the story/intent of the visible screen.
 * Seeded from shared/data/screen-notes.json; edits are live and remembered per screen ID in
 * localStorage (prototype chrome only — never product UI).
 */
import { useEffect, useState } from 'react';
import { useAppStore } from '@shared/store';
import seed from '@shared/data/screen-notes.json';
import { useShellStore } from '../../shell.store';
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

export function ScreenNote() {
  const appScreen = useShellStore((s) => s.screen);
  const isLocked = useAppStore((s) => s.isLocked);
  const screen = isLocked ? { id: 'M-5.1', title: 'Lock screen' } : appScreen;
  const [edits, setEdits] = useState<Record<string, string>>(readAll);
  const [collapsed, setCollapsed] = useState(false);
  const hide = useShellStore((s) => s.setShowNotes);

  useEffect(() => writeAll(edits), [edits]);

  if (!screen) return null;
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
