/**
 * @pattern NamedReasonList — medications / supplements: add pill → Sheet (name + reason) → tiles.
 * @usedBy  Health Basics namedReasons; Widget lab (/wid); chat/intake surfaces with the same shape
 *
 * Main surface shows committed tiles + an add pill. Name/reason draft lives only in the sheet.
 * Quiet "I don't take any" stays under the add control (Continue footer still owned by the screen).
 */
import { useEffect, useState } from 'react';
import {
  AnimatePresence,
  Button,
  DURATION,
  EASE_IOS,
  Icon,
  IconButton,
  Input,
  MotionDiv,
  Overlay,
  REDUCED_FADE,
  Sheet,
  useReducedMotionPref,
} from '@mobile/ui';
import { NameSuggest } from './NameSuggest';
import type { NamedReason } from './namedReasons';
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
  /** Seed list for Name autocomplete; omit to use a plain Name field. */
  nameSuggestions?: string[];
  onChange: (entries: NamedReason[]) => void;
  onNone: () => void;
}

const blank = (): NamedReason => ({ name: '', reason: '' });

export function NamedReasonList({
  label,
  entries,
  addLabel = 'Add',
  noneLabel = "I don't take any",
  noneSelected,
  namePlaceholder = 'e.g. Metformin',
  reasonPlaceholder = 'What is it for?',
  nameSuggestions,
  onChange,
  onNone,
}: NamedReasonListProps) {
  const reduced = useReducedMotionPref();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NamedReason>(blank);
  const tiles = entries.filter((e) => e.name.trim());
  const canAdd = Boolean(draft.name.trim());

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
    onChange([...tiles, { name: draft.name.trim(), reason: draft.reason.trim() }]);
    close();
  };

  const removeTile = (i: number) => {
    onChange(tiles.filter((_, idx) => idx !== i));
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const slide = reduced
    ? REDUCED_FADE
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: DURATION.sheet, ease: EASE_IOS } };

  return (
    <div className={styles.root} role="group" aria-label={label}>
      {tiles.length > 0 && (
        <ul className={styles.tiles} aria-label="Added">
          {tiles.map((item, i) => (
            <li key={`${item.name}-${i}`} className={styles.tile}>
              <div className={styles.tileText}>
                <span className={styles.tileName}>{item.name}</span>
                {item.reason ? <span className={styles.tileReason}>{item.reason}</span> : null}
              </div>
              <IconButton icon="close" size="sm" label={`Remove ${item.name}`} onClick={() => removeTile(i)} />
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.addPill} onClick={openSheet}>
        <Icon name="plus" size={16} aria-hidden />
        {addLabel}
      </button>

      <button type="button" className={styles.none} aria-pressed={Boolean(noneSelected)} onClick={onNone}>
        {noneLabel}
      </button>

      <Overlay>
        <AnimatePresence>
          {open && (
            <div className={styles.layer} key="named-reason-sheet">
              <MotionDiv
                className={styles.scrim}
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
              />
              <MotionDiv
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-label={addLabel}
                {...slide}
              >
                <Sheet
                  title={addLabel}
                  detent="medium"
                  className={styles.sheet}
                  footer={
                    <Button fullWidth disabled={!canAdd} onClick={commit}>
                      {addLabel}
                    </Button>
                  }
                >
                  <div className={styles.fields}>
                    {nameSuggestions?.length ? (
                      <NameSuggest
                        label="Name"
                        placeholder={namePlaceholder}
                        value={draft.name}
                        suggestions={nameSuggestions}
                        onChange={(name) => setDraft((d) => ({ ...d, name }))}
                      />
                    ) : (
                      <Input
                        label="Name"
                        placeholder={namePlaceholder}
                        value={draft.name}
                        autoComplete="off"
                        autoCapitalize="words"
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      />
                    )}
                    <Input
                      label="Reason"
                      placeholder={reasonPlaceholder}
                      value={draft.reason}
                      autoComplete="off"
                      onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
                    />
                  </div>
                </Sheet>
              </MotionDiv>
            </div>
          )}
        </AnimatePresence>
      </Overlay>
    </div>
  );
}
