/** Empty state: no profile or chat symptoms yet. The muted ring stays visible above. */
import { Button } from '@mobile/ui';
import styles from './EmptyMap.module.css';

interface Props {
  onAdd: () => void;
  onTalk: () => void;
}

export function EmptyMap({ onAdd, onTalk }: Props) {
  return (
    <div className={styles.root}>
      <p className={styles.copy}>Your map fills in as you share how you feel.</p>
      <div className={styles.actions}>
        <Button onClick={onTalk}>Talk to the Oracle</Button>
        <Button variant="ghost" onClick={onAdd}>Add symptoms</Button>
      </div>
    </div>
  );
}
