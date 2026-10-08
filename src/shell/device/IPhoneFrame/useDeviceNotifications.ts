/**
 * When banners appear (docs/03-prototype-shell.md §3, docs/ux/F05-followup-labs.md › M-5.1):
 * - a queued notification is delivered while the phone is unlocked;
 * - the phone unlocks without tapping a card: the newest unread one arrives as a banner;
 * - the app calls useDevice().notify().
 * Opening a banner marks its notification read and requests its deep link.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { selectUnreadNotifications, useAppStore, type AppState } from '@shared/store';
import type { AppNotification } from '@shared/types/domain';
import type { BannerItem } from '../NotificationBanner';
import type { DeviceNotification } from '../useDevice';

const fromQueue = (n: AppNotification): BannerItem => ({ key: n.id, title: n.title, body: n.body, deepLink: n.deepLink, notificationId: n.id });

export function useDeviceNotifications() {
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const deliveredIds = (s: AppState) => s.notifications.queue.filter((n) => n.delivered).map((n) => n.id);
    // Whatever is already delivered when the device mounts is not "new".
    seen.current = new Set(deliveredIds(useAppStore.getState()));

    return useAppStore.subscribe((s, prev) => {
      const set = seen.current!;
      const fresh = s.notifications.queue.filter((n) => n.delivered && !n.read && !set.has(n.id));
      fresh.forEach((n) => set.add(n.id));
      // Locking clears any banner; while locked the lock screen lists notifications instead.
      if (s.isLocked) return void (!prev.isLocked && setBanner(null));
      if (fresh.length) return setBanner(fromQueue(fresh[fresh.length - 1]));
      if (prev.isLocked && !s.isLocked) {
        const latest = selectUnreadNotifications(s)[0];
        if (latest) setBanner(fromQueue(latest));
      }
    });
  }, []);

  const notify = useCallback((n: DeviceNotification) => setBanner({ key: `${Date.now()}`, ...n }), []);

  const open = useCallback((item: BannerItem) => {
    setBanner(null);
    const s = useAppStore.getState();
    if (item.notificationId) s.markRead(item.notificationId);
    if (item.deepLink) s.requestDeepLink(item.deepLink);
  }, []);

  const dismiss = useCallback(() => setBanner(null), []);

  return { banner, notify, open, dismiss };
}
