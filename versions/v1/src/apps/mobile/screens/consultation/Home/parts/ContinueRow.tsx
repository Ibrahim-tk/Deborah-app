/**
 * Home "Pick up where you left off" (returning users only): the last consultation's topic as a
 * full-width row; tapping reopens that conversation.
 */
import { Icon } from '@flow-v1/apps/mobile/ui';
import styles from './ContinueRow.module.css';

export function ContinueRow({ topic, onPress, kicker = 'Pick up where you left off', summary }: { topic: string; onPress: () => void; kicker?: string; summary?: string }) {
  return (
    <button type="button" className={styles.root} onClick={onPress}>
      <span className={styles.text}>
        <span className={styles.kicker}>{kicker}</span>
        <span className={styles.topic}>{topic}</span>
        {summary && <span className={styles.summary}>{summary}</span>}
      </span>
      <span className={styles.continue}>Continue</span>
      <span className={styles.go} aria-hidden>
        <Icon name="chevron" size={18} />
      </span>
    </button>
  );
}
