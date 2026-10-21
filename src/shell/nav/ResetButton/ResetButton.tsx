/** @shell ResetButton — starts the prototype over from the splash (first-run scenario), after confirming. */
import { useScenario } from '../../useScenario';
import { Popover } from '../Popover';
import styles from './ResetButton.module.css';

export function ResetButton() {
  const { reset } = useScenario();
  return (
    <Popover trigger={<><span aria-hidden="true">⟲</span> Reset</>} label="Reset prototype" width="sm">
      {(close) => (
        <div className={styles.body}>
          <p className={styles.title}>Reset prototype?</p>
          <p className={styles.text}>Clears saved app data and starts over from the splash screen as a new user. Toggles are kept.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                reset();
                close();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
