/**
 * @screen  M-7.9 · Symptoms map
 * @flow    F07 My Health hub
 * @states  overview (core + draggable wheel) · area (wheel zoomed, still rolls) · core · empty · list view · from chat
 * @figma   — (proposed design 2026-11-05: Codex symptom-map prototype · Deborah's hypothalamus diagram)
 * @spec    Design request 2026-11-04 (OPEN: add to docs/ux/F07)
 * @xref    web: W-7.9 (apps/web/screens/myhealth/SymptomMap) — blank, desktop design pending
 */
// OPEN: can people remove a symptom from the map itself? Default: no — edits go through the health profile (M-7.8).
import { useEffect, useMemo, useRef, useState } from 'react';
import { FLAGS } from '@shared/flags';
import { symptomMap } from '@shared/data';
import { reportedInDomain, resolveSymptomMap, summarizeSymptomMap } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { AnimatePresence, Button, Header, Icon, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { AREA_COUNT } from './parts/geometry';
import { useWheel } from './parts/useWheel';
import { Wheel } from './parts/Wheel';
import { AreaContent } from './parts/AreaContent';
import { CoreContent } from './parts/CoreContent';
import { EmptyMap } from './parts/EmptyMap';
import { MapList } from './parts/MapList';
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
  const bridgeIds = useMemo(() => new Set(summary.bridges.flatMap((b) => b.domainIds)), [summary]);
  const empty = summary.total === 0;

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
  const yourAreas = useMemo(() => domains.filter((d) => result.domainsHit.includes(d.id)), [domains, result]);

  const jump = (id: string) => wheel.focus(domains.findIndex((d) => d.id === id));
  const ask = (topic?: string) => openAsk({ prefill: topic ? `How do my symptoms connect to ${topic.toLowerCase()}?` : 'How do my symptoms connect?' });
  const addSymptoms = () => profile && presentModal('M-7.8', { profileId: profile.id, section: 'history' });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') unfocus(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [unfocus]);

  const focused = mode !== 'overview';
  // From the chat tile, back returns to the chat; otherwise a zoomed wheel steps back out first.
  const back = asList ? () => setAsList(false) : focused && !fromChat ? unfocus : pop;
  const swap = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: dir * 14 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: dir * -14 } };

  return (
    <div className={styles.root} data-xref="M-7.9 · Symptoms map" data-placeholder>
      <Header title="Symptoms map" onBack={back} backLabel={asList || (focused && !fromChat) ? 'Whole map' : previousTitle} />
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
                  <h1 className={styles.heading}>Your symptom connections</h1>
                  <p className={styles.lede}>{empty ? 'See how symptoms can share one root.' : summary.sentence}</p>
                  <p className={styles.eyebrow}>Linked by {core.label.toLowerCase()}</p>
                </MotionDiv>
              )}
            </AnimatePresence>
            <Wheel wheel={wheel} stageRef={stageRef} domains={domains} core={core} strength={summary.strength} bridgeIds={bridgeIds} />
            {empty && !focused && <EmptyMap onAdd={addSymptoms} onTalk={() => ask()} />}
          </>
        )}
        {(!focused || asList) && (
        <footer className={styles.footer}>
          {!asList && !focused && (
            <button type="button" className={styles.textButton} onClick={wheel.focusCore}>
              <Icon name="target" size={17} />
              <span>See the common denominator</span>
            </button>
          )}
          <button type="button" className={styles.textButton} aria-pressed={asList} onClick={() => setAsList((v) => !v)}>
            <span>{asList ? 'View as map' : 'View as list'}</span>
          </button>
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
                    <CoreContent core={core} yourAreas={yourAreas} onJump={jump} />
                  ) : (
                    <AreaContent domains={domains} domain={domain} result={result} reported={reported} highlight={highlight} onJump={jump} />
                  )}
                </MotionDiv>
              </AnimatePresence>
            </div>
            <div className={styles.sheetFoot}>
              <Button fullWidth onClick={() => ask(mode === 'core' ? undefined : domain.title)}>Ask the Oracle about this</Button>
              <p className={styles.disclaimer}>For understanding, not a diagnosis.</p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
