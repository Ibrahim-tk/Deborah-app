/**
 * A native-style stack: the top screen slides in from the right, the one below shifts left 30 %
 * and dims. Screens below that are hidden but stay mounted (scroll position survives).
 * Swipe from the left edge ≥ 60 px goes back.
 */
import { useRef } from 'react';
import { AnimatePresence, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { stackTransition } from '../transitions';
import type { NavAction, Route } from '../types';
import { ScreenHost } from './ScreenHost';
import styles from './Navigator.module.css';

export interface StackViewProps {
  routes: Route[];
  action: NavAction;
  container: 'stack' | 'modal';
  onBack: () => void;
  active?: boolean;
}

export function StackView({ routes, action, container, onBack, active = true }: StackViewProps) {
  const reduced = useReducedMotionPref();
  const edge = useRef<{ x: number; id: number } | null>(null);
  const top = routes.length - 1;

  return (
    <div className={styles.stack} data-active={active} aria-hidden={!active || undefined}>
      <AnimatePresence initial={false}>
        {routes.map((r, i) => {
          // `initial` only applies when a screen mounts, so existing screens never re-enter.
          const t = stackTransition(reduced, action, i === top);
          return (
            <MotionDiv
              key={r.key}
              className={styles.screen}
              data-hidden={i < top - 1 || undefined}
              ref={(el: HTMLDivElement | null) => {
                if (el) el.inert = i !== top;
              }}
              initial={t.initial}
              animate={t.animate}
              exit={t.exit}
              transition={t.transition}
            >
              <ScreenHost route={r} previous={routes[i - 1]} container={container} />
            </MotionDiv>
          );
        })}
      </AnimatePresence>
      {routes.length > 1 && (
        <div
          className={styles.edge}
          aria-hidden="true"
          onPointerDown={(e) => {
            edge.current = { x: e.clientX, id: e.pointerId };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            if (edge.current && e.clientX - edge.current.x >= 60) onBack();
            edge.current = null;
          }}
          onPointerCancel={() => (edge.current = null)}
        />
      )}
    </div>
  );
}
