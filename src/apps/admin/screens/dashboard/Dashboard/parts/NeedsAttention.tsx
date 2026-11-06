/** Needs Attention strip (story 2.1): what's open right now, whatever the date range. Each tile opens its screen.
 *  Escalations have no overdue count: they're recorded for review only (Session 9). */
import { businessDaysLeft, useAdminStore, useKnowledge } from '@shared/admin';
import { Icon, type IconName } from '@admin/ui';
import { ESCALATION_LEVEL, SUPPORT_TYPE } from '@admin/patterns';
import { useAdminNav, type SectionId } from '@admin/navigation';
import styles from './NeedsAttention.module.css';

interface Tile { id: string; label: string; icon: IconName; total: number; detail: string; section: SectionId }

export function NeedsAttention() {
  const st = useAdminStore();
  const pending = useKnowledge((s) => s.items.filter((c) => c.status === 'pending').length);
  const newGaps = useKnowledge((s) => s.gaps.filter((g) => g.status === 'new').length);
  const go = useAdminNav((s) => s.go);

  const esc = st.escalations.filter((e) => e.status === 'not_reviewed');
  const sup = st.supportRequests.filter((r) => !r.resolved);
  const del = st.deletionRequests.filter((r) => r.status !== 'completed');
  const close = del.filter((r) => r.status !== 'legal_hold' && businessDaysLeft(r.received) <= 2).length;

  const byLevel = (['emergency', 'crisis', 'urgent'] as const).map((l) => `${esc.filter((e) => e.type === l).length} ${ESCALATION_LEVEL[l].toLowerCase()}`).join(' · ');
  const byType = (Object.keys(SUPPORT_TYPE) as (keyof typeof SUPPORT_TYPE)[])
    .map((t) => [SUPPORT_TYPE[t], sup.filter((r) => r.type === t).length] as const)
    .filter(([, n]) => n > 0)
    .map(([l, n]) => `${n} ${l}`)
    .join(' · ');

  const tiles: Tile[] = [
    { id: 'esc', label: 'Escalations not yet reviewed', icon: 'alert', total: esc.length, detail: byLevel, section: 'escalations' },
    { id: 'sup', label: 'Open support requests', icon: 'support', total: sup.length, detail: byType || 'None open', section: 'support' },
    { id: 'del', label: 'Pending deletion requests', icon: 'delete', total: del.length, detail: `${close} close to the deadline`, section: 'deletion' },
    ...(st.role === 'super' ? [{ id: 'kb', label: 'Content to review', icon: 'book' as IconName, total: pending + newGaps, detail: `${pending} waiting for approval · ${newGaps} new knowledge gaps`, section: 'knowledge' as SectionId }] : []),
  ];

  if (tiles.every((t) => t.total === 0)) return <p className={styles.clear}>You&rsquo;re all caught up.</p>;

  return (
    // Same cell layout as the KPI band underneath, so the two rows read as one block of eight.
    <section className={styles.strip} aria-label="Needs attention">
      {tiles.map((t) => (
        <button key={t.id} type="button" className={styles.tile} onClick={() => go(t.section)}>
          <span className={styles.head}>
            {t.label}
            <Icon name="chevron" size={18} className={styles.arrow} />
          </span>
          <span className={styles.total}>{t.total}</span>
        </button>
      ))}
    </section>
  );
}
