/**
 * @pattern SymptomDropdown — floating overlay above the composer (design 2026-10-21), replacing the full
 *          SymptomPicker sheet from the composer: a search field, then symptoms grouped by area as quiet option
 *          rows with a tick when picked (no pills). Typing something unlisted offers "Add “…”". Tap outside or
 *          Esc closes. Picks toggle straight into the composer.
 * @usedBy  Composer (M-2.1 Conversation, M-2.12 First consultation)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { symptomGroups } from '@shared/data';
import { Icon } from '@web/ui';
import styles from './SymptomDropdown.module.css';

export interface SymptomDropdownProps {
  selected: string[];
  onToggle: (symptom: string) => void;
  onClose: () => void;
  /** Render inside a BottomSheet (design 2026-10-21): no floating card, no outside-tap close. */
  inSheet?: boolean;
}

export function SymptomDropdown({ selected, onToggle, onClose, inSheet }: SymptomDropdownProps) {
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (inSheet) return;
    const down = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    // Next tick, so the opening tap doesn't close it.
    const id = window.setTimeout(() => document.addEventListener('pointerdown', down), 0);
    document.addEventListener('keydown', key);
    return () => { window.clearTimeout(id); document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [onClose, inSheet]);

  const groups = useMemo(() => {
    const extra = selected.filter((s) => !symptomGroups.some((g) => g.items.includes(s)));
    const all = extra.length ? [{ title: 'Added by you', items: extra }, ...symptomGroups] : symptomGroups;
    return all.map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  }, [q, selected]);
  const exact = groups.some((g) => g.items.some((i) => i.toLowerCase() === q));
  const addOwn = () => { onToggle(query.trim().replace(/^./, (c) => c.toUpperCase())); setQuery(''); };

  return (
    <div ref={root} className={inSheet ? styles.sheet : styles.root} role={inSheet ? undefined : 'dialog'} aria-label="Symptoms">
      <label className={styles.search}>
        <Icon name="search" size={16} />
        <input
          autoFocus={!inSheet}
          className={styles.input}
          value={query}
          placeholder="Search symptoms"
          enterKeyHint="done"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && q && !exact) { e.preventDefault(); addOwn(); } }}
        />
      </label>
      <div className={styles.list}>
        {q && !exact && (
          <button type="button" className={styles.row} onClick={addOwn}>
            <span className={styles.add} aria-hidden><Icon name="plus" size={14} /></span>
            Add “{query.trim()}”
          </button>
        )}
        {groups.map((g) => (
          <section key={g.title} className={styles.group} aria-label={g.title}>
            <p className={styles.groupTitle}>{g.title}</p>
            {g.items.map((s) => {
              const on = selected.includes(s);
              return (
                <button key={s} type="button" role="menuitemcheckbox" aria-checked={on} className={styles.row} data-on={on || undefined} onClick={() => onToggle(s)}>
                  <span className={styles.label}>{s}</span>
                  <span className={styles.tick} aria-hidden>{on && <Icon name="check" size={12} strokeWidth={2.5} />}</span>
                </button>
              );
            })}
          </section>
        ))}
        {!groups.length && !q && <p className={styles.empty}>No symptoms yet.</p>}
      </div>
    </div>
  );
}
