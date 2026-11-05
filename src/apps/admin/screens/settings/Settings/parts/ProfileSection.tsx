/** Your name (editable), email and role (read only; plain admins see who to ask, super admins see no note). */
import { useState } from 'react';
import { useAdminSettings, useAdminStore } from '@shared/admin';
import { Button, Input, KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import { CopyText } from '@admin/screens/common/CopyEmail';
import s from './settings.module.css';

export function ProfileSection() {
  const email = useAdminStore((st) => st.email);
  const role = useAdminStore((st) => st.role);
  const me = useAdminStore((st) => st.admins.find((a) => a.email === st.email));
  const [first, setFirst] = useState(me?.firstName ?? '');
  const [last, setLast] = useState(me?.lastName ?? '');
  const sim = useSim();
  const empty = !first.trim() || !last.trim();
  const dirty = (first.trim() !== (me?.firstName ?? '') || last.trim() !== (me?.lastName ?? '')) && !empty;

  return (
    <Section title="Profile" surface>
      <div className={s.group}>
        <div className={s.form}>
          <Input label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
          <Input label="Last name" value={last} error={empty ? 'Please enter your first and last name.' : undefined} onChange={(e) => setLast(e.target.value)} />
          {dirty && (
            <div className={s.actions}>
              <Button size="sm" loading={sim.busy} onClick={() => sim.run(() => useAdminSettings.getState().setName(first.trim(), last.trim()), 'Your profile has been updated.')}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setFirst(me?.firstName ?? ''); setLast(me?.lastName ?? ''); }}>Cancel</Button>
            </div>
          )}
        </div>
        <KeyValueList
          items={[
            { label: 'Email', value: <CopyText value={email} label="email" /> },
            { label: 'Role', value: role === 'super' ? 'Super admin' : 'Admin' },
          ]}
        />
        {role !== 'super' && <p className={s.note}>To change your email or role, ask a super admin.</p>}
      </div>
    </Section>
  );
}
