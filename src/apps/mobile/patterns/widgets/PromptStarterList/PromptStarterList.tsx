/**
 * PromptStarterList — full-width starter rows (AI-native Home / empty-state pattern).
 * Option-row language, not chips. Max 3–4 items recommended.
 */
import { cx } from '@shared/utils';
import { Icon } from '@mobile/ui';
import styles from './PromptStarterList.module.css';

export interface PromptStarter {
  label: string;
  prefill: string;
}

export function PromptStarterList({
  items,
  onPrompt,
  variant = 'paper',
}: {
  items: PromptStarter[];
  onPrompt: (prefill: string) => void;
  /** `onLift` softens rows when nested inside a lift/paper PrimaryIntentCard. */
  variant?: 'paper' | 'onLift';
}) {
  return (
    <ul className={cx(styles.root, variant === 'onLift' && styles.onLift)}>
      {items.map((p) => (
        <li key={p.label}>
          <button type="button" className={styles.prompt} onClick={() => onPrompt(p.prefill)}>
            <span>{p.label}</span>
            <Icon name="chevron" size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
