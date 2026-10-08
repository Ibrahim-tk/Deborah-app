/**
 * @screen  M-6.3 · Upgrade to Family
 * @flow    F06 Family profiles (S10 individual wants family)
 * @states  default
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203
 * @spec    docs/ux/F06-family-profiles.md#m-63--upgrade-to-family
 * @xref    web: W-6.3 (apps/web/screens/profiles/UpgradeFamily) — not built
 */
import { Button, Sheet } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './UpgradeFamily.module.css';

export default function UpgradeFamily() {
  const { dismissSheet, presentModal } = useNav();

  const upgrade = () => {
    dismissSheet();
    // M-4.2 preselects Family; returnTo makes M-4.5 lead back into M-6.2 on success.
    presentModal('M-4.2', { preselect: 'family', returnTo: 'M-6.2' });
  };

  return (
    <div data-xref="M-6.3 · Upgrade to Family">
      <Sheet
        title="Family profiles are part of the Family plan"
        footer={
          <>
            <Button fullWidth onClick={upgrade}>Upgrade to Family</Button>
            <Button variant="ghost" fullWidth onClick={dismissSheet}>Not now</Button>
          </>
        }
      >
        <p className={styles.text}>Up to 5 people, each with their own private history.</p>
      </Sheet>
    </div>
  );
}
