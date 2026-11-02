/** Simulated real-time figures for the dashboard: small drifts every few seconds while mounted. */
import { useEffect, useState } from 'react';
import { adminMetrics } from '@shared/admin';

export function useLiveMetrics() {
  const [live, setLive] = useState({ active: adminMetrics.activeUsers, conversations: adminMetrics.totalConversations });
  useEffect(() => {
    const t = setInterval(() => {
      setLive((l) => ({
        active: Math.max(0, l.active + Math.round(Math.random() * 6 - 2)),
        conversations: l.conversations + Math.floor(Math.random() * 4),
      }));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return live;
}
