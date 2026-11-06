/** Empty state for a filtered table: says why, and offers the way out. */
import styles from './TableFilters.module.css';

export function NoMatches({ text, onClear }: { text: string; onClear?: () => void }) {
  return (
    <>
      {text}
      {onClear && (
        <>
          {' '}
          <button type="button" className={styles.clear} onClick={onClear}>Clear filters</button>
        </>
      )}
    </>
  );
}
