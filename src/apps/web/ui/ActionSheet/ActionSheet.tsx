/** @ui ActionSheet — iOS action sheet (grouped actions + Cancel) on the shared ui/BottomSheet (`actions` variant). */
import { BottomSheet } from '../BottomSheet';
import styles from './ActionSheet.module.css';

export interface ActionSheetAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

export interface ActionSheetProps {
  open: boolean;
  title?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

export function ActionSheet({ open, title, actions, onClose }: ActionSheetProps) {
  return (
    // Shared ui/BottomSheet interaction; the `actions` variant keeps the iOS grouped look.
    <BottomSheet open={open} onClose={onClose} variant="actions" label={title ?? 'Actions'}>
      <div className={styles.panel}>
        <div className={styles.group}>
          {title && <p className={styles.title}>{title}</p>}
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              className={styles.action}
              data-destructive={a.destructive || undefined}
              onClick={() => {
                onClose();
                a.onSelect();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button type="button" className={`${styles.group} ${styles.cancel}`} onClick={onClose} autoFocus>
          Cancel
        </button>
      </div>
    </BottomSheet>
  );
}
