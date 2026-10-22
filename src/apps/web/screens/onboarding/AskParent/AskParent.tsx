/**
 * @screen  M-1.10 · Ask a parent
 * @flow    Core experience onboarding · age gate (Health Intake Logic PDF: under 13 only)
 * @presentation sheet over Health Basics when Myself birth date is under 13
 * @states  default
 * @figma   — not in wireframes
 * @spec    docs/ux/F01-onboarding.md#m-110--ask-a-parent
 * @xref    web: W-1.10 — not built
 *
 * Under-13 selves cannot continue their own profile. Sheet offers Back to the start; a guardian
 * adds them as a family member from an adult account. Copy is placeholder until legal review.
 */
import { persona } from '@shared/data';
import { Button, DeborahBlob, Sheet } from '@web/ui';
import { useNav } from '@web/navigation';
import styles from './AskParent.module.css';

export default function AskParent() {
  const { dismissSheet, resetTo } = useNav();
  const toStart = () => {
    dismissSheet();
    resetTo('preauth', 'M-1.2');
  };
  return (
    <div data-xref="M-1.10 · Ask a parent">
      <Sheet detent="medium" footer={<Button fullWidth onClick={toStart}>Back to the start</Button>}>
        <div className={styles.sheetBody} data-placeholder>
          <DeborahBlob size={72} label={persona.name} />
          <h1 className={styles.sheetTitle}>This profile needs a guardian</h1>
          <p className={styles.sheetText}>
            For anyone under 13, a parent or guardian needs to add you as a family member from their own account.
            Once they do, their app will ask the child basics for you.
          </p>
        </div>
      </Sheet>
    </div>
  );
}
