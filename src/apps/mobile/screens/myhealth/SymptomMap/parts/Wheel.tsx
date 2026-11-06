/**
 * The wheel stage: core + eight discs on one wheel driven by `useWheel`'s motion values.
 * The stage shortens as it zooms so the reading content rides up under the hero.
 */
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { cx } from '@shared/utils';
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
  bridgeIds: Set<string>;
}

export function Wheel({ wheel, stageRef, domains, core, strength, bridgeIds }: Props) {
  const { rotation, zoom, coreZ, selected, mode, dragging } = wheel;
  const widthMV = useMotionValue(353);
  const [width, setWidth] = useState(353);
  const height = useTransform(zoom, [0, 1], [STAGE.overview, STAGE.focus]);
  const keyHeld = useRef(false);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sync = () => { setWidth(el.clientWidth); widthMV.set(el.clientWidth); };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef, widthMV]);

  const press = (i: number) => {
    if (wheel.consumeClick()) return;
    if (mode === 'area' && i !== selected) {
      // A neighbour: roll the wheel to it (shortest way round).
      const d = (((i - selected) % domains.length) + domains.length) % domains.length;
      wheel.step(d <= domains.length / 2 ? 1 : -1);
      return;
    }
    if (mode !== 'area') wheel.focus(i);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    if (keyHeld.current) return;
    keyHeld.current = true;
    wheel.step(e.key === 'ArrowRight' ? 1 : -1);
  };

  const reachable = (i: number) => {
    if (mode === 'overview') return true;
    if (mode === 'core') return false;
    const d = Math.abs(i - selected);
    return d <= 1 || d === domains.length - 1;
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
    >
      <RingField domains={domains} strength={strength} bridgeIds={bridgeIds} rotation={rotation} zoom={zoom} width={width} dragging={dragging} />
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
          onPress={press}
        />
      ))}
    </MotionDiv>
  );
}
