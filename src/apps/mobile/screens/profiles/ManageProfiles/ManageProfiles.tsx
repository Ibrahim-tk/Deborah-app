/**
 * @screen  M-6.6 · Manage profiles
 * @flow    F06 Family profiles
 * @states  self only · [family: invite your teen → M-6.7 · invitation sent rows] · family list · add available · add locked (other plans) · add full (5 of 5)
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F06-family-profiles.md#m-66--manage-profiles-not-in-wireframes
 * @xref    web: W-6.6 (apps/web/screens/profiles/ManageProfiles) — not built
 */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import { Avatar, Header, Icon, ListRow } from '@mobile/ui';
import { relationshipLabel } from '@mobile/patterns/profile';
import { healthProfileCompletion } from '@mobile/screens/onboarding/HealthBasics/healthProfile';
import { useNav, useRoute } from '@mobile/navigation';
import { maxProfilesFor, useAddMember } from '../useAddMember';
import styles from './ManageProfiles.module.css';

export default function ManageProfiles() {
  const { pop, push, presentSheet } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const { addState, add } = useAddMember();
  const plan = useAppStore((s) => s.plan);
  const invites = useAppStore(useShallow((s) => s.teenInvites ?? []));
  const profiles = useAppStore(useShallow((s) => s.profiles.order.map((id) => s.profiles.byId[id]).filter(Boolean)));

  return (
    <div className={styles.root} data-xref="M-6.6 · Manage profiles">
      <Header title="Family profiles" onBack={canGoBack ? pop : undefined} backLabel={previousTitle} />
      <div className={styles.body}>
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
                leading={<Avatar initial={p.name} size={48} />}
                onPress={() => push('M-6.5', { profileId: p.id })}
              />
            </li>
          ))}
        </ul>

        <button type="button" className={styles.add} onClick={() => add(false)} disabled={addState === 'full'}>
          <span className={styles.addIcon} aria-hidden="true">
            <Icon name="plus" size={22} />
          </span>
          <span className={styles.addLabel}>Add a family member</span>
          {addState === 'locked' && (
            <span className={styles.lock} aria-label="Family plan">
              <Icon name="lock" size={18} />
            </span>
          )}
        </button>
        {/* Teen with their own login (F06 teen invite): Family plan only (others get the upgrade prompt); it doesn't use a profile slot. */}
        {(
          <button type="button" className={styles.add} onClick={() => presentSheet(plan === 'family' ? 'M-6.7' : 'M-6.3', plan === 'family' ? undefined : { reason: 'teen' })}>
            <span className={styles.addIcon} aria-hidden="true">
              <Icon name="mail" size={22} />
            </span>
            <span className={styles.addLabel}>Invite your teen to their own account</span>
          </button>
        )}
        {invites.map((i) => (
          <p key={i.email} className={styles.note}>Invitation sent · {i.email}</p>
        ))}
        <p className={styles.note}>You manage each family member’s history as their advocate. Invited teens with their own account keep a private history you can’t see.</p>
      </div>
    </div>
  );
}
