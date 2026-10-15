/**
 * @shell JourneyRunner — "▶ Journeys" menu: plays one core-experience path by itself (load scenario, type,
 * answer, confirm), one tap at a time. While running, the trigger becomes Stop and shows the current step.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useScenario } from '../../useScenario';
import { useShellStore } from '../../shell.store';
import { Popover } from '../Popover';
import { MenuItem, MenuSection } from '../MenuParts';
import { JOURNEYS, type JourneyRun } from './journeys';
import { journeyTick, type PilotState } from './journeyPilot';
import styles from './JourneyRunner.module.css';

/** Time per action: long enough to read each message and see the tap land. */
const STEP_MS = 1400;
/** Ticks with nothing to do (and nothing changing on screen) before the run gives up. */
const IDLE_LIMIT = 10;

export function JourneyRunner() {
  const isWeb = useLocation().pathname.startsWith('/web');
  const { select } = useScenario();
  const showToast = useShellStore((s) => s.showToast);
  const [run, setRun] = useState<JourneyRun>();
  const [step, setStep] = useState('');
  const state = useRef<PilotState>({ sent: false, typed: false, editing: false });

  useEffect(() => {
    if (!run) return;
    let idle = 0;
    let lastText = '';
    const id = window.setInterval(() => {
      const t = journeyTick(run, state.current);
      if (t.step) setStep(t.step);
      // Streaming answers count as progress even though nothing is tapped.
      const now = document.querySelector('.phone-root')?.textContent ?? '';
      idle = t.acted || now !== lastText ? 0 : idle + 1;
      lastText = now;
      if (t.done || idle >= IDLE_LIMIT) {
        showToast(t.done ? `Journey finished: ${run.label}` : `Journey stopped at: ${t.step ?? 'unknown step'}`);
        setRun(undefined);
      }
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [run, showToast]);

  if (isWeb) return null;

  if (run) {
    return (
      <button type="button" className={styles.stop} title={`Playing ${run.label}`} onClick={() => setRun(undefined)}>
        <span aria-hidden="true">■</span> Stop · {step || run.label}
      </button>
    );
  }

  const start = (j: JourneyRun) => {
    state.current = { sent: false, typed: false, editing: false };
    select(j.scenario);
    setStep('');
    setRun(j);
  };

  return (
    <Popover trigger={<><span aria-hidden="true">▶</span> Journeys <span aria-hidden="true">▾</span></>} width="lg">
      {(close) => (
        <MenuSection title="Play a journey by itself">
          {JOURNEYS.map((j) => (
            <MenuItem key={j.id} label={j.label} description={j.description} onSelect={() => { close(); start(j); }} />
          ))}
        </MenuSection>
      )}
    </Popover>
  );
}
