/** Client drawer › Overview (story 3.1): account, subscription (Super Admin only), consent, teen link and activity.
 *  No conversations, summaries, notes or health answers appear here. */
import { CLIENT_STATUS_LABEL, TEEN_STATUS_LABEL, clientStatus, formatDate, planLabel, teensOf, useAdminStore, type Client } from '@shared/admin';
import { KeyValueList } from '@admin/ui';
import { Section, SubscriptionStatusText } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import s from '@admin/screens/common/drawer/drawer.module.css';
import o from './Overview.module.css';

export function Overview({ client }: { client: Client }) {
  const st = useAdminStore();
  const openClient = useAdminNav((n) => n.openClient);
  const openDrawer = useAdminNav((n) => n.openDrawer);
  const plan = st.plans.find((p) => p.id === client.planId);
  const parent = st.clients.find((c) => c.id === client.parentId);
  const teens = teensOf(client.id, st.clients);
  const openSupport = st.supportRequests.filter((r) => r.clientId === client.id && !r.resolved).length;
  const openDeletion = st.deletionRequests.filter((r) => r.clientId === client.id && r.status !== 'completed').length;
  const openEsc = st.escalations.filter((e) => e.clientId === client.id && e.status === 'not_reviewed').length;
  const pendingDeletion = st.deletionRequests.find((r) => r.clientId === client.id && r.status !== 'completed');
  const link = (c: Client) => <button type="button" className={s.link} onClick={() => openClient(c.id)}>{c.name} · {c.email}</button>;

  return (
    <>
      <Section title="Account">
        <KeyValueList split="half"
          items={[
            { label: 'First name', value: client.name },
            { label: 'State', value: client.state },
            { label: 'Account type', value: client.accountType === 'teen' ? 'Teen (own account)' : 'Adult' },
            {
              label: 'Status',
              // "Deletion requested" links straight to the request (story 3.1).
              value: pendingDeletion ? (
                <button type="button" className={s.link} onClick={() => openDrawer({ kind: 'deletion', id: pendingDeletion.id })}>
                  {CLIENT_STATUS_LABEL[clientStatus(client, st.deletionRequests)]}
                </button>
              ) : (
                CLIENT_STATUS_LABEL[clientStatus(client, st.deletionRequests)]
              ),
            },
            { label: 'Signed up', value: formatDate(client.joined) },
          ]}
        />
      </Section>
      {client.accountType === 'teen' && (
        <Section title="Teen account">
          <KeyValueList split="half"
            items={[
              { label: 'Linked parent', value: parent ? link(parent) : '—' },
              { label: 'Access', value: client.teenStatus === 'joined' || !client.teenStatus ? 'Active' : TEEN_STATUS_LABEL[client.teenStatus] },
            ]}
          />
        </Section>
      )}
      {/* Subscription details are Super Admin only (story 3.1, Session 5). Teens have no plan of their own. */}
      {st.role === 'super' && client.accountType === 'adult' && (
        <Section title="Subscription">
          <KeyValueList split="half"
            items={[
              { label: 'Plan', value: planLabel(plan) },
              { label: 'Status', value: <SubscriptionStatusText status={client.subscription} /> },
              { label: 'Next billing', value: client.nextBilling ? formatDate(client.nextBilling) : '—' },
              ...(plan?.kind === 'family' ? [{ label: 'Add-on members', value: String(Math.max(0, client.dependents.length + teens.length - (plan.familyIncluded ?? 3))) }] : []),
            ]}
          />
        </Section>
      )}
      {client.accountType === 'adult' && (
        <Section title="Consent">
          {client.consentRevoked ? (
            <p className={s.note}>Consent revoked</p>
          ) : (
            <KeyValueList split="half"
              items={client.consents.map((c) => ({
                label: c.policy,
                // Three columns: policy · version · date accepted.
                value: (
                  <span className={o.pair}>
                    <span>Version {c.version}</span>
                    <span className={o.muted}>Accepted {formatDate(c.acceptedAt)}</span>
                  </span>
                ),
              }))}
            />
          )}
        </Section>
      )}
      {teens.length > 0 && (
        <Section title="Invited teens">
          <KeyValueList split="half" items={teens.map((t) => ({ label: t.name, value: TEEN_STATUS_LABEL[t.teenStatus ?? 'joined'] }))} />
        </Section>
      )}
      <Section title="Activity">
        <KeyValueList split="half"
          items={[
            { label: 'Last active', value: formatDate(client.lastActive) },
            { label: 'Conversations', value: client.conversations },
            { label: 'Open requests', value: `${openSupport} support · ${openDeletion} deletion · ${openEsc} escalation` },
          ]}
        />
      </Section>
    </>
  );
}
