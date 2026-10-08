/**
 * @shell SimKeyboard — static iOS keyboard (visual only). Physical typing still drives the input;
 * mousedown is swallowed so clicking the keyboard never steals focus from it.
 */
import styles from './SimKeyboard.module.css';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export interface SimKeyboardProps {
  visible: boolean;
}

export function SimKeyboard({ visible }: SimKeyboardProps) {
  return (
    <div
      className={styles.root}
      data-visible={visible}
      aria-hidden="true"
      onMouseDown={(e) => e.preventDefault()}
    >
      {ROWS.map((row, i) => (
        <div key={row} className={styles.row}>
          {i === 2 && <span className={`${styles.key} ${styles.mod}`}>⇧</span>}
          {row.split('').map((ch) => (
            <span key={ch} className={styles.key}>
              {ch}
            </span>
          ))}
          {i === 2 && <span className={`${styles.key} ${styles.mod}`}>⌫</span>}
        </div>
      ))}
      <div className={styles.row}>
        <span className={`${styles.key} ${styles.mod} ${styles.wide}`}>123</span>
        <span className={`${styles.key} ${styles.space}`}>space</span>
        <span className={`${styles.key} ${styles.mod} ${styles.wide}`}>return</span>
      </div>
    </div>
  );
}
