/** A-7.2 plan list: price, limits, subscribers and an active switch. Row opens the editor. */
import { money, useAdminStore, type Plan } from '@shared/admin';
import { DataTable, StatusText, Toggle, type Column } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import styles from './PlansTable.module.css';

export function PlansTable({ subscribers }: { subscribers: (planId: string) => number }) {
  const plans = useAdminStore((s) => s.plans);
  const push = useAdminNav((s) => s.push);
  const toast = useAdminToast();

  const setActive = (p: Plan, active: boolean) => {
    useAdminStore.getState().savePlan({ ...p, active });
    toast(active ? 'Plan activated' : 'Plan deactivated');
  };

  const columns: Column<Plan>[] = [
    { key: 'name', header: 'Plan', grow: true, primary: true, sort: (p) => p.name, render: (p) => p.name },
    { key: 'kind', header: 'Type', render: (p) => (p.kind === 'family' ? `Family, up to ${p.maxProfiles}` : 'Individual') },
    {
      key: 'price',
      header: 'Price',
      sort: (p) => p.monthly || p.yearly / 12,
      render: (p) => (p.monthly ? `${money(p.monthly)} / month` : p.yearly ? `${money(p.yearly)} / year` : 'Free'),
    },
    { key: 'trial', header: 'Free limit', render: (p) => (p.trialDays ? `${p.trialDays}-day trial` : `${p.freeQuestions} questions`) },
    { key: 'subs', header: 'Subscribers', align: 'end', sort: (p) => subscribers(p.id), render: (p) => (p.id === 'free' ? '—' : subscribers(p.id).toLocaleString('en-US')) },
    {
      key: 'active',
      header: 'Status',
      render: (p) => (
        // Stop the row click so the switch doesn't also open the editor.
        <span className={styles.toggle} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Toggle checked={p.active} onChange={(v) => setActive(p, v)} label={p.active ? 'Active' : 'Inactive'} />
          {!p.active && <StatusText tone="neutral">Hidden from the app</StatusText>}
        </span>
      ),
    },
  ];

  return <DataTable label="Plans" columns={columns} rows={plans} rowKey={(p) => p.id} onRowClick={(p) => push({ id: 'plan', planId: p.id })} />;
}
