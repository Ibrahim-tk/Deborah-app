/** Escalation history for one client (A-3.2 drawer). Documents are no longer shown here. */
import styles from './ClientTables.module.css';
import { useMemo } from 'react';
import { formatDate, useAdminStore, type Client, type Escalation } from '@shared/admin';
import { DataTable, type Column } from '@admin/ui';
import { EscalationStatusText, EscalationTypeText, Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';

export function ClientTables({ client }: { client: Client }) {
  const openEscalation = useAdminNav((s) => s.openEscalation);
  // Select the stable store array, filter outside the selector: a selector that returns a fresh array
  // every time makes the store think it changed and re-render forever.
  const escalations = useAdminStore((s) => s.escalations);
  const history = useMemo(() => escalations.filter((e) => e.clientId === client.id), [escalations, client.id]);

  const escCols: Column<Escalation>[] = [
    { key: 'reason', header: 'Reason', grow: true, primary: true, render: (e) => e.reason },
    { key: 'type', header: 'Type', render: (e) => <EscalationTypeText type={e.type} /> },
    { key: 'status', header: 'Status', render: (e) => <EscalationStatusText status={e.status} /> },
    { key: 'opened', muted: true, header: 'Opened', sort: (e) => e.opened, render: (e) => formatDate(e.opened) },
  ];

  return (
    <div className={styles.root}>
      <Section title="Escalation history">
        <DataTable
          variant="plain"
          label="Escalation history"
          columns={escCols}
          rows={history}
          rowKey={(e) => e.id}
          initialSort={{ key: 'opened', dir: 'desc' }}
          onRowClick={(e) => openEscalation(e.id)}
          empty="No escalations for this client."
        />
      </Section>
    </div>
  );
}
