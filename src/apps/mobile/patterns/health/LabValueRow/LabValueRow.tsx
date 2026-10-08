/**
 * @pattern LabValueRow — marker · value · unit · edit icon; "edited" as plain text when changed.
 *          Tap → inline edit (decimal keypad). Swipe left → Delete (also offered while editing,
 *          for keyboard and screen-reader users).
 * @usedBy  M-5.4 (and M-9.5 read mode, phase 6)
 * @spec    docs/ux/F05-followup-labs.md#m-54--check-your-results
 * @xref    web: apps/web/patterns/health/LabValueRow — not built
 */
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { LabValue } from '@shared/types/domain';
import { Button, Icon, Input } from '@mobile/ui';
import styles from './LabValueRow.module.css';

export interface LabValueRowProps {
  value: LabValue;
  editing: boolean;
  onEdit: () => void;
  onChange: (patch: { value?: string; unit?: string }) => void;
  onDone: () => void;
  onDelete: () => void;
}

const REVEAL = 96;

export function LabValueRow({ value, editing, onEdit, onChange, onDone, onDelete }: LabValueRowProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; base: number; moved: boolean } | null>(null);

  if (editing) {
    return (
      <div className={styles.edit}>
        <p className={styles.marker}>{value.marker}</p>
        <div className={styles.fields}>
          <Input label="Value" inputMode="decimal" autoFocus value={value.value} onChange={(e) => onChange({ value: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && onDone()} />
          <Input label="Unit" value={value.unit} onChange={(e) => onChange({ unit: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && onDone()} />
        </div>
        <div className={styles.editActions}>
          <Button variant="ghost" size="sm" leadingIcon="delete" onClick={onDelete}>Delete</Button>
          <Button variant="secondary" size="md" onClick={onDone}>Done</Button>
        </div>
      </div>
    );
  }

  const onPointerDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, base: offset, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6 && !d.moved) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) setOffset(Math.min(0, Math.max(-REVEAL, d.base + dx)));
  };
  // Snap open or closed; the click that follows a drag is swallowed in onClick.
  const onPointerUp = () => {
    if (drag.current?.moved) setOffset((o) => (o < -REVEAL / 2 ? -REVEAL : 0));
    setDragging(false);
  };

  return (
    <div className={styles.root} style={{ '--swipe': `${offset}px` } as CSSProperties}>
      <button type="button" className={styles.delete} tabIndex={offset ? 0 : -1} aria-hidden={!offset || undefined} onClick={onDelete}>
        Delete
      </button>
      <button
        type="button"
        className={styles.row}
        data-dragging={dragging || undefined}
        aria-label={`${value.marker} ${value.value} ${value.unit}${value.edited ? ', edited' : ''}. Edit`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onClick={() => {
          const moved = drag.current?.moved;
          drag.current = null;
          if (moved) return;
          if (offset) return setOffset(0);
          onEdit();
        }}
      >
        <span className={styles.text}>
          <span className={styles.marker}>{value.marker}</span>
          {value.edited && <span className={styles.edited}>edited</span>}
        </span>
        <span className={styles.value}>
          {value.value || '—'} <span className={styles.unit}>{value.unit}</span>
        </span>
        <Icon name="edit" size={20} className={styles.icon} />
      </button>
    </div>
  );
}
