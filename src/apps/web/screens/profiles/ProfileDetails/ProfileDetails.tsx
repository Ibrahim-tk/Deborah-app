/**
 * @screen  M-6.5 · Profile details
 * @flow    F06 Family profiles
 * @states  read · editing · self (no delete, relationship fixed) · teen (periods row) · delete confirm
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203
 * @spec    docs/ux/F06-family-profiles.md#m-65--profile-details
 * @xref    mobile: apps/mobile/screens/profiles/ProfileDetails
 */
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ageOn, isMinor } from '@shared/engine';
import { SELF_PROFILE_ID, selectProfileConversations, selectProfileNotes, useAppStore } from '@shared/store';
import type { Profile } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { Button, Header, ListRow, useAlert } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@web/navigation';
import { useDetailHost } from '../../DetailHost';
import { BasicsSection } from './parts/BasicsSection';
import { HealthSection } from './parts/HealthSection';
import { AGE_BANDS, fromDraft, labelOf, toDateInput, toDraft, type ProfileDraft } from './parts/draft';
import styles from './ProfileDetails.module.css';

export default function ProfileDetails() {
  const { profileId } = useScreenParams<{ profileId: string }>();
  const { pop, push, switchProfile } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const detailHost = useDetailHost();
  const alert = useAlert();
  const toast = useToast();
  const back = detailHost ? detailHost.clear : canGoBack ? pop : undefined;
  const stored = useAppStore((s) => s.profiles.byId[profileId ?? s.activeProfileId]);
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const counts = useAppStore(
    useShallow((s) => ({
      consultations: stored ? selectProfileConversations(s, stored.id).length : 0,
      notes: stored ? selectProfileNotes(s, stored.id).length : 0,
    })),
  );
  // Keep the last known profile so the screen doesn't blank while it pops away after a delete.
  const [shown, setShown] = useState<Profile | undefined>(stored);
  if (stored && stored !== shown) setShown(stored);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  if (!shown) return null;
  const profile = shown;
  const editing = draft !== null;
  const view = draft ?? toDraft(profile);
  const now = nowFrom(clock);
  const isSelf = profile.id === SELF_PROFILE_ID;
  const minor = isMinor({ ...profile, intake: view.intake, relationship: view.relationship }, now);
  const ageText = profile.dob ? String(ageOn(profile.dob, now)) : (labelOf(AGE_BANDS, profile.intake.ageBand) ?? 'Not shared yet');

  const change = (patch: Partial<ProfileDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const toggleEdit = () => {
    if (!draft) return setDraft(toDraft(profile));
    const patch = fromDraft(profile, draft);
    const s = useAppStore.getState();
    s.updateProfile(profile.id, patch.profile);
    s.updateIntake(profile.id, patch.intake);
    setDraft(null);
    toast('Profile updated');
  };

  const records = (segment: 'consultations' | 'notes') => push('M-9.1', { segment, profileId: profile.id });

  const remove = async () => {
    const choice = await alert({
      title: `Delete ${profile.name}’s profile?`,
      message: 'This permanently deletes their history.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive' }],
    });
    if (choice !== 1) return;
    const wasActive = useAppStore.getState().activeProfileId === profile.id;
    (back ?? pop)();
    useAppStore.getState().deleteProfile(profile.id);
    // Deleting the active profile switches to self, which resets Ask + My Health (docs/04 §2).
    if (wasActive) switchProfile(SELF_PROFILE_ID);
    toast(`${profile.name}’s profile was deleted`);
  };

  return (
    <div className={styles.root} data-xref="M-6.5 · Profile details">
      <Header
        title={profile.name}
        // Web master–detail: no second Back inside the pane (the page has its own way out).
        onBack={editing || detailHost ? undefined : back}
        backLabel={previousTitle}
        left={editing ? <Button variant="ghost" size="md" onClick={() => setDraft(null)}>Cancel</Button> : undefined}
        right={<Button variant="ghost" size="md" onClick={toggleEdit}>{editing ? 'Done' : 'Edit'}</Button>}
      />
      <div className={styles.body}>
        <BasicsSection draft={view} editing={editing} isSelf={isSelf} ageText={ageText} today={toDateInput(now)} onChange={change} />
        <HealthSection draft={view} editing={editing} minor={minor} onChange={change} />

        {!editing && (
          <section className={styles.section} aria-labelledby="records-h">
            <h2 id="records-h" className={styles.heading}>History</h2>
            <div className={styles.rows}>
              {/* OPEN: M-9.1 shows the active profile; these pass profileId so it can filter (see report). */}
              <ListRow title="Consultations" value={String(counts.consultations)} onPress={() => records('consultations')} />
              <ListRow title="Visit Notes" value={String(counts.notes)} onPress={() => records('notes')} />
            </div>
          </section>
        )}

        {!isSelf && !editing && (
          <Button variant="destructive" fullWidth leadingIcon="delete" onClick={remove}>
            Delete this profile and its data
          </Button>
        )}
      </div>
    </div>
  );
}
