/**
 * Medications & supplements / Allergies / Conditions: a None / Yes, add gate, then entries with
 * remove buttons, a search with suggestions, and a camera button for scanning a label (Step E).
 */
import { useState } from 'react';
import { Button, ChoiceGroup, IconButton, Input } from '@web/ui';
import styles from '../ProfileCard.module.css';

export interface ListFieldProps {
  label: string;
  /** undefined = not answered; [] = None. */
  items?: string[];
  suggestions: string[];
  onChange: (items: string[]) => void;
  onDone: () => void;
  onScan?: () => void;
}

export function ListField({ label, items, suggestions, onChange, onDone, onScan }: ListFieldProps) {
  const [adding, setAdding] = useState(Boolean(items?.length));
  const [query, setQuery] = useState('');
  const list = items ?? [];

  if (!adding) {
    return (
      <ChoiceGroup
        label={label}
        fill
        choices={[
          { value: 'none', label: 'None', primary: true },
          { value: 'add', label: 'Yes, add' },
        ]}
        onChange={(v) => {
          if (v === 'none') {
            onChange([]);
            onDone();
          } else setAdding(true);
        }}
      />
    );
  }

  const q = query.trim().toLowerCase();
  const matches = suggestions.filter((s) => !list.includes(s) && (!q || s.toLowerCase().includes(q))).slice(0, 6);
  const add = (name: string) => {
    if (!name.trim() || list.includes(name.trim())) return;
    onChange([...list, name.trim()]);
    setQuery('');
  };

  return (
    <div className={styles.listField}>
      {list.length > 0 && (
        <ul className={styles.entries} aria-label={`${label} added`}>
          {list.map((name) => (
            <li key={name} className={styles.entry}>
              <span>{name}</span>
              <IconButton icon="close" size="sm" label={`Remove ${name}`} onClick={() => onChange(list.filter((x) => x !== name))} />
            </li>
          ))}
        </ul>
      )}
      <div className={styles.search}>
        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            add(query);
          }}
        >
          <Input label={`Search ${label.toLowerCase()}`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a name" enterKeyHint="done" />
        </form>
        {onScan && <IconButton icon="camera" label="Scan a label" tone="tint" onClick={onScan} className={styles.scanButton} />}
      </div>
      {matches.length > 0 && (
        <ChoiceGroup label={`Common ${label.toLowerCase()}`} choices={matches.map((m) => ({ value: m, label: m }))} onChange={add} multi value={[]} />
      )}
      {q && !suggestions.some((s) => s.toLowerCase() === q) && (
        <Button variant="link" onClick={() => add(query)}>Add “{query.trim()}”</Button>
      )}
      <Button size="md" variant="secondary" onClick={() => (list.length ? onDone() : (onChange([]), onDone()))}>
        {list.length ? 'Done' : 'None after all'}
      </Button>
    </div>
  );
}
