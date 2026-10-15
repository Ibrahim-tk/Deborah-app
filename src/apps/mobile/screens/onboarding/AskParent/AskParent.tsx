/**
 * @screen  M-1.10 · Ask a parent
 * @flow    Core experience onboarding · age gate (Health Intake Logic PDF: under 13 only)
 * @presentation root (replaces Basic details when the self birth year is under 13)
 * @states  default
 * @figma   — not in wireframes
 * @spec    docs/ux/F01-onboarding.md#m-110--ask-a-parent
 * @xref    web: W-1.10 — not built
 *
 * PDF rule: only under-13 selves are blocked (“Ask adult to add you as a family member”). Teens 13–17
 * continue the onboarding profile. Child profiles are added by an adult with guardian consent. Copy is
 * placeholder until legal review.
 */
import { persona } from '@shared/data';
import { Aura, Button, DeborahBlob, GradientShift } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './AskParent.module.css';

export default function AskParent() {
  const { resetTo } = useNav();
  return (
    <div className={styles.root} data-xref="M-1.10 · Ask a parent">
      <Aura />
      <GradientShift />
      <div className={styles.scroll}>
        <div className={styles.intro} data-placeholder>
          <DeborahBlob size={88} label={persona.name} />
          <h1 className={styles.title}>Ask an adult to add you</h1>
          <p className={styles.text}>
            For anyone under 13, a parent or guardian needs to add you as a family member from their own account.
            Once they do, their app will ask the child basics for you.
          </p>
        </div>
        <div className={styles.bottom}>
          <Button fullWidth onClick={() => resetTo('preauth', 'M-1.2')}>Back to the start</Button>
        </div>
      </div>
    </div>
  );
}
