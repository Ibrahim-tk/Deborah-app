/**
 * @screen  M-1.9 · Deborah's welcome
 * @flow    F01 onboarding (plan P-06): the call to action after the onboarding profile (M-1.8)
 * @presentation sheet over the last onboarding step (hugs its content)
 * @states  for yourself ("Start chatting") · for someone else ("Start talking about {name}")
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md#m-19--deborahs-welcome
 * @xref    web: W-1.9 — not built
 *
 * Deborah's orb and her words revealing, then the CTA opens the first conversation (M-2.1) with the chat
 * input ready. For someone else it first switches to their profile, so the chat is about them (third person,
 * ProfileBanner, minor rules for under-18s). The health profile is then built in the chat. The scripted first
 * consultation (M-2.12) only plays when your own profile already fits it (`firstConsultFor`).
 * OPEN: welcome copy is placeholder until Deborah approves it.
 */
import { firstConsultFor } from '@shared/engine';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Button, DeborahBlob, Sheet, TextReveal } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './DeborahWelcome.module.css';

export default function DeborahWelcome() {
  const { profileId = SELF_PROFILE_ID } = useScreenParams<{ profileId: string }>();
  const { dismissSheet, resetTo, push, switchProfile } = useNav();
  const you = useAppStore((s) => s.profiles.byId[SELF_PROFILE_ID]?.name ?? '');
  const member = useAppStore((s) => (profileId === SELF_PROFILE_ID ? undefined : s.profiles.byId[profileId]));
  const hello = member
    ? `Thank you${you ? `, ${you}` : ''}. I’m glad you’re here for ${member.name}. Tell me what’s been going on, and I’ll ask what I need as we go.`
    : `Thank you${you ? `, ${you}` : ''}. I’m so glad you’re here. Tell me what’s on your mind, and I’ll ask what I need as we go.`;

  const ask = () => {
    const s = useAppStore.getState();
    // The first conversation opens on top of Home, so Back lands there.
    dismissSheet();
    resetTo('main', 'M-2.0');
    if (member) {
      // Ask tab resets to this profile's Home; the chat then opens about them.
      switchProfile(member.id);
      return push('M-2.1', { focus: true });
    }
    if (firstConsultFor(s.profiles.byId[SELF_PROFILE_ID], nowFrom(s))) push('M-2.12');
    else push('M-2.1', { focus: true });
  };

  return (
    <div data-xref="M-1.9 · Deborah's welcome">
      <Sheet footer={<Button fullWidth onClick={ask}>{member ? `Start talking about ${member.name}` : 'Start chatting'}</Button>}>
        <div className={styles.hello} data-placeholder>
          <DeborahBlob size={88} label="Deborah" />
          <TextReveal className={styles.text} text={hello} delay={350} />
        </div>
      </Sheet>
    </div>
  );
}
