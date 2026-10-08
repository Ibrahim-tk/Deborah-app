/**
 * @shell NotificationBanner — iOS banner inside the device (docs/03-prototype-shell.md §3).
 * Slides from the top, auto-dismisses after 5 s, tap opens its target, swipe up dismisses.
 */
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import styles from './NotificationBanner.module.css';

export interface BannerItem {
  key: string;
  title: string;
  body: string;
  deepLink?: string;
  /** Set when the banner mirrors a queued app notification (marked read on open). */
  notificationId?: string;
}

export interface NotificationBannerProps {
  item: BannerItem;
  onOpen: (item: BannerItem) => void;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5000;
const LEAVE_MS = 240;

export function NotificationBanner({ item, onOpen, onDismiss }: NotificationBannerProps) {
  const [leaving, setLeaving] = useState(false);
  const start = useRef<number | null>(null);
  const moved = useRef(false);

  const leave = () => {
    setLeaving(true);
    window.setTimeout(onDismiss, LEAVE_MS);
  };

  useEffect(() => {
    const id = window.setTimeout(leave, AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
    // Restart the timer only when a different notification arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key]);

  const onPointerDown = (e: PointerEvent) => {
    start.current = e.clientY;
    moved.current = false;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (start.current !== null && start.current - e.clientY > 20) {
      moved.current = true;
      leave();
    }
    start.current = null;
  };

  return (
    <button
      type="button"
      className={styles.root}
      data-leaving={leaving || undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={() => !moved.current && onOpen(item)}
    >
      <img src="/favicon.svg" alt="" className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.head}>
          <span className={styles.app}>{item.title}</span>
          <span className={styles.when}>now</span>
        </span>
        <span className={styles.body}>{item.body}</span>
      </span>
    </button>
  );
}
