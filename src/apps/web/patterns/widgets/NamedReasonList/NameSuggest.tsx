/**
 * Name field with client-side filter dropdown from a JSON seed list. Free typing always allowed.
 */
import { useId, useState } from 'react';
import { Input } from '@web/ui';
import styles from './NameSuggest.module.css';

export interface NameSuggestProps {
  label: string;
  value: string;
  placeholder?: string;
  suggestions: string[];
  onChange: (value: string) => void;
}

function filterNames(query: string, suggestions: string[]): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: string[] = [];
  const includes: string[] = [];
  for (const name of suggestions) {
    const lower = name.toLowerCase();
    if (lower === q) continue;
    if (lower.startsWith(q)) starts.push(name);
    else if (lower.includes(q)) includes.push(name);
  }
  return [...starts, ...includes].slice(0, 8);
}

export function NameSuggest({ label, value, placeholder, suggestions, onChange }: NameSuggestProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const matches = filterNames(value, suggestions);
  const show = open && matches.length > 0;

  return (
    <div className={styles.root}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        autoCapitalize="words"
        role="combobox"
        aria-expanded={show}
        aria-controls={show ? listId : undefined}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
      />
      {show && (
        <ul id={listId} className={styles.menu} role="listbox" aria-label={label}>
          {matches.map((name) => (
            <li key={name} role="presentation">
              <button
                type="button"
                role="option"
                className={styles.option}
                // Keep focus on the field so blur doesn't close before the tap registers.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
