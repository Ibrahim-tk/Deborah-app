/**
 * The wheel stage: core + eight discs on one wheel driven by `useWheel`'s motion values.
 * The stage shortens as it zooms so the reading content rides up under the hero.
 */
import { useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { cx } from '@shared/utils';
import type { SymptomSatellite } from '@shared/engine';
import type { SymptomMapCore, SymptomMapDomain } from '@shared/types/health';
import { MotionDiv, useMotionValue, useTransform } from '@mobile/ui';
import { AreaDisc } from './AreaDisc';
import { CoreDisc } from './CoreDisc';
import { RingField } from './RingField';
import { STAGE } from './geometry';
import type { useWheel } from './useWheel';
import styles from './Wheel.module.css';

interface Props {
  wheel: ReturnType<typeof useWheel>;
  stageRef: RefObject<HTMLDivElement>;
  domains: SymptomMapDomain[];
  core: SymptomMapCore;
  strength: Record<string, 0 | 1 | 2>;
  satellites: SymptomSatellite[];
  /** Traced symptom (L1): its areas stay lit, the rest dim. */
  trace: string | null;
  onTrace: (label: string | null) => void;
}

export function Wheel({ wheel, stageRef, domains, core, strength, satellites, trace, onTrace }: Props) {
  const { rotation, zoom, coreZ, selected, mode, dragging } = wheel;
  const widthMV = useMotionValue(353);
  const height = useTransform(zoom, [0, 1], [STAGE.overview, STAGE.focus]);
  const keyHeld = useRef(false);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sync = () => widthMV.set(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef, widthMV]);

  const press = (i: number) => {
    if (wheel.consumeClick()) return;
    // Zoomed: any visible side disc rolls straight to the middle (shortest way round).
    if (mode === 'area' && i !== selected) { wheel.focus(i); return; }
    if (mode !== 'area') wheel.focus(i);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    if (keyHeld.current) return;
    keyHeld.current = true;
    wheel.step(e.key === 'ArrowRight' ? 1 : -1);
  };

  const traced = satellites.find((s) => s.label === trace);
  const tone = (id: string): 'quiet' | 'dim' | undefined => {
    if (mode !== 'overview') return undefined;
    if (traced) return traced.domainIds.includes(id) ? undefined : 'dim';
    return strength[id] ? undefined : 'quiet';
  };

  const reachable = (i: number) => {
    if (mode === 'overview') return true;
    if (mode === 'core') return true;
    const d = Math.abs(i - selected);
    return Math.min(d, domains.length - d) <= 2;
  };

  return (
    <MotionDiv
      ref={stageRef}
      className={cx(styles.stage, mode !== 'overview' && styles.zoomed, dragging && styles.dragging)}
      style={{ height }}
      aria-label="Symptom areas wheel"
      role="group"
      onKeyDown={onKeyDown}
      onKeyUp={() => { keyHeld.current = false; }}
      {...wheel.handlers}
      // Tapping empty stage clears a trace.
      onClick={(e) => { if (e.target === e.currentTarget && !wheel.consumeClick()) onTrace(null); }}
    >
      <RingField rotation={rotation} zoom={zoom} />
      <CoreDisc core={core} zoom={zoom} coreZ={coreZ} onPress={() => { if (!wheel.consumeClick()) wheel.focusCore(); }} />
      {domains.map((d, i) => (
        <AreaDisc
          key={d.id}
          domain={d}
          index={i}
          strength={strength[d.id] ?? 0}
          rotation={rotation}
          zoom={zoom}
          coreZ={coreZ}
          width={widthMV}
          reachable={reachable(i)}
          tone={tone(d.id)}
          onPress={press}
        />
      ))}
    </MotionDiv>
  );
}
