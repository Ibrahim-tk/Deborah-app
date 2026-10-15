/** Shared /wid choice widget adapter. Emits stable IDs, never display labels. */
import { useRef, useState } from 'react';
import type { Option } from '@shared/types/domain';
import { Button, OptionList, OptionRow } from '@mobile/ui';
import { ChoicePills } from '../ChoicePills';
import { toggleSelection } from './selection';
import styles from './QuestionChoices.module.css';

export interface QuestionChoicesProps {
  label: string;
  options: Option[];
  multi?: boolean;
  exclusive?: string;
  disabled?: boolean;
  answered?: string[];
  initialSelected?: string[];
  onSubmit: (ids: string[]) => void;
}

export function QuestionChoices({ label, options, multi, exclusive, disabled, answered, initialSelected = [], onSubmit }: QuestionChoicesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const submitted = useRef(false);
  const [sent, setSent] = useState(false);
  const locked = disabled || sent || Boolean(answered);
  const values = answered ?? selected;
  // Preserve readable option rows for long answers; compact widgets are preferred, not forced.
  const compact = options.length <= 8 && options.every((o) => o.label.length <= 56);
  const submit = (ids: string[]) => {
    if (locked || submitted.current || !ids.length) return;
    submitted.current = true;
    setSelected(ids);
    setSent(true);
    onSubmit(ids);
  };
  return (
    <div className={styles.root} role="group" aria-label={label} data-question-choices data-multi={multi || undefined}>
      {compact ? <ChoicePills
        label={label}
        options={options.map((o) => o.label)}
        optionIds={options.map((o) => o.id)}
        selected={options.filter((o) => values.includes(o.id)).map((o) => o.label)}
        disabled={locked}
        onPick={(_, i) => submit([options[i].id])}
        onToggle={multi ? (_, i) => setSelected((xs) => toggleSelection(xs, options[i].id, exclusive)) : undefined}
      /> : <OptionList label={label} multi={multi}>
        {options.map((o) => <OptionRow key={o.id} choiceId={o.id} multi={multi} selected={values.includes(o.id)} disabled={locked} onSelect={() => multi ? setSelected((xs) => toggleSelection(xs, o.id, exclusive)) : submit([o.id])}>{o.label}</OptionRow>)}
      </OptionList>}
      {multi && !locked && <Button fullWidth disabled={!selected.length} onClick={() => submit(selected)}>Continue</Button>}
    </div>
  );
}
