/**
 * @screen  M-4.5 · You're all set
 * @flow    F04 Free limit, plans & account
 * @states  default · family plan (adds "Add a family member") · from M-6.3 (Add a family member is primary)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-45--youre-all-set
 * @xref    web: W-4.5 (apps/web/screens/plans/PlanSuccess) — not built
 */
import { useAppStore } from '@shared/store';
import { Button, DURATION, EASE_OUT, Icon, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './PlanSuccess.module.css';

export default function PlanSuccess() {
  const { returnToConversation, open } = useNav();
  const reduced = useReducedMotionPref();
  const name = useAppStore((s) => s.userName);
  const plan = useAppStore((s) => s.plan);
  // Upgrading from M-6.3 returns to M-6.2: adding the family member becomes the main action.
  const { returnTo } = useScreenParams<{ returnTo: string }>();
  const addFirst = returnTo === 'M-6.2' && plan === 'family';

  const addMember = (variant: 'primary' | 'secondary') => (
    <Button
      variant={variant}
      fullWidth
      onClick={() => {
        returnToConversation();
        open('M-6.2');
      }}
    >
      Add a family member
    </Button>
  );

  return (
    <div className={styles.root} data-xref="M-4.5 · Plan success">
      <div className={styles.content}>
        {/* Calm arrival: fade and settle, no confetti, no overshoot (DESIGN.md › Motion). */}
        <MotionDiv
          className={styles.mark}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? DURATION.reduced : DURATION.base, ease: EASE_OUT }}
        >
          <Icon name="check" size={40} strokeWidth={1.5} />
        </MotionDiv>
        <h1 className={styles.title}>You’re all set{name ? `, ${name}` : ''}</h1>
        <p className={styles.text}>Unlimited consultations are unlocked.</p>
      </div>
      <div className={styles.actions}>
        {addFirst && addMember('primary')}
        <Button
          variant={addFirst ? 'secondary' : 'primary'}
          fullWidth
          onClick={() => {
            returnToConversation();
            // A message held by the free-limit gate is sent now (F04 M-4.1 behaviour).
            useAppStore.getState().releaseHeld();
          }}
        >
          Continue my conversation
        </Button>
        {plan === 'family' && !addFirst && addMember('secondary')}
      </div>
    </div>
  );
}
