/**
 * @screen  M-1.9 · Deborah's welcome
 * @flow    F01 onboarding (plan P-06): the call to action after the onboarding profile (M-1.8)
 * @presentation sheet over the last onboarding step (hugs its content)
 * @states  for yourself ("Start a conversation") · for someone else ("Start a conversation about {name}")
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md#m-19--deborahs-welcome
 * @xref    web: W-1.9 — not built
 *
 * Deborah's orb and her words revealing, then the CTA opens the first conversation (M-2.1) with the chat
 * input ready. For someone else it first switches to their profile, so the chat is about them (third person,
 * ProfileBanner, minor rules for under-18s). The clinical Health Profile is optional and never gates this chat.
 * OPEN: welcome copy is placeholder until Deborah approves it.
 */
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import { Button, DeborahBlob, Sheet, TextReveal } from '@web/ui';
import { useNav, useScreenParams } from '@web/navigation';
import styles from './DeborahWelcome.module.css';

export default function DeborahWelcome() {
  const { profileId = SELF_PROFILE_ID } = useScreenParams<{ profileId: string }>();
  const { dismissSheet, resetTo, push, switchProfile } = useNav();
  const you = useAppStore((s) => s.profiles.byId[SELF_PROFILE_ID]?.name ?? '');
  const member = useAppStore((s) => (profileId === SELF_PROFILE_ID ? undefined : s.profiles.byId[profileId]));
  // Heading (serif) then body text, same hierarchy as Welcome (M-1.2).
  const title = `Thank you${you ? `, ${you}` : ''}.`;
  const body = member
    ? `I’m glad you’re here for ${member.name}. Tell me what’s been going on, and I’ll ask what I need as we go.`
    : 'I’m so glad you’re here. Tell me what’s on your mind, and I’ll ask what I need as we go.';

  const ask = () => {
    // Empty Ask Deborah only. Chips = Tone Guide scripted samples (signup 3 / login 4). No separate “first consultation”.
    dismissSheet();
    resetTo('main', 'M-2.0');
    if (member) switchProfile(member.id);
    push('M-2.1', { focus: true });
  };

  return (
    <div data-xref="M-1.9 · Deborah's welcome">
      <Sheet footer={<Button fullWidth onClick={ask}>{member ? `Start a conversation about ${member.name}` : 'Start a conversation'}</Button>}>
        <div className={styles.hello} data-placeholder>
          <DeborahBlob size={88} label="Deborah" />
          <div className={styles.copy}>
            <TextReveal as="h1" className={styles.text} text={title} delay={350} />
            <TextReveal className={styles.body} text={body} delay={650} />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
