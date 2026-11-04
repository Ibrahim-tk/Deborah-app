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
  const [name, setName] = useState(me?.name ?? '');
  const sim = useSim();
  const dirty = name.trim() !== (me?.name ?? '') && name.trim().length > 0;

  return (
    <Section title="Profile" surface>
      <div className={s.group}>
        <div className={s.form}>
          <Input label="Full name" value={name} error={!name.trim() ? 'Enter your name.' : undefined} onChange={(e) => setName(e.target.value)} />
          {dirty && (
            <div className={s.actions}>
              <Button size="sm" loading={sim.busy} onClick={() => sim.run(() => useAdminSettings.getState().setName(name.trim()), 'Name saved')}>Save name</Button>
              <Button size="sm" variant="ghost" onClick={() => setName(me?.name ?? '')}>Cancel</Button>
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
