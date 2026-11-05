/** A-7.2 plan list (story 8.1): name, type, price, family limits, status and Clients on the plan. Row opens the editor.
 *  Plans are never deleted, only made inactive. */
import { money, useAdminStore, type Plan } from '@shared/admin';
import { DataTable, StatusText, type Column } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';

const KIND: Record<Plan['kind'], string> = { trial: 'Free trial', individual: 'Individual', family: 'Family' };
const STATUS: Record<Plan['status'], [string, 'success' | 'neutral' | 'accent']> = {
  active: ['Active', 'success'],
  draft: ['Draft', 'accent'],
  inactive: ['Inactive', 'neutral'],
};

export function PlansTable({ subscribers }: { subscribers: (planId: string) => number }) {
  const plans = useAdminStore((s) => s.plans);
  const openDrawer = useAdminNav((s) => s.openDrawer);

  const columns: Column<Plan>[] = [
    { key: 'name', header: 'Plan', grow: true, primary: true, render: (p) => p.name },
    { key: 'kind', muted: true, header: 'Type', render: (p) => KIND[p.kind] },
    { key: 'price', header: 'Price', render: (p) => (p.kind === 'trial' ? `${p.trialDays} days` : `${money(p.monthly)} / month`) },
    {
      key: 'family',
      muted: true,
      header: 'Family',
      render: (p) => (p.kind === 'family' ? `${p.familyIncluded} members · ${money(p.addOnPrice ?? 0)} per add-on` : '—'),
    },
    { key: 'status', header: 'Status', render: (p) => <StatusText tone={STATUS[p.status][1]}>{STATUS[p.status][0]}</StatusText> },
    { key: 'subs', header: 'Clients', align: 'end', render: (p) => subscribers(p.id).toLocaleString('en-US') },
  ];

  return <DataTable paginate={false} label="Plans" columns={columns} rows={plans} rowKey={(p) => p.id} onRowClick={(p) => openDrawer({ kind: 'plan', id: p.id })} />;
}
