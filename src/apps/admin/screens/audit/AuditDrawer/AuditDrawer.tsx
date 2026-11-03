/**
 * @screen  A-8.2 · Audit entry (side drawer)
 * @flow    A8 Audit logging
 * @states  default
 * @spec    docs/admin/README.md#a-82-audit-entry
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import s from '@admin/screens/common/drawer/drawer.module.css';

export default function AuditDrawer({ id }: { id: string | null }) {
  const entry = useAdminStore((st) => st.auditLog.find((e) => e.id === id));
  const actor = useAdminStore((st) => st.admins.find((a) => a.email === entry?.actor));
  const close = useAdminNav((st) => st.closeDrawer);
  const toast = useAdminToast();
  if (!entry) return null;

  const clear = () => {
    useAdminStore.getState().clearLogEntry(entry.id);
    close();
    toast('Entry cleared');
  };

  return (
    <Drawer
      title={entry.text}
      subtitle={formatDate(entry.at)}
      onClose={close}
      actions={<Button size="sm" variant="ghost" className={`${s.end} ${s.danger}`} onClick={clear}>Clear entry</Button>}
    >
      <Section title="Details">
        <KeyValueList
          items={[
            { label: 'Action', value: entry.text },
            { label: 'When', value: formatDate(entry.at) },
            { label: 'By', value: actor ? actor.name : entry.actor },
            { label: 'Email', value: <CopyEmail email={entry.actor} /> },
            ...(actor ? [{ label: 'Role', value: actor.role === 'super' ? 'Super admin' : 'Admin' }] : []),
          ]}
        />
      </Section>
    </Drawer>
  );
}
