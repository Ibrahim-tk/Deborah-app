/** Content Sources (story 6.1/6.2): where the Oracle's content lives. Everything is uploaded into the app's own
 *  library in Azure; Dropbox isn't used. Counts by kind and by status help spot what's missing. */
import { CONTENT_STATUS, CONTENT_TYPES, useKnowledge } from '@shared/admin';
import { Button, KeyValueList } from '@admin/ui';
import { Section } from '@admin/patterns';
import styles from './tables.module.css';

export function SourcesPanel({ onAdd }: { onAdd: () => void }) {
  const items = useKnowledge((s) => s.items);
  const live = items.filter((c) => c.status === 'published').length;
  const byType = CONTENT_TYPES.map((t) => ({ label: t, value: items.filter((c) => c.type === t).length })).filter((r) => r.value > 0);

  return (
    <div className={styles.stack}>
      <Section title="App library" surface trailing={<Button size="sm" leadingIcon="plus" onClick={onAdd}>Add content</Button>}>
        <KeyValueList
          items={[
            { label: 'Source', value: 'Uploaded' },
            { label: 'Stored in', value: 'The app’s own library (Azure)' },
            { label: 'Items', value: `${items.length} in total · ${live} ${CONTENT_STATUS.published.toLowerCase()}` },
          ]}
        />
      </Section>
      <Section title="By kind of content" surface>
        <KeyValueList items={byType.map((r) => ({ label: r.label, value: r.value }))} />
      </Section>
    </div>
  );
}
