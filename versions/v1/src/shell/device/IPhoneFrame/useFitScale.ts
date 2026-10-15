/** Scale-to-fit for the device: s = min(1, (stageH − gap) / deviceH, (stageW − gap) / deviceW). */
import { useLayoutEffect, useState, type RefObject } from 'react';
import type { DeviceScale } from '../../shell.store';
import { DEVICE, DEVICE_OUTER } from '../constants';

export function useFitScale(stageRef: RefObject<HTMLElement | null>, mode: DeviceScale): number {
  const [fit, setFit] = useState(1);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setFit(
        Math.max(
          0.1,
          Math.min(1, (height - DEVICE.stageGap) / DEVICE_OUTER.height, (width - DEVICE.stageGap) / DEVICE_OUTER.width),
        ),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stageRef]);

  if (mode === '100') return 1;
  if (mode === '75') return 0.75;
  return fit;
}
