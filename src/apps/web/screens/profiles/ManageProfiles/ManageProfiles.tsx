/**
 * @screen  M-6.6 · Manage profiles (web)
 * @flow    F06 Family profiles
 * @states  self only · family list · add available · add locked · add full · wide master–detail
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F06-family-profiles.md#m-66--manage-profiles-not-in-wireframes
 * @xref    mobile: apps/mobile/screens/profiles/ManageProfiles
 */
import { lazy, Suspense, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import { Avatar, Icon, ListRow } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { relationshipLabel } from '@web/patterns/profile';
import { healthProfileCompletion } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { useWideSplit } from '@web/hooks/useWideSplit';
import { useNav } from '@web/navigation';
import { DetailHostProvider } from '../../DetailHost';
import { maxProfilesFor, useAddMember } from '../useAddMember';
import styles from './ManageProfiles.module.css';

const ProfileDetails = lazy(() => import('../ProfileDetails'));

export default function ManageProfiles() {
  const { push } = useNav();
  const { addState, add } = useAddMember();
  const plan = useAppStore((s) => s.plan);
  const profiles = useAppStore(useShallow((s) => s.profiles.order.map((id) => s.profiles.byId[id]).filter(Boolean)));
  // Wide: the active profile (usually you) is open by default, so details are always in view.
  const activeId = useAppStore((s) => s.activeProfileId);
  const [picked, setSelectedId] = useState<string | null>(null);
  const selectedId = picked && profiles.some((p) => p.id === picked) ? picked : activeId;
  const wide = useWideSplit();

  const onSelect = (id: string) => {
    if (wide) setSelectedId(id);
    else push('M-6.5', { profileId: id });
  };

  const list = (
    <>
      <p className={styles.count}>
        {profiles.length} of {maxProfilesFor(plan)} profiles
      </p>
      <ul className={styles.rows}>
        {profiles.map((p) => (
          <li key={p.id}>
            <ListRow
              title={p.name}
              subtitle={relationshipLabel(p.relationship, p.intake?.relationshipOther)}
              value={`${Math.round(healthProfileCompletion(p) * 100)}%`}
              leading={<Avatar initial={p.name} size={40} />}
              selected={wide && selectedId === p.id}
              onPress={() => onSelect(p.id)}
            />
          </li>
        ))}
      </ul>

      <button type="button" className={styles.add} onClick={() => add(false)} disabled={addState === 'full'}>
        <Icon name="plus" size={22} />
        <span className={styles.addLabel}>Add a family member</span>
        {addState === 'locked' && (
          <span className={styles.lock}>
            <Icon name="lock" size={18} /> Family plan
          </span>
        )}
      </button>
      <p className={styles.note}>Each person has their own private history. Histories never mix.</p>
    </>
  );

  return (
    <DerivedPage
      title="Family profiles"
      split={wide}
      detail={
        <DetailHostProvider screenId="M-6.5" params={{ profileId: selectedId }} previousTitle="Family profiles" onClear={() => setSelectedId(null)}>
          <Suspense fallback={<div className={styles.paneLoading}>Loading…</div>}>
            <ProfileDetails key={selectedId} />
          </Suspense>
        </DetailHostProvider>
      }
    >
      <div data-xref="M-6.6 · Manage profiles">{list}</div>
    </DerivedPage>
  );
}
