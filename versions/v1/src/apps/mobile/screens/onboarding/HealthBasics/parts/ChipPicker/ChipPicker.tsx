/**
 * Multi-select answer as chips only: "None", the suggestions, anything the person added, with "Other" on its own expanding row.
 * "Other" opens a small field; Enter (or leaving the field) adds what was typed as a new, selected chip.
 * Design exception (designer, 2026-10-13): compact chips here, not option rows.
 */
import { useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@flow-v1/apps/mobile/ui';
import styles from './ChipPicker.module.css';

export interface ChipPickerProps {
  label: string;
  /** Selected names. */
  picked: string[];
  suggestions: string[];
  /** The one-tap empty answer; omitted on single-choice steps. */
  none?: string;
  noneSelected: boolean;
  onToggle: (name: string) => void;
  onAdd: (name: string) => void;
  onNone: () => void;
}

export function ChipPicker({ label, picked, suggestions, none, noneSelected, onToggle, onAdd, onNone }: ChipPickerProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  // Names the person added themselves stay on screen as chips (selected until tapped off).
  const custom = picked.filter((p) => !suggestions.includes(p));

  const close = (restoreFocus = true) => {
    setDraft('');
    setAdding(false);
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus());
  };
  const commit = (restoreFocus = true) => {
    const name = draft.trim();
    const matching = [...suggestions, ...picked].find((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (name && !picked.includes(matching ?? name)) onAdd(matching ?? name);
    close(restoreFocus);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  };

  return (
    <div className={styles.root} role="group" aria-label={label}>
      {none && <button type="button" className={styles.chip} aria-pressed={noneSelected} onClick={onNone}>{none}</button>}
      {[...suggestions, ...custom].map((name) => (
        <button key={name} type="button" className={styles.chip} aria-pressed={picked.includes(name)} onClick={() => onToggle(name)}>
          <span className={styles.tick} aria-hidden><Icon name="check" size={16} /></span>
          {name}
        </button>
      ))}
      <div className={styles.otherRow}>
        <div
          className={styles.adder}
          data-expanded={adding}
          onBlur={(e) => {
            if (adding && !e.currentTarget.contains(e.relatedTarget)) commit(false);
          }}
        >
          {adding ? (
            <>
              <input
                className={styles.field}
                value={draft}
                placeholder="Add your own"
                aria-label={`Other: ${label}`}
                autoFocus
                enterKeyHint="done"
                autoComplete="off"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
              />
              <button type="button" className={styles.add} aria-label="Add custom option" disabled={!draft.trim()} onClick={() => commit()}>
                <Icon name="check" size={18} />
              </button>
            </>
          ) : (
            <button ref={trigger} type="button" className={styles.other} aria-label="Add another option" onClick={() => setAdding(true)}>
              <Icon name="plus" size={16} /> Other
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
