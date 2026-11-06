/**
 * @screen  M-7.9 · Symptoms map
 * @flow    F07 My Health hub
 * @states  overview (core · areas; unmatched areas greyed) · trace (a symptom's areas lit) ·
 *          area (wheel zoomed, still rolls) · core · empty · list view · from chat
 * @figma   — (proposed design 2026-11-05: Codex symptom-map prototype · Deborah's hypothalamus diagram)
 * @spec    Design request 2026-11-04 (OPEN: add to docs/ux/F07)
 * @xref    mobile: M-7.9 (apps/mobile/screens/myhealth/SymptomMap) — same wheel and interactions;
 *          web uses the standard DerivedPage header and an inline panel instead of the bottom sheet.
 */
// OPEN: can people remove a symptom from the map itself? Default: no — edits go through the health profile (M-7.8).
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { FLAGS } from '@shared/flags';
import { symptomMap } from '@shared/data';
import { reportedInDomain, resolveSymptomMap, satellitesFor, summarizeSymptomMap } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { AnimatePresence, IconButton, MotionDiv, useReducedMotionPref } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useScreenParams } from '@web/navigation';
import { AREA_COUNT, STAGE } from './parts/geometry';
import { useWheel } from './parts/useWheel';
import { Wheel } from './parts/Wheel';
import { AreaContent } from './parts/AreaContent';
import { CoreContent } from './parts/CoreContent';
import { EmptyMap } from './parts/EmptyMap';
import { MapList } from './parts/MapList';
import { TraceBar } from './parts/TraceBar';
import styles from './SymptomMap.module.css';

