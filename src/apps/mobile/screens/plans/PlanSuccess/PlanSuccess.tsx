/**
 * @screen  M-4.5 · You're all set
 * @flow    F04 Free limit, plans & account
 * @states  default · family plan (adds "Add a family member") · from M-6.3 (Add a family member is primary)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-45--youre-all-set
 * @xref    web: W-4.5 (apps/web/screens/plans/PlanSuccess) — not built
 */
import { useAppStore } from '@shared/store';
import { Button } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './PlanSuccess.module.css';

export default function PlanSuccess() {
  const { returnToConversation, open, presentSheet } = useNav();
  const plan = useAppStore((s) => s.plan);
  // Upgrading from M-6.3 returns to M-6.2: adding the family member becomes the main action.
  const { returnTo } = useScreenParams<{ returnTo: string }>();
  const addFirst = returnTo === 'M-6.2' && plan === 'family';
  const canAddFamily = plan === 'family';

  const continueChat = () => {
    returnToConversation();
    // A message held by the free-limit gate is sent now (F04 M-4.1 behaviour).
    useAppStore.getState().releaseHeld();
  };

  const onAddMember = () => {
    returnToConversation();
    if (canAddFamily) open('M-6.2');
    else presentSheet('M-6.3');
  };

  return (
    <div className={styles.root} data-xref="M-4.5 · Plan success">
      <div className={styles.content} role="status">
        {/* Same green check draw-in as OTP / account-created (M-1.4). */}
        <span className={styles.check}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              className={styles.tick}
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
          </svg>
        </span>
        <h1 className={styles.title}>You’re all set.</h1>
      </div>
      <div className={styles.actions}>
        {addFirst ? (
          <>
            <Button fullWidth onClick={onAddMember}>Add a family member</Button>
            <Button variant="secondary" fullWidth onClick={continueChat}>Continue my conversation</Button>
          </>
        ) : (
          <>
            <Button fullWidth onClick={continueChat}>Continue my conversation</Button>
            <Button variant="secondary" fullWidth onClick={onAddMember}>Add a family member</Button>
          </>
        )}
      </div>
    </div>
  );
}
