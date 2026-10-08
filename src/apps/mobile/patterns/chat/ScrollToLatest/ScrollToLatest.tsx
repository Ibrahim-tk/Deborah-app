/**
 * @pattern ScrollToLatest — round icon button when the user scrolled up during a stream
 * @usedBy  M-2.1
 * @spec    docs/07-ai-simulation.md §2 (Streaming)
 * @xref    web: apps/web/patterns/chat/ScrollToLatest — not built
 */
import { IconButton } from '@mobile/ui';
import styles from './ScrollToLatest.module.css';

export function ScrollToLatest({ onPress }: { onPress: () => void }) {
  return (
    <div className={styles.root}>
      <IconButton icon="chevronDown" label="Scroll to latest" tone="surface" onClick={onPress} />
    </div>
  );
}
