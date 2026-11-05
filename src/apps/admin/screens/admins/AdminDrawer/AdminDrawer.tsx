/**
 * @screen  A-6.2 · Admin user (side drawer)
 * @flow    A6 Admin management (super admin only; story 7.1)
 * @states  open invite link → email → set password → that admin's dashboard · invite pending · invite expired · active · deactivated · editing names · deactivate (reason) · self (read only)
 * @spec    docs/admin/stories.md#71---view--edit-admins
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminName, formatDate, inviteHoursLeft, useAdminStore } from '@shared/admin';
import { INTERNAL_EMAIL } from '@shared/utils/internalPaths';
import { Button, Dialog, Drawer, Input, KeyValueList, TextArea } from '@admin/ui';
import { AccountStatusText, InviteStatusText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import s from '@admin/screens/common/drawer/drawer.module.css';

/** Admins can do everything the Super Admin can, except these (story 7.2). */
const CANNOT = [
  'Add, edit or deactivate admins',
  'See or manage subscriptions, plans and free trial metrics',
  'Approve, publish or reject knowledge base content (their edits go for approval)',
];

export default function AdminDrawer({ id }: { id: string | null }) {
  const admin = useAdminStore((st) => st.admins.find((a) => a.id === id));
  const me = useAdminStore((st) => st.email);
  const close = useAdminNav((st) => st.closeDrawer);
  const sim = useSim();
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState(admin?.firstName ?? '');
  const [last, setLast] = useState(admin?.lastName ?? '');
  const [deactivating, setDeactivating] = useState(false);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);
  if (!admin) return null;

  const store = useAdminStore.getState();
  const hours = inviteHoursLeft(admin.invitedAt);
  const invite = admin.invite === 'pending' && hours <= 0 ? 'expired' : admin.invite;
  const self = admin.email === me;
  const active = admin.account === 'active';
  const saveNames = () => {
    if (!first.trim() || !last.trim()) return setTouched(true);
    sim.run(() => { store.editAdmin(admin.id, first.trim(), last.trim()); setEditing(false); }, 'Your changes have been saved.');
  };
  const deactivate = () => {
    if (!reason.trim()) return setTouched(true);
    sim.run(() => { store.setAdminAccount(admin.id, false, reason.trim()); setDeactivating(false); }, `${admin.firstName} has been deactivated.`);
  };

  return (
    <Drawer
      title={adminName(admin)}
      subtitle={<CopyEmail email={admin.email} />}
      onClose={close}
      meta={<AccountStatusText status={admin.account} />}
      actions={
        !self && (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
            {invite !== 'accepted' && (
              <>
                <Button size="sm" leadingIcon="mail" loading={sim.busy} onClick={() => sim.run(() => store.resendInvite(admin.id), `We’ve sent ${admin.firstName} a new invite.`)}>Resend invite</Button>
                <Button size="sm" variant="ghost" onClick={() => sim.run(() => { store.cancelInvite(admin.id); close(); }, `The invite for ${admin.firstName} has been cancelled.`)}>Cancel invite</Button>
                {/* Prototype: the invite lives in the same inbox as the teen login email. */}
                <Button size="sm" variant="ghost" onClick={() => navigate(`${INTERNAL_EMAIL}?invite=${admin.id}`)}>Open invite link (prototype)</Button>
              </>
            )}
            {active ? (
              <Button size="sm" variant="ghost" className={s.danger} onClick={() => setDeactivating(true)}>Deactivate</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => sim.run(() => store.setAdminAccount(admin.id, true), `${admin.firstName} has been reactivated.`)}>Reactivate</Button>
            )}
          </>
        )
      }
    >
      <Section title="Details">
        {editing ? (
          <div className={s.form}>
            <Input label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
            <Input label="Last name" value={last} error={touched && (!first.trim() || !last.trim()) ? 'Please enter the admin’s first and last name.' : undefined} onChange={(e) => setLast(e.target.value)} />
            <p className={s.note}>The email address can&rsquo;t be edited because it&rsquo;s used to sign in. To change it, deactivate this admin and invite them again.</p>
            <div className={s.row}>
              <Button size="sm" loading={sim.busy} onClick={saveNames}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <KeyValueList
            items={[
              { label: 'Role', value: admin.role === 'super' ? 'Super Admin' : 'Admin' },
              { label: 'Invitation', value: <InviteStatusText status={invite} /> },
              { label: 'Date added', value: formatDate(admin.invitedAt.slice(0, 10)) },
              ...(admin.addedBy ? [{ label: 'Added by', value: admin.addedBy }] : []),
              { label: 'Last active', value: admin.lastActive ? formatDate(admin.lastActive.slice(0, 10)) : '—' },
              ...(invite === 'pending' ? [{ label: 'Invite expires', value: `In ${hours} hours` }] : []),
            ]}
          />
        )}
        {self && <p className={s.note}>This is your account.</p>}
        {invite === 'expired' && <p className={s.note}>Invites last 24 hours. Resend it to give them a new link.</p>}
      </Section>
      {admin.role === 'admin' && (
        <Section title="What admins can't do">
          <ul className={s.bullets}>{CANNOT.map((c) => <li key={c}>{c}</li>)}</ul>
        </Section>
      )}
      {deactivating && (
        <Dialog
          title={`Deactivate ${admin.firstName}?`}
          onClose={() => setDeactivating(false)}
          footer={<><Button variant="secondary" onClick={() => setDeactivating(false)}>Cancel</Button><Button variant="destructive" loading={sim.busy} onClick={deactivate}>Deactivate</Button></>}
        >
          <p>{`Deactivate ${admin.firstName}? They’ll be signed out and won’t be able to sign in until they’re reactivated.`}</p>
          <TextArea label="Reason" value={reason} hint={touched && !reason.trim() ? 'Please add a reason for deactivating this admin.' : undefined} onChange={(e) => setReason(e.target.value)} />
        </Dialog>
      )}
    </Drawer>
  );
}
