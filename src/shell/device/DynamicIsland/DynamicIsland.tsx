/** @shell DynamicIsland — static black pill. No activity animation (DESIGN.md bans pulses). */
import styles from './DynamicIsland.module.css';

export function DynamicIsland() {
  return <div className={styles.root} aria-hidden="true" />;
}
