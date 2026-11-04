/** What you've agreed to as an admin, and where to read the rules. */
import { complianceFrameworks, formatDate, useAdminStore } from '@shared/admin';
import { Button, Icon, KeyValueList, StatusText } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import s from './settings.module.css';

export function ComplianceSection() {
  const role = useAdminStore((st) => st.role);
  const me = useAdminStore((st) => st.admins.find((a) => a.email === st.email));
  const go = useAdminNav((st) => st.go);
  const push = useAdminNav((st) => st.push);

  return (
    <Section title="Compliance" surface>
      <div className={s.group}>
        <KeyValueList
          items={[
            { label: 'Privacy and security training', value: <StatusText tone="success">Completed</StatusText> },
            { label: 'Confidentiality agreement', value: `Signed ${formatDate((me?.invitedAt ?? '2026-05-01').slice(0, 10))}` },
            { label: 'Activity', value: 'Everything you do here is recorded in the audit log' },
          ]}
        />
        <div className={s.row}>
          <Button size="sm" variant="ghost" onClick={() => go('audit')}>View audit log</Button>
        </div>
        {role === 'super' && (
          <button type="button" className={s.frameworks} onClick={() => push({ id: 'regulations' })}>
            <span className={s.itemMain}>
              <span className={s.itemTitle}>Frameworks and data rights</span>
              <span className={s.itemMeta}>{complianceFrameworks.map((f) => f.name).join(', ')}</span>
            </span>
            <span className={s.marks} aria-hidden>
              {complianceFrameworks.map((f) => (
                <span key={f.id} className={s.mark}>{f.flag ?? <Icon name="shield" size={16} />}</span>
              ))}
            </span>
            <Icon name="chevron" size={18} className={s.chev} />
          </button>
        )}
      </div>
    </Section>
  );
}
