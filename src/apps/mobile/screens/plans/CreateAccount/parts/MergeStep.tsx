/**
 * M-4.3 merge step: a guest who already chatted signs in to an existing account. Nothing is lost
 * silently — she chooses to add this phone's conversations to the account or discard them.
 */
import { Button } from '@mobile/ui';
import styles from '../CreateAccount.module.css';

export function MergeStep({ onKeep, onDiscard }: { onKeep: () => void; onDiscard: () => void }) {
  return (
    <div className={styles.group}>
      <Button fullWidth onClick={onKeep}>Add them to my account</Button>
      <Button variant="secondary" fullWidth onClick={onDiscard}>Discard them</Button>
    </div>
  );
}
