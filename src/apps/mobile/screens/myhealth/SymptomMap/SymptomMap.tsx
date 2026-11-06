/**
 * @screen  M-7.9 · Symptoms map
 * @flow    F07 My Health hub
 * @states  overview (core · areas; unmatched areas greyed) · trace (a symptom's areas lit) ·
 *          area (wheel zoomed, still rolls) · core · empty · list view · from chat
 * @figma   — (proposed design 2026-11-05: Codex symptom-map prototype · Deborah's hypothalamus diagram)
 * @spec    Design request 2026-11-04 (OPEN: add to docs/ux/F07)
 * @xref    web: W-7.9 (apps/web/screens/myhealth/SymptomMap) — same wheel, parts and copy; page header + inline panel
 */
// OPEN: can people remove a symptom from the map itself? Default: no — edits go through the health profile (M-7.8).
import { useEffect, useMemo, useRef, useState } from 'react';
import { FLAGS } from '@shared/flags';
import { symptomMap } from '@shared/data';
import { reportedInDomain, resolveSymptomMap, satellitesFor, summarizeSymptomMap } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { AnimatePresence, Header, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { AREA_COUNT } from './parts/geometry';
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
  const { previousTitle } = useRoute();
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
    <div className={styles.root} data-xref="M-7.9 · Symptoms map" data-placeholder>
      {/* Zoomed in, the bar keeps only the back button (designer, 2026-11-07). */}
      <Header title={focused && !asList ? undefined : 'Symptoms map'} transparent={focused && !asList} onBack={back} backLabel={asList || (focused && !fromChat) ? 'Whole map' : previousTitle} />
      <div className={styles.scroll}>
        {asList ? (
          <MapList core={core} domains={domains} result={result} />
        ) : (
          <>
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
            <Wheel wheel={wheel} stageRef={stageRef} domains={domains} core={core} strength={summary.strength} satellites={orbit.satellites} trace={trace} onTrace={setTrace} />
            {!focused && orbit.satellites.length > 0 && (
              <TraceBar
                satellites={orbit.satellites}
                overflow={orbit.overflow}
                trace={trace}
                onTrace={setTrace}
                onMore={() => setAsList(true)}
              />
            )}
            {empty && !focused && <EmptyMap onAdd={addSymptoms} onTalk={() => ask()} />}
          </>
        )}
        {(!focused || asList) && (
        <footer className={styles.footer}>
          <p className={styles.disclaimer}>For understanding, not a diagnosis.</p>
        </footer>
        )}
      </div>
      {/* One sheet for the whole zoomed visit: it rises once; only what's inside changes as the wheel rolls. */}
      <AnimatePresence>
        {focused && !asList && (
          <MotionDiv
            key="sheet"
            className={styles.sheet}
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 36 }}
          >
            <div className={styles.sheetBody}>
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
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
