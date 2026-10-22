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
import { Avatar, Header, Icon, ListRow } from '@web/ui';
import { relationshipLabel } from '@web/patterns/profile';
import { healthProfileCompletion } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { useWideSplit } from '@web/hooks/useWideSplit';
import { useNav, useRoute } from '@web/navigation';
import { DetailHostProvider } from '../../DetailHost';
import { maxProfilesFor, useAddMember } from '../useAddMember';
import styles from './ManageProfiles.module.css';

const ProfileDetails = lazy(() => import('../ProfileDetails'));

export default function ManageProfiles() {
  const { pop, push } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const { addState, add } = useAddMember();
  const plan = useAppStore((s) => s.plan);
  const profiles = useAppStore(useShallow((s) => s.profiles.order.map((id) => s.profiles.byId[id]).filter(Boolean)));
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    <div className={styles.root} data-xref="M-6.6 · Manage profiles" data-split={wide || undefined}>
      <Header title="Family profiles" onBack={canGoBack ? pop : undefined} backLabel={previousTitle} />
      <div className={styles.body}>
        <div className={styles.listPane}>{list}</div>
        {wide && (
          <div className={styles.detailPane} aria-live="polite">
            {selectedId ? (
              <DetailHostProvider
                screenId="M-6.5"
                params={{ profileId: selectedId }}
                previousTitle="Family profiles"
                onClear={() => setSelectedId(null)}
              >
                <Suspense fallback={<div className={styles.paneLoading}>Loading…</div>}>
                  <ProfileDetails />
                </Suspense>
              </DetailHostProvider>
            ) : (
              <p className={styles.paneEmpty}>Select a profile to view or edit it here.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
