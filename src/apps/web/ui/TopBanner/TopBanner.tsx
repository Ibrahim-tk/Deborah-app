/**
 * @ui TopBanner — short message that drops in from the top of the screen (e.g. "That's not the correct code.
 * Try again?"), then slides away by itself. Floating pill: icon + one line. Tones: error · success · info.
 * Controlled: pass `open` and `onClose`; it calls `onClose` after `duration` ms (0 = stays until closed).
 * Portals into the phone's overlay host, below the status bar; tap to dismiss early.
 */
import { useEffect } from 'react';
import { cx } from '@shared/utils';
import { AnimatePresence, MotionDiv, REDUCED_FADE, SHEET_SPRING, useReducedMotionPref } from '../Motion';
import { Overlay } from '../Overlay';
import { Icon, type IconName } from '../Icon';
import styles from './TopBanner.module.css';

export type TopBannerTone = 'error' | 'success' | 'info';

export interface TopBannerProps {
  open: boolean;
  message: string;
  onClose: () => void;
  tone?: TopBannerTone;
  /** Auto-hide after this many ms; 0 keeps it until tapped or closed. */
  duration?: number;
}

const ICON: Record<TopBannerTone, IconName> = { error: 'alert', success: 'success', info: 'info' };

export function TopBanner({ open, message, onClose, tone = 'error', duration = 3500 }: TopBannerProps) {
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (!open || !duration) return;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onClose, message]);

  const drop = reduced
    ? REDUCED_FADE
    : { initial: { y: '-160%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '-160%', opacity: 0 }, transition: SHEET_SPRING };

  return (
    <Overlay>
      <AnimatePresence>
        {open && (
          <div className={styles.host} key="top-banner">
            <MotionDiv
              className={cx(styles.banner, styles[tone])}
              role={tone === 'error' ? 'alert' : 'status'}
              aria-live={tone === 'error' ? 'assertive' : 'polite'}
              onClick={onClose}
              {...drop}
            >
              <Icon name={ICON[tone]} size={20} />
              <span className={styles.text}>{message}</span>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </Overlay>
  );
}
