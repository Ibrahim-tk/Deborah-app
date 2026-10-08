/**
 * @screen  M-4.1 · Free limit reached
 * @flow    F04 Free limit, plans & account
 * @states  default (sheet, not dismissible by drag or scrim)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-41--free-limit-reached
 * @xref    web: W-4.1 (apps/web/screens/plans/FreeLimit) — not built
 */
import { useEffect } from 'react';
import { FREE_CONSULTATIONS, useAppStore } from '@shared/store';
import { DeborahBlob, Button, Sheet } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './FreeLimit.module.css';

export default function FreeLimit() {
  const { dismissSheet, presentModal } = useNav();

  // Once shown, the post-answer prompt is no longer pending.
  useEffect(() => useAppStore.getState().dismissLimit(), []);

  return (
    <div data-xref="M-4.1 · Free limit">
      <Sheet
        footer={
          <>
            <Button
              fullWidth
              onClick={() => {
                dismissSheet();
                presentModal('M-4.2');
              }}
            >
              See plans
            </Button>
            <Button variant="ghost" fullWidth onClick={dismissSheet}>
              Maybe later
            </Button>
          </>
        }
      >
        <div className={styles.body}>
          <DeborahBlob size={56} label="Deborah" />
          <h2 className={styles.title}>You’ve used your {FREE_CONSULTATIONS} free consultations</h2>
          <p className={styles.text}>Your answers are saved. Choose a plan to keep talking with me.</p>
        </div>
      </Sheet>
    </div>
  );
}
