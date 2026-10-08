/**
 * @screen  M-6.1 · Profile switcher
 * @flow    F06 Family profiles
 * @states  self active · other profile active · add available (Family) · add locked (other plans) · add full (5 of 5)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203
 * @spec    docs/ux/F06-family-profiles.md#m-61--profile-switcher
 * @xref    web: W-6.1 (apps/web/screens/profiles/ProfileSwitcher) — not built
 */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import { Button, Sheet } from '@mobile/ui';
import { ProfileSwitcherList } from '@mobile/patterns/profile';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav } from '@mobile/navigation';
import { MAX_PROFILES, useAddMember } from '../useAddMember';
import styles from './ProfileSwitcher.module.css';

export default function ProfileSwitcher() {
  const nav = useNav();
  const toast = useToast();
  const { addState, add } = useAddMember();
  const activeId = useAppStore((s) => s.activeProfileId);
  const profiles = useAppStore(useShallow((s) => s.profiles.order.map((id) => s.profiles.byId[id]).filter(Boolean)));
  const many = profiles.length > 3;

  const select = (id: string) => {
    if (id === activeId) return nav.dismissSheet();
    // Resets Ask + My Health to the new profile and closes layers. A streaming answer keeps
    // streaming in its own profile's conversation (store-driven), so nothing moves (acceptance).
    nav.switchProfile(id);
    toast(`Now asking for ${useAppStore.getState().profiles.byId[id]?.name ?? ''}`);
  };

  const manage = () => {
    nav.dismissSheet();
    // The switcher opens from a tab root (Ask, My Health) or Account: manage stacks onto that tab.
    nav.push('M-6.6');
  };

  return (
    <div className={styles.root} data-xref="M-6.1 · Profile switcher">
      <Sheet
        title="Who is this for?"
        detent={many ? 'large' : 'medium'}
        footer={<Button variant="link" onClick={manage}>Manage profiles</Button>}
      >
        <ProfileSwitcherList
          profiles={profiles}
          activeId={activeId}
          addState={addState}
          maxProfiles={MAX_PROFILES}
          onSelect={select}
          onAdd={() => add(true)}
        />
      </Sheet>
    </div>
  );
}
