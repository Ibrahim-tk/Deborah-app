/**
 * @pattern IntakeSectionHeader — section chrome for Complete Intake (M-2.14).
 * @usedBy  Complete Intake · Widget lab
 * @status  placeholder
 */
import styles from './IntakeSectionHeader.module.css';

export interface IntakeSectionHeaderProps {
  title: string;
  lede?: string;
  done?: boolean;
}

export function IntakeSectionHeader({ title, lede, done }: IntakeSectionHeaderProps) {
  return (
    <header className={styles.root} data-placeholder>
      <div className={styles.row}>
        <h2 className={styles.title}>{title}</h2>
        {done && <span className={styles.done}>Saved</span>}
      </div>
      {lede && <p className={styles.lede}>{lede}</p>}
    </header>
  );
}
