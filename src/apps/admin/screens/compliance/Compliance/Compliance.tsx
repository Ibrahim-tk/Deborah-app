/**
 * @screen  A-9.3 · Compliance
 * @flow    A9 Compliance & consent management (super admin only)
 * @states  default (frameworks applied · in progress)
 * @spec    docs/admin/README.md#a-93-compliance
 * @xref    web: none (admin only)
 */
import { complianceFrameworks } from '@shared/admin';
import { AdminPage, Section } from '@admin/patterns';
import { DataRights } from './parts/DataRights';
import { FrameworkCard } from './parts/FrameworkCard';
import styles from './Compliance.module.css';

export default function Compliance() {
  return (
    <AdminPage title="Compliance" subtitle="The privacy and security rules the service follows, and how client data rights are handled.">
      <Section title="Client data rights">
        <DataRights />
      </Section>
      <Section title="Frameworks">
        <div className={styles.grid}>
          {complianceFrameworks.map((f) => (
            <FrameworkCard key={f.id} framework={f} />
          ))}
        </div>
      </Section>
    </AdminPage>
  );
}
