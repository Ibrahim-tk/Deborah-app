/**
 * @shell  LockScreen · M-5.1 Lock screen notification (docs/ux/F05-followup-labs.md#m-51)
 * Wallpaper, large simulated time/date and delivered notifications. Tap a card → unlock (slide
 * up 300 ms) and open its deep link. Swipe up on empty space (or the hint) → unlock to the last
 * screen. Not product UI: iOS chrome in the system font.
 */
import { useRef, useState, type PointerEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectUnreadNotifications, useAppStore } from '@shared/store';
import type { AppNotification } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { formatLockDate, useSimClock } from '../useSimClock';
import styles from './LockScreen.module.css';

const UNLOCK_MS = 300;
const SWIPE_PX = 60;

const reducedMotion = () =>
  document.documentElement.classList.contains('reduced-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ago(iso: string, now: Date): string {
  const min = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  return h < 24 ? `${h}h ago` : new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LockScreen() {
  const time = useSimClock();
  const date = useSimClock(formatLockDate);
  const notifications = useAppStore(useShallow(selectUnreadNotifications));
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const [unlocking, setUnlocking] = useState(false);
  const swipe = useRef<number | null>(null);

  const unlock = (n?: AppNotification) => {
    if (unlocking) return;
    const s = useAppStore.getState();
    // The app navigates behind the sliding lock screen, so it is already there when revealed.
    if (n) {
      s.markRead(n.id);
      s.requestDeepLink(n.deepLink);
    }
    setUnlocking(true);
    window.setTimeout(() => useAppStore.getState().setLocked(false), reducedMotion() ? 120 : UNLOCK_MS);
  };

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    swipe.current = e.clientY;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipe.current !== null && swipe.current - e.clientY >= SWIPE_PX) unlock();
    swipe.current = null;
  };

  return (
    <div
      className={styles.root}
      data-unlocking={unlocking || undefined}
      data-xref="M-5.1 · Lock screen"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
    >
      <div className={styles.clock}>
        <svg className={styles.lock} width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
          <path d="M3 8V5.5a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="0.5" y="7.5" width="13" height="10" rx="2.5" fill="currentColor" />
        </svg>
        <p className={styles.date}>{date}</p>
        <p className={styles.time}>{time}</p>
      </div>

      <div className={styles.list} aria-label="Notifications">
        {notifications.map((n) => (
          <button key={n.id} type="button" className={styles.card} onClick={() => unlock(n)}>
            <img src="/favicon.svg" alt="" className={styles.icon} />
            <span className={styles.cardText}>
              <span className={styles.cardHead}>
                <span className={styles.app}>{n.title}</span>
                <span className={styles.when}>{ago(n.deliverAt, nowFrom(clock))}</span>
              </span>
              <span className={styles.body}>{n.body}</span>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className={styles.hint} onClick={() => unlock()}>
        Swipe up to open
      </button>
    </div>
  );
}
