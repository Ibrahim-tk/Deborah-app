/**
 * Oracle's welcome (M-1.9 content) revealed in place at the centre of M-1.8, after the tree's wind study,
 * instead of the M-1.9 bottom sheet. Copy and CTA mirror screens/onboarding/DeborahWelcome.
 * OPEN: welcome copy is placeholder until clinical review approves it.
 */
import { useState } from 'react';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import { Button, DeborahBlob, TextReveal } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './WelcomeReveal.module.css';

const LEAVE_MS = 500;

export function WelcomeReveal({ profileId = SELF_PROFILE_ID }: { profileId?: string }) {
  const { resetTo, push, switchProfile } = useNav();
  const you = useAppStore((s) => s.profiles.byId[SELF_PROFILE_ID]?.name ?? '');
  const member = useAppStore((s) => (profileId === SELF_PROFILE_ID ? undefined : s.profiles.byId[profileId]));
  const title = `Thank you${you ? `, ${you}` : ''}.`;
  const body = member
    ? `I’m glad you’re here for ${member.name}. Tell me what’s been going on, and I’ll ask what I need as we go.`
    : 'I’m so glad you’re here. Tell me what’s on your mind, and I’ll ask what I need as we go.';

  const [leaving, setLeaving] = useState(false);
  // Fade the welcome out first, then navigate; the chat (M-2.12) fades its own content in, so the hand-off is continuous.
  const ask = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(go, LEAVE_MS);
  };
  const go = () => {
    resetTo('main', 'M-2.0');
    if (member) switchProfile(member.id);
    push('M-2.1', { focus: true });
  };

  return (
    <div className={`${styles.root} ${leaving ? styles.leaving : ''}`} data-overlay data-placeholder>
      <div className={styles.hello}>
        <span className={styles.blob}><DeborahBlob size={88} label="The Oracle" /></span>
        <TextReveal as="h1" className={styles.text} text={title} delay={500} />
        <TextReveal className={styles.body} text={body} delay={900} />
      </div>
      <div className={styles.footer}>
        <Button type="button" fullWidth onClick={ask}>{member ? `Start a conversation about ${member.name}` : 'Start a conversation'}</Button>
      </div>
    </div>
  );
}
