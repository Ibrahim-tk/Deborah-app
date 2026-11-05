/**
 * @screen  A-13.1 · Knowledge Base
 * @flow    A13 Knowledge Base management (stories 6.1 and 6.3)
 * @states  content tab · knowledge gaps tab (new count) · content sources tab · filtered · no results · result banner · file dragged over the page · admin (edits go for approval)
 * @spec    docs/admin/stories.md#61---view--edit-knowledge-base-content
 * @xref    web: none (admin only)
 */
import { useState, type DragEvent } from 'react';
import { useKnowledge } from '@shared/admin';
import { Button, Icon, Tabs } from '@admin/ui';
import { AdminPage, ResultBanner } from '@admin/patterns';
import { openEditor } from '../ContentEditor/open';
import ContentEditor from '../ContentEditor';
import { ContentTable } from './parts/ContentTable';
import { GapsTable } from './parts/GapsTable';
import { SourcesPanel } from './parts/SourcesPanel';
import styles from './KnowledgeBase.module.css';

type Tab = 'content' | 'gaps' | 'sources';

export default function KnowledgeBase() {
  const total = useKnowledge((s) => s.items.length);
  const gapTotal = useKnowledge((s) => s.gaps.length);
  const newGaps = useKnowledge((s) => s.gaps.filter((g) => g.status === 'new').length);
  const notice = useKnowledge((s) => s.notice);
  const editor = useKnowledge((s) => s.editor);
  const [tab, setTab] = useState<Tab>('content');
  const [dragging, setDragging] = useState(false);

  const upload = () => openEditor('new');
  // Dropping a file anywhere on the page opens the upload form with it attached.
  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files');
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    useKnowledge.getState().setDroppedFile({ name: f.name, size: f.size });
    upload();
  };

  return (
    <div
      className={styles.page}
      onDragOver={(e) => { if (hasFiles(e)) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={drop}
    >
      <AdminPage
        title="Knowledge Base"
        subtitle={`${total} content items and ${gapTotal} knowledge gaps in total. The Oracle only answers from content that’s live.`}
        action={<Button leadingIcon="upload" onClick={upload}>Upload content</Button>}
      >
        <ResultBanner message={notice} onDismiss={() => useKnowledge.getState().setNotice('')} />
        <Tabs<Tab>
          label="Knowledge Base"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'content', label: 'Content', content: <ContentTable /> },
            { value: 'gaps', label: newGaps ? `Knowledge gaps (${newGaps} new)` : 'Knowledge gaps', content: <GapsTable /> },
            { value: 'sources', label: 'Content sources', content: <SourcesPanel onAdd={upload} /> },
          ]}
        />
      </AdminPage>
      {editor && <ContentEditor key={editor} param={editor} />}
      {dragging && (
        <div className={styles.dropOverlay} aria-hidden>
          <Icon name="upload" size={32} />
          <p>Drop the file to upload it</p>
        </div>
      )}
    </div>
  );
}
