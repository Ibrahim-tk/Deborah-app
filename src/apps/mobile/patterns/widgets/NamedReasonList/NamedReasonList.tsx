/**
 * @pattern NamedReasonList — medications / supplements: add pill → BottomSheet (name + reason) → tiles.
 * @usedBy  Health Basics namedReasons; Widget lab (/wid); chat/intake surfaces with the same shape
 *
 * Main surface shows committed tiles + an add pill. Name/reason draft lives only in the sheet.
 * Quiet "I don't take any" stays under the add control unless `showNone={false}` (the screen owns Skip).
 * Tiles are owned locally so remove (X) is not undone by a stale parent render; remount via `key`
 * when the step/answers source changes (Health Basics already keys by step.key).
 */
import { useState } from 'react';
import { BottomSheet, Button, Icon, IconButton, Input, TextArea } from '@mobile/ui';
import { type NamedReason } from './namedReasons';
import styles from './NamedReasonList.module.css';

export type { NamedReason } from './namedReasons';

export interface NamedReasonListProps {
  label: string;
  entries: NamedReason[];
  /** Trigger + sheet primary CTA, e.g. "Add medicine" / "Add supplement". */
  addLabel?: string;
  noneLabel?: string;
  noneSelected?: boolean;
  namePlaceholder?: string;
  reasonPlaceholder?: string;
  /** Show the quiet in-list "none" button. Off when the screen owns its own Skip (Health Basics). */
  showNone?: boolean;
  onChange: (entries: NamedReason[]) => void;
  onNone: () => void;
}

const blank = (): NamedReason => ({ name: '', reason: '' });
const cleaned = (list: NamedReason[]) => list.filter((e) => e.name.trim());

export function NamedReasonList({
  label,
  entries,
  addLabel = 'Add',
  noneLabel = "I don't take any",
  noneSelected,
  namePlaceholder = 'e.g. Metformin',
  reasonPlaceholder = 'What is it for?',
  showNone = true,
  onChange,
  onNone,
}: NamedReasonListProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NamedReason>(blank);
  // Local tiles: X remove updates this immediately. Remount (key) reloads from `entries`.
  const [tiles, setTiles] = useState<NamedReason[]>(() => cleaned(entries));
  // Parent "none" wins for display without syncing via an effect (avoids cascading setState).
  const shown = noneSelected ? [] : tiles;
  const canAdd = Boolean(draft.name.trim());

  const publish = (next: NamedReason[]) => {
    const kept = cleaned(next);
    setTiles(kept);
    onChange(kept);
  };

  const close = () => {
    setOpen(false);
    setDraft(blank());
  };

  const openSheet = () => {
    setDraft(blank());
    setOpen(true);
  };

  const commit = () => {
    if (!draft.name.trim()) return;
    publish([...tiles, { name: draft.name.trim(), reason: draft.reason.trim() }]);
    close();
  };

  const removeTile = (i: number) => {
    publish(tiles.filter((_, idx) => idx !== i));
  };



  return (
    <div className={styles.root} role="group" aria-label={label}>
      {shown.length > 0 && (
        <ul className={styles.tiles} aria-label="Added">
          {shown.map((item, i) => (
            <li key={`${item.name}-${item.reason}-${i}`} className={styles.tile}>
              <div className={styles.tileText}>
                <span className={styles.tileName}>{item.name}</span>
                {item.reason ? <span className={styles.tileReason}>{item.reason}</span> : null}
              </div>
              <IconButton
                icon="close"
                size="sm"
                label={`Remove ${item.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeTile(i);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.addPill} onClick={openSheet}>
        <Icon name="plus" size={16} aria-hidden />
        {addLabel}
      </button>

      {/* Escape only when the list is empty — once a tile exists, "none" contradicts it. */}
      {showNone && shown.length === 0 && (
        <button
          type="button"
          className={styles.none}
          aria-pressed={Boolean(noneSelected)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            publish([]);
            onNone();
          }}
        >
          {noneLabel}
        </button>
      )}

      <BottomSheet
        showClose
        open={open}
        onClose={close}
        title={addLabel}
        footer={
          <Button fullWidth disabled={!canAdd} onClick={commit}>
            {addLabel}
          </Button>
        }
      >
        <div className={styles.fields}>
          <Input
            label="Name"
            placeholder={namePlaceholder}
            value={draft.name}
            autoComplete="off"
            autoCapitalize="words"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <label className={styles.reason}>
            <span className={styles.reasonLabel}>Reason</span>
            <TextArea
              label="Reason"
              className={styles.reasonBox}
              placeholder={reasonPlaceholder}
              value={draft.reason}
              minRows={3}
              maxRows={6}
              onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
            />
          </label>
        </div>
      </BottomSheet>
    </div>
  );
}
