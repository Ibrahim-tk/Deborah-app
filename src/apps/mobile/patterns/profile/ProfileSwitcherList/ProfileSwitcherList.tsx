/**
 * @pattern ProfileSwitcherList — profile rows (initial, name, relationship, check on active) + "Add a family member" row
 * @usedBy  M-6.1
 * @spec    docs/ux/F06-family-profiles.md#m-61--profile-switcher
 * @xref    web: apps/web/patterns/profile/ProfileSwitcherList — not built
 */
import type { Profile } from '@shared/types/domain';
import { Avatar, Icon } from '@mobile/ui';
import { relationshipLabel } from './relationship';
import styles from './ProfileSwitcherList.module.css';

/** available: Family plan with room · locked: not on Family · full: Family plan at the 5-profile limit. */
export type AddMemberState = 'available' | 'locked' | 'full';

export interface ProfileSwitcherListProps {
  profiles: Pick<Profile, 'id' | 'name' | 'relationship'>[];
  activeId: string;
  addState: AddMemberState;
  maxProfiles?: number;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function ProfileSwitcherList({ profiles, activeId, addState, maxProfiles = 5, onSelect, onAdd }: ProfileSwitcherListProps) {
  return (
    <div className={styles.root}>
      <ul className={styles.list} aria-label="Profiles">
        {profiles.map((p) => {
          const active = p.id === activeId;
          return (
            <li key={p.id}>
              <button type="button" className={styles.row} aria-current={active || undefined} data-active={active} onClick={() => onSelect(p.id)}>
                <Avatar initial={p.name} size={44} />
                <span className={styles.text}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.relation}>{relationshipLabel(p.relationship)}</span>
                </span>
                {active && <Icon name="check" size={22} className={styles.check} />}
                {active && <span className={styles.srOnly}>Active profile</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.add} onClick={onAdd} disabled={addState === 'full'}>
        <span className={styles.addIcon} aria-hidden="true">
          <Icon name="plus" size={22} />
        </span>
        <span className={styles.addLabel}>Add a family member</span>
        {addState === 'locked' && (
          <span className={styles.lock}>
            <Icon name="lock" size={18} /> Family plan
          </span>
        )}
        {addState === 'full' && (
          <span className={styles.lock}>
            {profiles.length} of {maxProfiles}
          </span>
        )}
      </button>
    </div>
  );
}
