/**
 * @pattern SymptomPicker — shared ui/BottomSheet from the composer's "Symptoms" button: a search field, common
 *          symptoms grouped by area as toggle pills (tint when selected, no checkmark), and "Add '…'" for
 *          anything rare or unlisted. "Add to message" drops the picked symptoms into the draft.
 * @usedBy  M-2.1, M-2.12
 * @spec    design direction 2026-10-14 (OPEN: add to docs/ux/F02-consultation.md) · data/intake/symptoms.json
 * @xref    web: apps/web/patterns/chat/SymptomPicker — not built
 * OPEN: DESIGN.md bans pills; the toggle pill matches ChoicePills (design direction 2026-10-14).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { symptomGroups } from '@shared/data';
import { BottomSheet, Button, Input } from '@mobile/ui';
import styles from './SymptomPicker.module.css';

export interface SymptomPickerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (symptoms: string[]) => void;
}

export function SymptomPicker({ open, onClose, onAdd }: SymptomPickerProps) {
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

  // Category tabs: jump to a group; the active tab follows the scroll.
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>();
  const scroller = () => listRef.current?.closest<HTMLElement>('[data-sheet-scroll]') ?? listRef.current?.parentElement ?? null;
  const jump = (title: string) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-group="${CSS.escape(title)}"]`);
    const box = scroller();
    if (!el || !box) return;
    setActive(title);
    box.scrollTo({ top: el.offsetTop - (listRef.current?.offsetTop ?? 0), behavior: 'smooth' });
  };
  useEffect(() => {
    const box = scroller();
    if (!open || !box) return;
    const onScroll = () => {
      const top = box.scrollTop + (listRef.current?.offsetTop ?? 0) + 8;
      const sections = [...(listRef.current?.querySelectorAll<HTMLElement>('[data-group]') ?? [])];
      const current = sections.filter((el) => el.offsetTop <= top).at(-1) ?? sections[0];
      if (current) setActive(current.dataset.group);
    };
    box.addEventListener('scroll', onScroll, { passive: true });
    return () => box.removeEventListener('scroll', onScroll);
  }, [open, groups.length]);
  const current = active ?? groups[0]?.title;

  return (
    <BottomSheet
      showClose
      open={open}
      onClose={close}
      height="large"
      label="Add symptoms"
      /* Sheet footer: pinned to the very bottom of the sheet. */
      footer={
        <Button fullWidth disabled={!picked.length} onClick={() => { onAdd(picked); close(); }}>
          {picked.length ? 'Add' : 'Pick what you’re feeling'}
        </Button>
      }
      titleEnd={
        <Input
          variant="search"
          label="Search symptoms"
          hideLabel
          className={styles.search}
          value={query}
          placeholder="Search or type any symptom"
          enterKeyHint="done"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && q && !exact) { e.preventDefault(); addOwn(); } }}
        />
      }
    >
      {/* Searching: a plain heading, no "Add …" row (design 2026-10-21); Enter still adds the typed words. */}
      {q && <p className={styles.results}>Results for “{query.trim()}”</p>}
      {!q && groups.length > 1 && (
        <div className={styles.tabs} role="tablist" aria-label="Symptom areas">
          {groups.map((g) => (
            <button key={g.title} type="button" role="tab" aria-selected={g.title === current} className={styles.tab} onClick={() => jump(g.title)}>
              {g.title}
            </button>
          ))}
        </div>
      )}
      <div ref={listRef} className={styles.list}>
        {groups.map((g) => (
          <section key={g.title} data-group={g.title} className={styles.group} aria-label={g.title}>
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
    </BottomSheet>
  );
}
