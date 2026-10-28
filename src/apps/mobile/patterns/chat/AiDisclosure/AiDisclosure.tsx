/**
 * @pattern AiDisclosure — one quiet caption line just below the composer, on every chat screen
 *          (not on intake).
 * @usedBy  M-2.1, M-2.12
 * @spec    Oct 27 session — AI disclosure on every chat screen
 * @xref    web: apps/web/patterns/chat — not built
 */
import styles from './AiDisclosure.module.css';

export const AI_DISCLOSURE = 'You’re chatting with the Oracle, an AI system.';

export function AiDisclosure() {
  return <p className={styles.root}>{AI_DISCLOSURE}</p>;
}
