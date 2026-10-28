/**
 * @shell JourneyRunner — "▶ Journeys" menu: plays one core-experience path, or runs all PDF age×gender
 * personas one by one (load scenario → Health Basics → Ask Deborah / under-13 gate).
 * PDF persona runs enable fast sign-up (splash/Welcome/M-1.4 + OTP) so the sheet clears in a few ticks.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setFastSignup } from '../../fastSignup';
import { useScenario } from '../../useScenario';
import { useShellStore } from '../../shell.store';
import { Popover } from '../Popover';
import { MenuItem, MenuSection } from '../MenuParts';
import { GUIDANCE_JOURNEYS, JOURNEYS, type JourneyRun } from './journeys';
import { journeyTick, type PilotState } from './journeyPilot';
import { PDF_PERSONA_RUNS, type PdfPersonaRun } from './pdfPersonas';
import styles from './JourneyRunner.module.css';

/** Time per action during Health Basics / chat (readable). */
const STEP_MS = 1400;
/** Sign-up path (Splash → Welcome → M-1.4 + OTP): half the normal step pace. */
const SIGNUP_MS = Math.round(STEP_MS * 0.5);
/** Ticks with nothing to do (and nothing changing on screen) before the run gives up. */
const IDLE_LIMIT = 10;
const IDLE_SIGNUP = 20;
/** Guidance runs stream 7 sections / labs processing — allow more idle ticks. */
const IDLE_GUIDANCE = 48;

const isGuidanceRun = (j: JourneyRun) =>
  Boolean(j.earlyAnswer || (j.afterAnswer && j.afterAnswer !== 'none') || /cataract/i.test(j.message));

type BatchResult = { id: string; label: string; ok: boolean; at: string };

const usesFastSignup = (j: JourneyRun) => Boolean(j.onboarding && j.profile);

function onSignupScreen() {
  const phone = document.querySelector('.phone-root');
  if (!phone) return true;
  const top = [...phone.querySelectorAll<HTMLElement>('[data-xref]')].at(-1)?.dataset.xref ?? '';
  return /^M-1\.(1|2|4)\b/.test(top);
}

export function JourneyRunner() {
  const isWeb = useLocation().pathname.startsWith('/web');
  const { select } = useScenario();
  const showToast = useShellStore((s) => s.showToast);
  const [run, setRun] = useState<JourneyRun>();
  const [step, setStep] = useState('');
  const [queue, setQueue] = useState<PdfPersonaRun[]>();
  const [batchIndex, setBatchIndex] = useState(0);
  const results = useRef<BatchResult[]>([]);
  const state = useRef<PilotState>({ sent: false, typed: false, editing: false, pickIndex: 0 });

  const clearRun = () => {
    setFastSignup(false);
    setRun(undefined);
    setQueue(undefined);
    setBatchIndex(0);
  };

  useEffect(() => {
    if (!run) return;
    setFastSignup(usesFastSignup(run));
    let idle = 0;
    let lastText = '';
    let timer = 0;

    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, ms);
    };

    const tick = () => {
      const t = journeyTick(run, state.current);
      if (t.step) setStep(t.step);
      const now = document.querySelector('.phone-root')?.textContent ?? '';
      // Reset idle on action or DOM text change (streaming). Do not treat “Waiting…” as eternal — that hung runs.
      idle = t.acted || now !== lastText ? 0 : idle + 1;
      lastText = now;
      const signingUp = usesFastSignup(run) && onSignupScreen();
      const idleCap = signingUp ? IDLE_SIGNUP : isGuidanceRun(run) ? IDLE_GUIDANCE : IDLE_LIMIT;

      if (!(t.done || idle >= idleCap)) {
        schedule(signingUp ? SIGNUP_MS : STEP_MS);
        return;
      }

      const ok = Boolean(t.done && t.passed !== false);
      const at = t.step ?? (t.done ? 'done' : 'idle timeout');
      if (queue) {
        results.current = [...results.current, { id: run.id, label: run.label, ok, at }];
        const next = batchIndex + 1;
        if (next < queue.length) {
          showToast(`${ok ? 'Pass' : 'Fail'} · ${run.label} (${next}/${queue.length})`);
          state.current = { sent: false, typed: false, editing: false, pickIndex: 0 };
          setFastSignup(true);
          select(queue[next].scenario);
          setBatchIndex(next);
          setStep('');
          setRun(queue[next]);
          return;
        }
        const passed = results.current.filter((r) => r.ok).length;
        const failed = results.current.length - passed;
        showToast(`PDF personas done: ${passed} passed, ${failed} failed`);
        clearRun();
        return;
      }
      showToast(t.done ? `Journey finished: ${run.label}` : `Journey stopped at: ${at}`);
      setFastSignup(false);
      setRun(undefined);
    };

    schedule(usesFastSignup(run) ? SIGNUP_MS : STEP_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [run, queue, batchIndex, select, showToast]);

  if (isWeb) return null;

  if (run) {
    const progress = queue ? `${batchIndex + 1} / ${queue.length} · ` : '';
    return (
      <button type="button" className={styles.stop} title={`Playing ${run.label}`} onClick={clearRun}>
        <span aria-hidden="true">■</span> Stop · {progress}{step || run.label}
      </button>
    );
  }

  const start = (j: JourneyRun) => {
    state.current = { sent: false, typed: false, editing: false, pickIndex: 0 };
    results.current = [];
    setQueue(undefined);
    setBatchIndex(0);
    setFastSignup(usesFastSignup(j));
    select(j.scenario);
    setStep('');
    setRun(j);
  };

  const startAllPdf = () => {
    const list = PDF_PERSONA_RUNS;
    state.current = { sent: false, typed: false, editing: false, pickIndex: 0 };
    results.current = [];
    setQueue(list);
    setBatchIndex(0);
    setFastSignup(true);
    select(list[0].scenario);
    setStep('');
    setRun(list[0]);
  };

  return (
    <Popover trigger={<><span aria-hidden="true">▶</span> Journeys <span aria-hidden="true">▾</span></>} width="lg">
      {(close) => (
        <>
          <MenuSection title="Ask Oracle guidance (Miro Step 4)">
            {GUIDANCE_JOURNEYS.map((j) => (
              <MenuItem key={j.id} oneLine label={j.label} description={j.description} onSelect={() => { close(); start(j); }} />
            ))}
          </MenuSection>
          <MenuSection title="PDF personas (age × gender)">
            <MenuItem
              oneLine
              label="Run all PDF personas"
              description={`Play all ${PDF_PERSONA_RUNS.length} gender × age paths one by one; sign-up + OTP is burst-filled.`}
              onSelect={() => { close(); startAllPdf(); }}
            />
            {PDF_PERSONA_RUNS.map((j) => (
              <MenuItem key={j.id} oneLine label={j.label} description={j.description} onSelect={() => { close(); start(j); }} />
            ))}
          </MenuSection>
          <MenuSection title="Play a journey by itself">
            {JOURNEYS.map((j) => (
              <MenuItem key={j.id} oneLine label={j.label} description={j.description} onSelect={() => { close(); start(j); }} />
            ))}
          </MenuSection>
        </>
      )}
    </Popover>
  );
}
