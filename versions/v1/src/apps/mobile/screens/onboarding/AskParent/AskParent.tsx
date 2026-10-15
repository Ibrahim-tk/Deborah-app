/**
 * @screen  M-1.10 · Ask a parent
 * @flow    Core experience onboarding · age gate (plan DN-03, C-18)
 * @presentation root (replaces Basic details when the date of birth is under 18)
 * @states  default
 * @figma   — not in wireframes
 * @spec    docs/ux/F01-onboarding.md#m-110--ask-a-parent
 * @xref    web: W-1.10 — not built
 *
 * OPEN (O-2): "Can someone under 18 sign up for themselves?" — documented default: no. Teen (13–17) and
 * child (under 13) profiles are added by a parent from Family profiles, with the consent steps legal
 * defines (meeting 2026-10-12 · D, Phase 3). Copy is placeholder until legal review.
 */
import { persona } from '@flow-v1/shared/data';
import { Aura, Button, DeborahBlob, GradientShift } from '@flow-v1/apps/mobile/ui';
import { useNav } from '@flow-v1/apps/mobile/navigation';
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
          <h1 className={styles.title}>Let’s bring in a parent</h1>
          <p className={styles.text}>
            I’d love to help, and for anyone under 18 a parent or guardian needs to set things up first. They can add you
            from their own account, and you’ll still have privacy for the things that are yours.
          </p>
        </div>
        <div className={styles.bottom}>
          <Button fullWidth onClick={() => resetTo('preauth', 'M-1.2')}>Back to the start</Button>
        </div>
      </div>
    </div>
  );
}
