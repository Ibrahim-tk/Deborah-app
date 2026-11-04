/** Two-step verification (required for every admin, so it can't be turned off) and signed-in sessions. */
import { useAdminSettings, useAdminStore } from '@shared/admin';
import { Button, KeyValueList, StatusText } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import s from './settings.module.css';

export function SecuritySection() {
  const email = useAdminStore((st) => st.email);
  const sessions = useAdminSettings((st) => st.sessions);
  const sim = useSim();
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
          <p className={s.note}>Required for every admin account, so it can't be turned off.</p>
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
                {x.current && <StatusText tone="success">This device</StatusText>}
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
