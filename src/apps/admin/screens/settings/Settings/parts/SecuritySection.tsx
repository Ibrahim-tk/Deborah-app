/** Two-step verification (required for every admin, so it can't be turned off) and signed-in sessions. */
import { useAdminSettings, useAdminStore } from '@shared/admin';
import { Button, IconButton, KeyValueList, Menu, StatusText } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import { Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import s from './settings.module.css';

export function SecuritySection() {
  const email = useAdminStore((st) => st.email);
  const sessions = useAdminSettings((st) => st.sessions);
  const sim = useSim();
  const toast = useAdminToast();
  // This device goes through the normal sign-out confirm; another device is signed out straight away.
  const signOut = (id: string, current: boolean, device: string) => {
    if (current) return useAdminNav.getState().setConfirmingSignOut(true);
    useAdminSettings.getState().signOutSession(id);
    toast(`Signed out of ${device}`);
  };
  const others = sessions.filter((x) => !x.current).length;

  return (
    <Section title="Sign-in security" surface>
      <div className={s.group}>
        <div className={s.group}>
          <h3 className={s.groupTitle}>Two-step verification</h3>
          <KeyValueList
            items={[
              { label: 'Status', value: <StatusText tone="success">On</StatusText> },
              { label: 'Codes sent to', value: email },
            ]}
          />
        </div>
        <div className={s.group}>
          <h3 className={s.groupTitle}>Where you're signed in</h3>
          <ul className={s.list}>
            {sessions.map((x) => (
              <li key={x.id} className={s.item}>
                <span className={s.itemMain}>
                  <span className={s.itemTitle}>{x.device}</span>
                  <span className={s.itemMeta}>{x.location}, {x.lastActive.toLowerCase()}</span>
                </span>
                <span className={s.itemEnd}>
                  {x.current && <StatusText tone="accent">This device</StatusText>}
                  <Menu
                    side="bottom"
                    align="end"
                    onSelect={() => signOut(x.id, x.current, x.device)}
                    items={[{ id: 'signOut', label: 'Sign out of this device', destructive: true }]}
                    trigger={<IconButton icon="more" size="sm" label={`Actions for ${x.device}`} />}
                  />
                </span>
              </li>
            ))}
          </ul>
          <div className={s.row}>
            <Button size="sm" variant="secondary" disabled={others === 0} loading={sim.busy}
              onClick={() => sim.run(() => useAdminSettings.getState().signOutOthers(), 'Signed out of other sessions')}>
              Sign out of other sessions
            </Button>
            {others === 0 && <span className={s.note}>You're only signed in here.</span>}
          </div>
        </div>
      </div>
    </Section>
  );
}
