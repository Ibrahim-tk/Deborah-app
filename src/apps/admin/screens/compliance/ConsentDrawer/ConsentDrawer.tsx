/**
 * @screen  A-9.2 · Policy (side drawer)
 * @flow    A9 Consent management (stories 9.1 and 9.2)
 * @states  live · version history (read only) · draft · new version form · preview · publish confirm
 * @spec    docs/admin/stories.md#91---view--edit-policy-versions
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { formatDate, liveVersion, usePolicies, type PolicyVersion } from '@shared/admin';
import { Button, Drawer, KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { VersionForm } from './parts/VersionForm';
import s from '@admin/screens/common/drawer/drawer.module.css';
import styles from './ConsentDrawer.module.css';

/** Published versions are read only; a change is always a new version (story 9.1). */
export default function ConsentDrawer({ id }: { id: string | null }) {
  const policy = usePolicies((st) => st.policies.find((p) => p.id === id));
  const close = useAdminNav((st) => st.closeDrawer);
  const [editing, setEditing] = useState(false);
  const [reading, setReading] = useState<PolicyVersion | null>(null);
  if (!policy) return null;
  const live = liveVersion(policy);

  if (editing) return <VersionForm policy={policy} onDone={() => setEditing(false)} />;

  return (
    <Drawer
      title={policy.name}
      subtitle={`Version ${live.version} · live since ${formatDate(live.publishedAt)}`}
      onClose={close}
      actions={<Button size="sm" leadingIcon="plus" onClick={() => setEditing(true)}>{policy.draft ? 'Edit draft' : 'New version'}</Button>}
    >
      <Section title="Acceptance">
        <KeyValueList
          items={[
            { label: 'Accepted', value: `${policy.accepted.toLocaleString('en-US')} Clients` },
            { label: 'Not yet', value: `${policy.notYet.toLocaleString('en-US')} Clients` },
          ]}
        />
        <p className={s.note}>Clients who haven&rsquo;t accepted yet are asked when they next open the app.</p>
      </Section>
      {policy.draft && (
        <Section title="Draft of the next version">
          <p className={s.note}>{policy.draft.summary || 'No summary yet.'}</p>
        </Section>
      )}
      <Section title={reading ? `Version ${reading.version} (read only)` : `Live text · version ${live.version}`}>
        <p className={styles.text}>{(reading ?? live).text}</p>
        {reading && <Button size="sm" variant="ghost" onClick={() => setReading(null)}>Back to the live version</Button>}
      </Section>
      <Section title="Version history">
        <ul className={styles.history}>
          {[...policy.versions].reverse().map((v) => (
            <li key={v.version}>
              <button type="button" className={styles.version} onClick={() => setReading(v)}>
                <span className={styles.name}>Version {v.version}{v === live ? ' · live' : ''}</span>
                <span className={styles.meta}>{formatDate(v.publishedAt)} · {v.publishedBy} · {v.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </Drawer>
  );
}
