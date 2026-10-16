/**
 * @pattern SymptomPicker — bottom sheet from the composer's "Symptoms" button: a search field, common
 *          symptoms grouped by area as toggle pills (tint when selected, no checkmark), and "Add '…'" for
 *          anything rare or unlisted. "Add to message" drops the picked symptoms into the draft.
 * @usedBy  M-2.1, M-2.12
 * @spec    design direction 2026-10-14 (OPEN: add to docs/ux/F02-consultation.md) · data/intake/symptoms.json
 * @xref    web: apps/web/patterns/chat/SymptomPicker — not built
 * OPEN: DESIGN.md bans pills; the toggle pill matches ChoicePills (design direction 2026-10-14).
 */
import { useMemo, useState } from 'react';
import { symptomGroups } from '@shared/data';
import { AnimatePresence, Button, DURATION, EASE_IOS, Icon, IconButton, MotionDiv, Overlay, REDUCED_FADE, useReducedMotionPref } from '@mobile/ui';
import styles from './SymptomPicker.module.css';

export interface SymptomPickerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (symptoms: string[]) => void;
}

export function SymptomPicker({ open, onClose, onAdd }: SymptomPickerProps) {
  const reduced = useReducedMotionPref();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState<string[]>([]);

  // Each opening starts clean; symptoms she added herself stay listed for next time.
  const close = () => {
    setQuery('');
    setPicked([]);
    onClose();
  };

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const all = custom.length ? [{ title: 'Added by you', items: custom }, ...symptomGroups] : symptomGroups;
    return all.map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  }, [q, custom]);
  const exact = groups.some((g) => g.items.some((i) => i.toLowerCase() === q));

  const toggle = (s: string) => setPicked((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]));
  const addOwn = () => {
    const name = query.trim().replace(/^./, (c) => c.toUpperCase());
    setCustom((xs) => (xs.includes(name) ? xs : [name, ...xs]));
    setPicked((xs) => (xs.includes(name) ? xs : [...xs, name]));
    setQuery('');
  };

  const slide = reduced ? REDUCED_FADE : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: DURATION.sheet, ease: EASE_IOS } };

  return (
    <Overlay>
      <AnimatePresence>
        {open && (
          <div className={styles.root} key="symptoms">
            <MotionDiv className={styles.scrim} onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.base }} />
            <MotionDiv className={styles.panel} role="dialog" aria-modal="true" aria-label="Add symptoms" {...slide}>
              <div className={styles.grabber} aria-hidden />
              <header className={styles.head}>
                <h2 className={styles.title}>Symptoms</h2>
                <IconButton icon="close" label="Close" className={styles.close} onClick={close} />
              </header>
              <label className={styles.search}>
                <Icon name="search" size={18} />
                <input
                  className={styles.input}
                  value={query}
                  placeholder="Search or type any symptom"
                  aria-label="Search symptoms"
                  enterKeyHint="done"
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && q && !exact) { e.preventDefault(); addOwn(); } }}
                />
              </label>
              <div className={styles.list}>
                {q && !exact && (
                  <button type="button" className={styles.addOwn} onClick={addOwn}>
                    <Icon name="plus" size={18} /> Add “{query.trim()}”
                  </button>
                )}
                {groups.map((g) => (
                  <section key={g.title} className={styles.group} aria-label={g.title}>
                    <p className={styles.groupTitle}>{g.title}</p>
                    <div className={styles.pills}>
                      {g.items.map((s) => (
                        <button key={s} type="button" className={styles.pill} aria-pressed={picked.includes(s)} onClick={() => toggle(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                {!groups.length && !q && <p className={styles.empty}>No symptoms yet.</p>}
              </div>
              <footer className={styles.foot}>
                <Button fullWidth disabled={!picked.length} onClick={() => { onAdd(picked); close(); }}>
                  {picked.length ? `Add ${picked.length} to message` : 'Pick what you’re feeling'}
                </Button>
              </footer>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </Overlay>
  );
}
