/**
 * @screen  A-9.2 · Consent version (side drawer)
 * @flow    A9 Compliance & consent management
 * @states  current · previous
 * @spec    docs/admin/README.md#a-92-consent-version
 * @xref    web: none (admin only)
 */
import { formatDate, useAdminStore } from '@shared/admin';
import { Button, Drawer, KeyValueList, StatusText } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useAdminToast } from '@admin/hooks/toast.store';
import { CopyEmail } from '@admin/screens/common/CopyEmail';
import s from '@admin/screens/common/drawer/drawer.module.css';

export default function ConsentDrawer({ id }: { id: string | null }) {
  const versions = useAdminStore((st) => st.consentVersions);
  const close = useAdminNav((st) => st.closeDrawer);
  const toast = useAdminToast();
  const v = versions.find((x) => x.id === id);
  if (!v) return null;
  const current = [...versions].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0]?.id === v.id;

  return (
    <Drawer
      title={v.name}
      subtitle={`Uploaded ${formatDate(v.uploadedAt)}`}
      onClose={close}
      meta={current ? <StatusText tone="success">Current</StatusText> : <StatusText>Previous</StatusText>}
      actions={<Button size="sm" variant="secondary" leadingIcon="download" onClick={() => toast('Download started')}>Download PDF</Button>}
    >
      <Section title="Version">
        <KeyValueList
          items={[
            { label: 'Version name', value: v.name },
            { label: 'Uploaded at', value: formatDate(v.uploadedAt) },
            { label: 'Uploaded by', value: <CopyEmail email={v.uploadedBy} /> },
            { label: 'Status', value: current ? 'Clients agree to this version' : 'Replaced by a newer version' },
          ]}
        />
        {current && <p className={s.note}>Uploading a new version asks every client to agree again the next time they open the app.</p>}
      </Section>
    </Drawer>
  );
}
