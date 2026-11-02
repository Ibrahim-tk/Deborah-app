/** Runs a store action after a short simulated round trip (docs/07-ai-simulation.md). */
import { useState } from 'react';
import { sleep } from '@shared/utils/sleep';
import { useAdminToast } from './toast.store';

export function useSim() {
  const [busy, setBusy] = useState(false);
  const toast = useAdminToast();
  const run = async (action: () => void, done?: string, ms = 600) => {
    setBusy(true);
    await sleep(ms);
    action();
    setBusy(false);
    if (done) toast(done);
  };
  return { busy, run };
}
