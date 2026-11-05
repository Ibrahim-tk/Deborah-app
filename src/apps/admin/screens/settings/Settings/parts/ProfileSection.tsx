/** My Profile (story 12.1): name, email, role, last sign-in and two-step verification, read first; Edit unlocks the
 *  names (email stays locked). Sign out (asks first) sits bottom right; password and notifications live in their own tabs. */
import { useState } from 'react';
import { formatDate, useAdminSettings, useAdminStore } from '@shared/admin';
import { Button, Input, KeyValueList } from '@admin/ui';
import { Section, UnsavedChangesDialog } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { CopyText } from '@admin/screens/common/CopyEmail';
import s from './settings.module.css';

export function ProfileSection() {
  const email = useAdminStore((st) => st.email);
  const role = useAdminStore((st) => st.role);
  const lastSignInAt = useAdminStore((st) => st.lastSignInAt);
  const me = useAdminStore((st) => st.admins.find((a) => a.email === st.email));
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState(me?.firstName ?? '');
  const [last, setLast] = useState(me?.lastName ?? '');
  const sim = useSim();
  const [leaving, setLeaving] = useState(false);
  const empty = !first.trim() || !last.trim();
  const dirty = first.trim() !== (me?.firstName ?? '') || last.trim() !== (me?.lastName ?? '');
  const nav = useAdminNav.getState();

  const stopEditing = () => {
    setFirst(me?.firstName ?? '');
    setLast(me?.lastName ?? '');
    setEditing(false);
  };
  const save = () => {
    if (empty) return;
    sim.run(() => {
      useAdminSettings.getState().setName(first.trim(), last.trim());
      setEditing(false);
      }, 'Your profile has been updated.');
  };

  return (
    <Section
      title="My profile"
      surface
      trailing={!editing && <Button size="sm" variant="secondary" leadingIcon="edit" onClick={() => setEditing(true)}>Edit</Button>}
    >
      <div className={s.group}>
        {editing ? (
          <div className={s.form}>
            <Input label="First name" value={first} onChange={(e) => { setFirst(e.target.value); }} />
            <Input label="Last name" value={last} error={empty ? 'Please enter your first and last name.' : undefined} onChange={(e) => { setLast(e.target.value); }} />
            <div className={s.actions}>
              <Button size="sm" loading={sim.busy} disabled={!dirty || empty} onClick={save}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => (dirty ? setLeaving(true) : stopEditing())}>Cancel</Button>
            </div>
          </div>
        ) : null}
        <KeyValueList
          items={[
            ...(editing ? [] : [{ label: 'Name', value: me ? `${me.firstName} ${me.lastName}` : '—' }]),
            // The sign-in email can't be changed here (story 12.1).
            { label: 'Email', value: <CopyText value={email} label="email" /> },
            { label: 'Role', value: role === 'super' ? 'Super admin' : 'Admin' },
            { label: 'Last sign-in', value: formatDate(lastSignInAt) },
            { label: 'Two-step verification', value: 'On (always on for the admin panel)' },
          ]}
        />
        <p className={s.note}>{role === 'super' ? 'To change your email address, contact Tkxel.' : 'To change your email address, ask a super admin.'}</p>
        {/* Password and notifications have their own tabs; sign out sits on its own at the bottom right. */}
        <div className={s.signOutRow}>
          <Button size="sm" variant="destructiveOutline" onClick={() => nav.setConfirmingSignOut(true)}>Sign out</Button>
        </div>
      </div>
      {leaving && <UnsavedChangesDialog onLeave={() => { setLeaving(false); stopEditing(); }} onStay={() => setLeaving(false)} />}
    </Section>
  );
}
