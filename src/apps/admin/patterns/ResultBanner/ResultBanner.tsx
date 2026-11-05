/** @pattern ResultBanner — says in one plain sentence what just happened ("“Sleep and cortisol” is now live."),
 *  and stays until it's dismissed or the next action replaces it, so it can be read without hurry. */
import { Icon, IconButton } from '@admin/ui';
import styles from './ResultBanner.module.css';

export function ResultBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div className={styles.root} role="status">
      <Icon name="check" size={20} />
      <p className={styles.text}>{message}</p>
      <IconButton icon="close" size="sm" label="Dismiss message" onClick={onDismiss} />
    </div>
  );
}
