/**
 * A native-style stack: the top screen slides in from the right, the one below shifts left 30 %
 * and dims. Screens below that are hidden but stay mounted (scroll position survives).
 * Swipe from the left edge ≥ 60 px goes back.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
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
  /** Home + main-app stacks: nudge purple backdrop up 40px for contrast. Preauth stays 0. */
  homeBackdrop?: boolean;
}

export function StackView({ routes, action, container, onBack, active = true, homeBackdrop = false }: StackViewProps) {
  const reduced = useReducedMotionPref();
  const edge = useRef<{ x: number; id: number } | null>(null);
  const top = routes.length - 1;

  return (
    <div className={styles.stack} data-active={active} aria-hidden={!active || undefined}>
      <AnimatePresence initial={false}>
        {routes.map((r, i) => {
          // `initial` only applies when a screen mounts, so existing screens never re-enter.
          const isTop = i === top;
          const t = stackTransition(reduced, action, isTop);
          return (
            <StackScreen
              key={r.key}
              route={r}
              previous={routes[i - 1]}
              container={container}
              hidden={i < top - 1}
              isTop={isTop}
              transition={t}
              homeBackdrop={homeBackdrop}
            />
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

/**
 * Screens that keep the gradient / photo backdrop (design direction 2026-10-20): Home, chat, Splash, Welcome and the
 * intake forms. Every other screen sits on the plain canvas colour.
 */
const GRADIENT_SCREENS = new Set(['M-1.1', 'M-1.2', 'M-1.8', 'M-2.0', 'M-2.1', 'M-2.12', 'M-2.14']);

/** One stack layer — keeps a stable node ref so exit can flip `inert` immediately. */
function StackScreen({
  route,
  previous,
  container,
  hidden,
  isTop,
  transition: t,
  homeBackdrop,
}: {
  route: Route;
  previous: Route | undefined;
  container: 'stack' | 'modal';
  hidden: boolean;
  isTop: boolean;
  transition: ReturnType<typeof stackTransition>;
  homeBackdrop: boolean;
}) {
  const node = useRef<HTMLDivElement | null>(null);

  // motion/react keeps the same DOM node across pop, so the callback ref does not re-run when
  // isTop flips. Without this sync, Home stays inert after chat exits and the UI "freezes".
  useEffect(() => {
    if (node.current) node.current.inert = !isTop;
  }, [isTop]);

  return (
    <MotionDiv
      className={styles.screen}
      data-hidden={hidden || undefined}
      data-bg={GRADIENT_SCREENS.has(route.id) ? 'gradient' : 'plain'}
      // Non-top screens never intercept taps (AnimatePresence exit keeps the outgoing
      // chat mounted above Home; without this, Home freezes until the slide finishes —
      // and if anything goes wrong with exit cleanup, forever).
      style={
        {
          pointerEvents: isTop ? 'auto' : 'none',
          ...(homeBackdrop
            ? ({
                ['--backdrop-drift']: '-40px',
                ['--backdrop-blend']: '1',
              } as CSSProperties)
            : null),
        }
      }
      ref={(el: HTMLDivElement | null) => {
        node.current = el;
        if (el) el.inert = !isTop;
      }}
      onAnimationStart={(definition) => {
        // Only force inert ON here (exiting / under-stack). Clearing inert when a screen
        // becomes top is handled by the isTop effect — animation callbacks must not
        // re-stick inert=true on the live Home after pop.
        if (
          node.current &&
          typeof definition === 'object' &&
          definition !== null &&
          'pointerEvents' in definition &&
          (definition as { pointerEvents?: string }).pointerEvents === 'none'
        ) {
          node.current.inert = true;
        }
      }}
      onAnimationComplete={() => {
        // Re-assert after motion finishes — exit variants set inert during the slide; the
        // revealed Home must not stay inert once it is top again.
        if (node.current) node.current.inert = !isTop;
      }}
      initial={t.initial}
      animate={t.animate}
      exit={t.exit}
      transition={t.transition}
    >
      <ScreenHost route={route} previous={previous} container={container} />
    </MotionDiv>
  );
}
