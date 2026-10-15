/** @flow-v1/shell AutoDemo — "▶ Auto demo" plays the prototype by itself from the current screen to the first chat. */
import { useEffect, useState } from 'react';
import { tick } from './autopilot';
import styles from './AutoDemo.module.css';

/** Time per action: long enough to read each screen and see the tap land. */
const STEP_MS = 1600;
/** Give up after this many ticks with nothing to do (e.g. a screen the autopilot doesn't understand). */
const IDLE_LIMIT = 5;

export function AutoDemo() {
  const [running, setRunning] = useState(false);
  const [screen, setScreen] = useState<string>();

  useEffect(() => {
    if (!running) return;
    let idle = 0;
    const id = window.setInterval(() => {
      const t = tick();
      setScreen(t.screen);
      idle = !t.done && t.acted ? 0 : idle + 1;
      if (t.done || idle >= IDLE_LIMIT) setRunning(false);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <button
      type="button"
      className={styles.trigger}
      aria-pressed={running}
      title={running && screen ? `Playing · ${screen}` : 'Play the flow by itself, one tap at a time'}
      onClick={() => setRunning((r) => !r)}
    >
      <span aria-hidden="true">{running ? '■' : '▶'}</span> {running ? 'Stop demo' : 'Auto demo'}
    </button>
  );
}
