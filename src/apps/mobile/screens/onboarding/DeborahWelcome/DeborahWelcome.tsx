/**
 * @screen  M-1.9 · Deborah's welcome
 * @flow    F01 First launch & onboarding (design direction 2026-10-13 rev 5)
 * @presentation sheet over the last health question (hugs its content), right after M-1.8
 * @states  default
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md (OPEN: add M-1.9 to the spec)
 * @xref    web: W-1.9 — not built
 *
 * Deborah's orb and her words revealing, then "Start my journey" opens the first chat (M-2.1), where the first
 * message asks for health-data consent. OPEN: welcome copy is placeholder until Deborah approves it.
 */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Button, DeborahBlob, Sheet, TextReveal } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './DeborahWelcome.module.css';

export default function DeborahWelcome() {
  const { dismissSheet, resetTo, push } = useNav();
  const name = useAppStore((s) => selectActiveProfile(s)?.name ?? '');
  const hello = `Thank you${name ? `, ${name}` : ''}. I’m so glad you’re here. I have everything I need to get started. Let’s talk.`;

  const ask = () => {
    // The scripted first consultation (M-2.12) opens on top of Home, so Back lands there.
    dismissSheet();
    resetTo('main', 'M-2.0');
    push('M-2.12');
  };

  return (
    <div data-xref="M-1.9 · Deborah's welcome">
      <Sheet footer={<Button fullWidth onClick={ask}>Start my journey</Button>}>
        <div className={styles.hello} data-placeholder>
          <DeborahBlob size={88} label="Deborah" />
          <TextReveal className={styles.text} text={hello} delay={350} />
        </div>
      </Sheet>
    </div>
  );
}
