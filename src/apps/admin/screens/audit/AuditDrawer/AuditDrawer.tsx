/**
 * @screen  A-8.2 · Audit entry (side drawer)
 * @flow    A8 Audit logging
 * @states  default (read only: entries can't be edited or deleted)
 * @spec    docs/admin/README.md#a-82-audit-entry
 * @xref    web: none (admin only)
 */
import { AUDIT_CATEGORY, AUDIT_ROLE, adminName, formatDate, useAdminStore } from '@shared/admin';
import { Drawer, KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { CopyEmail } from '@admin/screens/common/CopyEmail';

export default function AuditDrawer({ id }: { id: string | null }) {
  const entry = useAdminStore((st) => st.auditLog.find((e) => e.id === id));
  const actor = useAdminStore((st) => st.admins.find((a) => a.email === entry?.actor));
  const close = useAdminNav((st) => st.closeDrawer);
  if (!entry) return null;

  return (
    <Drawer
      title={entry.text}
      subtitle={formatDate(entry.at)}
      onClose={close}
    >
      <Section title="Details">
        <KeyValueList
          items={[
            { label: 'Action', value: entry.text },
            { label: 'When', value: formatDate(entry.at) },
            { label: 'Who', value: entry.role === 'system' ? 'System' : actor ? adminName(actor) : entry.actor },
            ...(entry.role !== 'system' ? [{ label: 'Email', value: <CopyEmail email={entry.actor} /> }] : []),
            { label: 'Role', value: AUDIT_ROLE[entry.role] },
            { label: 'Category', value: AUDIT_CATEGORY[entry.category] },
            ...(entry.target ? [{ label: 'Affected', value: entry.target }] : []),
            ...(entry.device ? [{ label: 'Device or IP', value: entry.device }] : []),
          ]}
        />
      </Section>
    </Drawer>
  );
}
