/**
 * @pattern DocumentRow — an uploaded document: type icon, title, "Uploaded 9 Oct · PDF · 412 KB".
 *          Type and format are plain subtitle text, never tags.
 *          Long-press (or right-click) opens the row's options; the tap that ends it doesn't open the row.
 * @usedBy  M-11.1 (My Uploads)
 * @spec    docs/ux/F11-documents.md#m-111--documents-and-reports
 * @xref    web: apps/web/patterns/health/DocumentRow — not built
 */
import { useRef, type MouseEvent } from 'react';
import type { DocumentType } from '@shared/types/domain';
import { Icon, ListRow } from '@web/ui';
import { DOCUMENT_ICON } from './documentIcon';
import styles from './DocumentRow.module.css';

export interface DocumentRowProps {
  title: string;
  type: DocumentType;
  /** Already composed, e.g. "Uploaded 9 Oct · PDF · 412 KB". */
  meta: string;
  onPress: () => void;
  /** Row options (Delete). */
  onLongPress?: () => void;
  /** Desktop master–detail: row is the open pane. */
  selected?: boolean;
}

const LONG_PRESS_MS = 500;

export function DocumentRow({ title, type, meta, onPress, onLongPress, selected = false }: DocumentRowProps) {
  const timer = useRef<number>(undefined);
  const fired = useRef(false);
  const press = onLongPress
    ? {
        onPointerDown: () => {
          fired.current = false;
          timer.current = window.setTimeout(() => { fired.current = true; onLongPress(); }, LONG_PRESS_MS);
        },
        onPointerUp: () => window.clearTimeout(timer.current),
        onPointerLeave: () => window.clearTimeout(timer.current),
        onContextMenu: (e: MouseEvent) => { e.preventDefault(); window.clearTimeout(timer.current); onLongPress(); },
        // Swallow the click that ends a long press.
        onClickCapture: (e: MouseEvent) => { if (fired.current) { e.stopPropagation(); fired.current = false; } },
      }
    : {};
  return (
    <div className={selected ? styles.selected : undefined} data-selected={selected || undefined} {...press}>
      <ListRow
        title={<span className={styles.title}>{title}</span>}
        subtitle={meta}
        leading={
          <span className={styles.icon} aria-hidden>
            <Icon name={DOCUMENT_ICON[type]} size={22} />
          </span>
        }
        onPress={onPress}
      />
    </div>
  );
}