/** `highlight`: symptom labels from the chat, joined with `|` (route params are scalars). */
type Params = { focus?: string; highlight?: string };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function SymptomMap() {
  const { pop, openAsk, presentModal } = useNav();
  const params = useScreenParams<Params>();
  const highlight = useMemo(() => (params.highlight ? params.highlight.split('|') : []), [params.highlight]);
  const profile = useAppStore(selectActiveProfile);
  const byId = useAppStore((s) => s.conversations.byId);
  const reduced = useReducedMotionPref();
  const { domains, core } = symptomMap;

  const conversations = useMemo(() => Object.values(byId).filter((c) => c.profileId === profile?.id), [byId, profile?.id]);
  const result = useMemo(() => resolveSymptomMap(profile, conversations, FLAGS.symptomMapDemo), [profile, conversations]);
  const summary = useMemo(() => summarizeSymptomMap(result), [result]);
  // Inner orbit (L0 → L1): the person's symptoms; tracing one lights the areas it belongs to.
  const orbit = useMemo(() => satellitesFor(result), [result]);
  const [trace, setTrace] = useState<string | null>(null);
  const empty = summary.total === 0;
  // Reading guide for the overview (designer, 2026-11-06): say what the circles mean, in the person's terms.

  const focusIndex = params.focus ? domains.findIndex((d) => d.id === params.focus) : -1;
  const fromChat = focusIndex >= 0;
  const stageRef = useRef<HTMLDivElement>(null!);
  const wheel = useWheel(stageRef, reduced, fromChat ? focusIndex : undefined);
  const { mode, selected, unfocus } = wheel;
  const [asList, setAsList] = useState(false);

  // Fluid wheel (designer, 2026-11-07): zoom to fit the column and the window, never clipped.
  // Text inside grows more gently (√zoom) so circles and labels stay in proportion.
  const wheelCell = useRef<HTMLDivElement>(null);
  const [wz, setWz] = useState(1.5);
  useLayoutEffect(() => {
    const el = wheelCell.current;
    if (!el) return;
    const fit = () => {
      // Fit the tallest stage (zoomed C-wheel) below the page header with room for the pinned disclaimer.
      const top = el.getBoundingClientRect().top + window.scrollY;
      const room = window.innerHeight - Math.max(top, 160) - 56;
      const byWidth = el.clientWidth / 380;
      const byHeight = room / STAGE.focus;
      setWz(Math.max(0.8, Math.min(1.9, byWidth, byHeight)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [asList]);

  // Direction of the last roll, so the content slides the way the wheel turned.
  const [prevSel, setPrevSel] = useState(selected);
  const [dir, setDir] = useState(0);
  if (selected !== prevSel) {
    const d = (((selected - prevSel) % AREA_COUNT) + AREA_COUNT) % AREA_COUNT;
    setDir(d <= AREA_COUNT / 2 ? 1 : -1);
    setPrevSel(selected);
  }

  const domain = domains[selected];
  const reported = useMemo(() => reportedInDomain(domain.id, result), [domain.id, result]);

  const ask = (topic?: string) => openAsk({ prefill: topic ? `How do my symptoms connect to ${topic.toLowerCase()}?` : 'How do my symptoms connect?' });
  const addSymptoms = () => profile && presentModal('M-7.8', { profileId: profile.id, section: 'history' });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setTrace(null); unfocus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [unfocus]);

  const focused = mode !== 'overview';
  // From the chat tile, back returns to the chat; otherwise a zoomed wheel steps back out first.
  // Back steps up one level: list → map, area → overview, trace → overview.
  const back = asList ? () => setAsList(false) : focused && !fromChat ? unfocus : trace ? () => setTrace(null) : pop;
  // Zooming into an area or the core leaves the trace behind.
  if (focused && trace) setTrace(null);
  const swap = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: dir * 14 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: dir * -14 } };

  return (
    <DerivedPage title="Symptoms map" onBack={back} contentWidth={1120}>
      {/* Laptop layout (designer, 2026-11-07): text left-aligned on the left, the wheel at 2× on the right. */}
      <div className={styles.body} data-xref="M-7.9 · Symptoms map" data-placeholder>
        {asList ? (
          <MapList core={core} domains={domains} result={result} />
        ) : (
          <div className={styles.layout}>
            <div className={styles.side}>
              <AnimatePresence initial={false}>
                {!focused && (
                  <MotionDiv
                    key="intro"
                    className={styles.intro}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.36, ease: EASE }}
                  >
                    <h1 className={styles.heading}>How your symptoms connect</h1>
                    <p className={styles.eyebrow}>Tap a circle to see your symptoms.</p>
                  </MotionDiv>
                )}
              </AnimatePresence>
              {!focused && orbit.satellites.length > 0 && (
                <TraceBar
                  satellites={orbit.satellites}
                  overflow={orbit.overflow}
                  trace={trace}
                  onTrace={setTrace}
                  onMore={() => setAsList(true)}
                />
              )}
              {/* Zoomed: one panel beside the wheel; only what's inside changes as the wheel rolls. */}
              <div className={styles.panelRow}>
              <AnimatePresence>
                {focused && (
                  <MotionDiv
                    key="panel"
                    className={styles.panel}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 36 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <MotionDiv
                        key={mode === 'core' ? 'core' : domain.id}
                        className={styles.content}
                        {...swap}
                        transition={{ duration: 0.22, ease: EASE }}
                        aria-live="polite"
                      >
                        {mode === 'core' ? (
                          <CoreContent core={core} />
                        ) : (
                          <AreaContent domain={domain} result={result} reported={reported} highlight={highlight} />
                        )}
                      </MotionDiv>
                    </AnimatePresence>
                  </MotionDiv>
                )}
              </AnimatePresence>
              {/* Up / down beside the card: roll the C-wheel one area (designer, 2026-11-07). */}
              {mode === 'area' && (
                <div className={styles.rail}>
                  <IconButton icon="chevronDown" className={styles.up} label="Previous area" tone="surface" onClick={() => wheel.step(-1)} />
                  <IconButton icon="chevronDown" label="Next area" tone="surface" onClick={() => wheel.step(1)} />
                </div>
              )}
              </div>
              {empty && !focused && <EmptyMap onAdd={addSymptoms} onTalk={() => ask()} />}
            </div>
            <div ref={wheelCell} className={styles.wheelCell}>
              <div className={styles.wheelCol} style={{ '--wz': wz, '--wt': 1 / Math.sqrt(wz) } as CSSProperties}>
                <Wheel wheel={wheel} stageRef={stageRef} domains={domains} core={core} strength={summary.strength} satellites={orbit.satellites} trace={trace} onTrace={setTrace} />
              </div>
            </div>
          </div>
        )}
        {/* Disclaimer at the bottom centre of the page, under both columns. */}
        <p className={styles.pageDisclaimer}>For understanding, not a diagnosis.</p>
      </div>
    </DerivedPage>
  );
}
