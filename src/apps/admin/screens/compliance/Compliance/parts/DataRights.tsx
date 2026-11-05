/** The two client rights the console acts on: withdrawing consent and deleting their data (with dependent
 *  transfer rules). Each card links to the page where the team handles them. */
import { businessDaysLeft, useAdminStore } from '@shared/admin';
import { Button } from '@admin/ui';
import { useAdminNav } from '@admin/navigation';
import styles from './DataRights.module.css';

export function DataRights() {
  const revocations = useAdminStore((s) => s.consentRevocations.length);
  const requests = useAdminStore((s) => s.deletionRequests);
  const go = useAdminNav((s) => s.go);
  const pending = requests.filter((r) => r.status !== 'completed');
  const soonest = pending.length ? Math.min(...pending.map((r) => businessDaysLeft(r.received))) : null;

  return (
    <div className={styles.grid}>
      <article className={styles.card}>
        <h3 className={styles.title}>Right to withdraw consent</h3>
        <p className={styles.text}>Clients can withdraw consent at any time. Sharing stops straight away and the change is recorded against the consent version they agreed to.</p>
        <p className={styles.stat}>{revocations} {revocations === 1 ? 'client has' : 'clients have'} withdrawn consent</p>
        <Button size="sm" variant="secondary" onClick={() => go('compliance')}>View consent</Button>
      </article>
      <article className={styles.card}>
        <h3 className={styles.title}>Right to delete</h3>
        <p className={styles.text}>A client can ask to delete their account and personal data. An admin reviews and approves it, then eligible data is deleted within the legal deadline: GDPR 1 month, CPRA 45 days (extensions and exceptions may apply).</p>
        <ul className={styles.rules}>
          <li>Each dependent profile is either transferred or deleted, as the client chooses.</li>
          <li>A transfer emails the new owner an invite to create an account and accept the profile.</li>
          <li>The account isn't deleted until every transfer is accepted or otherwise resolved.</li>
        </ul>
        <p className={styles.stat}>
          {pending.length} pending {pending.length === 1 ? 'request' : 'requests'}
          {soonest !== null && `, next due in ${soonest} days`}
        </p>
        <Button size="sm" variant="secondary" onClick={() => go('support')}>View requests</Button>
      </article>
    </div>
  );
}
