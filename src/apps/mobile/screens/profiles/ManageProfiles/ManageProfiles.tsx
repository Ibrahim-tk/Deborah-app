/**
 * @screen  M-6.6 · Manage profiles
 * @flow    F06 Family profiles
 * @states  self only · family list · add available · add locked (other plans) · add full (5 of 5)
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F06-family-profiles.md#m-66--manage-profiles-not-in-wireframes
 * @xref    web: W-6.6 (apps/web/screens/profiles/ManageProfiles) — not built
 */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import { Avatar, Header, Icon, ListRow } from '@mobile/ui';
import { relationshipLabel } from '@mobile/patterns/profile';
import { useNav, useRoute } from '@mobile/navigation';
import { MAX_PROFILES, useAddMember } from '../useAddMember';
import styles from './ManageProfiles.module.css';

export default function ManageProfiles() {
  const { pop, push } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const { addState, add } = useAddMember();
  const profiles = useAppStore(useShallow((s) => s.profiles.order.map((id) => s.profiles.byId[id]).filter(Boolean)));

  return (
    <div className={styles.root} data-xref="M-6.6 · Manage profiles">
      <Header title="Family profiles" onBack={canGoBack ? pop : undefined} backLabel={previousTitle} />
      <div className={styles.body}>
        <p className={styles.count}>
          {profiles.length} of {MAX_PROFILES} profiles
        </p>
        <ul className={styles.rows}>
          {profiles.map((p) => (
            <li key={p.id}>
              <ListRow
                title={p.name}
                subtitle={relationshipLabel(p.relationship)}
                leading={<Avatar initial={p.name} size={40} />}
                onPress={() => push('M-6.5', { profileId: p.id })}
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
      </div>
    </div>
  );
}
