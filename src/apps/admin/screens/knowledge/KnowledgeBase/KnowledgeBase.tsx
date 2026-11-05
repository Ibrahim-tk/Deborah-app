/**
 * @screen  A-13.1 · Knowledge Base
 * @flow    A13 Knowledge Base management (stories 6.1 and 6.3)
 * @states  content tab · knowledge gaps tab (new count) · filtered · no results · admin (edits go for approval)
 * @spec    docs/admin/stories.md#61---view--edit-knowledge-base-content
 * @xref    web: none (admin only)
 */
import { useState } from 'react';
import { useKnowledge } from '@shared/admin';
import { Button, Tabs } from '@admin/ui';
import { AdminPage } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { ContentTable } from './parts/ContentTable';
import { GapsTable } from './parts/GapsTable';

type Tab = 'content' | 'gaps';

export default function KnowledgeBase() {
  const newGaps = useKnowledge((s) => s.gaps.filter((g) => g.status === 'new').length);
  const openDrawer = useAdminNav((s) => s.openDrawer);
  const [tab, setTab] = useState<Tab>('content');

  return (
    <AdminPage
      title="Knowledge Base"
      subtitle="Deborah's content the Oracle answers from. The Oracle only uses Published content."
      action={<Button leadingIcon="plus" onClick={() => openDrawer({ kind: 'content', id: null })}>Add content</Button>}
    >
      <Tabs<Tab>
        label="Knowledge Base"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'content', label: 'Content', content: <ContentTable /> },
          { value: 'gaps', label: newGaps ? `Knowledge gaps (${newGaps} new)` : 'Knowledge gaps', content: <GapsTable /> },
        ]}
      />
    </AdminPage>
  );
}
