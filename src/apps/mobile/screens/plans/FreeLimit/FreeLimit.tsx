/**
 * @screen  M-4.1 · Free limit reached
 * @flow    F04 Free limit, plans & account
 * @states  default (sheet, not dismissible by drag or scrim)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-41--free-limit-reached
 * @xref    web: W-4.1 (apps/web/screens/plans/FreeLimit) — not built
 */
import { useEffect } from 'react';
import { TRIAL_DAYS, useAppStore } from '@shared/store';
import { DeborahBlob, Button, Sheet } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './FreeLimit.module.css';

// Oracle Change Requests (Oct 26): the free trial is conversations only.
const LOCKED_COPY = {
  journey: { title: 'Your Wellness Plan unlocks with a subscription', body: 'Your free trial includes conversations. Choose a plan to unlock Your Wellness Plan.' },
  documents: { title: 'Downloads unlock with a subscription', body: 'Your free trial includes conversations. Choose a plan to download provider-ready notes.' },
  family: { title: 'Family profiles unlock with a subscription', body: 'Your free trial includes conversations. Choose the Family plan to add up to 3 family members.' },
};

export default function FreeLimit() {
  const { dismissSheet, presentModal } = useNav();

  // `reason`: a plan-only feature tapped during the trial (Wellness Plan, downloads, family profiles).
  const { reason } = useScreenParams<{ reason?: 'journey' | 'documents' | 'family' }>();
  const locked = reason ? LOCKED_COPY[reason] : undefined;

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
          <DeborahBlob size={56} label="The Oracle" />
          <h2 className={styles.title}>{locked ? locked.title : `Your ${TRIAL_DAYS}-day free trial has ended`}</h2>
          <p className={styles.text}>{locked ? locked.body : 'Your conversations are saved. Choose a plan to keep talking with Oracle.'}</p>
        </div>
      </Sheet>
    </div>
  );
}
