/**
 * @screen  M-11.2 · Document preview
 * @flow    F11 Documents and reports
 * @states  pdf / image / txt file surface · with or without description · extracted details · delete confirm
 *          · other profile (no Discuss) · missing or deleted ("no longer available")
 * @figma   — (NOT IN WIREFRAMES; Miro "Documents and Reports" 2026-10-19)
 * @spec    docs/ux/F11-documents.md#m-112--document-preview
 * @xref    web: W-11.2 (apps/web/screens/documents/DocumentPreview) — not built
 *
 * Prototype: the file itself was never read, so the surface shows its kind, not its pages.
 */
import { useState } from 'react';
import { documentConfig } from '@shared/data';
import { selectDocument, useAppStore } from '@shared/store';
import type { HealthDocument } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { ActionSheet, Button, Header, IconButton } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { useDeleteDocument } from '../useDeleteDocument';
import { FileSurface } from './parts/FileSurface';
import { DetailRows } from './parts/DetailRows';
import styles from './DocumentPreview.module.css';

export default function DocumentPreview() {
  const { documentId } = useScreenParams<{ documentId: string }>();
  const { pop, openAsk } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const toast = useToast();
  const live = useAppStore((s) => (documentId ? selectDocument(s, documentId) : undefined));
  // After Delete the screen pops first; a snapshot keeps its content so the exit doesn't flash "no longer available".
  const [leaving, setLeaving] = useState<HealthDocument>();
  const doc = live ?? leaving;
  const isActiveProfile = useAppStore((s) => s.activeProfileId === doc?.profileId);
  const back = canGoBack ? pop : undefined;
  const [menu, setMenu] = useState(false);
  const remove = useDeleteDocument();

  if (!doc) {
    return (
      <div className={styles.root} data-xref="M-11.2 · Document preview">
        <Header title="Document" onBack={back} backLabel={previousTitle} />
        <div className={styles.body}>
          <EmptyState icon="file" text="This document is no longer available." actionLabel="Back to documents" onAction={pop} />
        </div>
      </div>
    );
  }

  const typeLabel = documentConfig.types.find((t) => t.id === doc.type)?.label ?? 'Document';
  const formatLabel = documentConfig.formats.find((f) => f.format === doc.format)?.label ?? doc.format.toUpperCase();
  const rows: [string, string][] = [
    ['Date on document', doc.documentDate ? formatShortDate(doc.documentDate) : 'Not given'],
    ['Type', typeLabel],
    ['Uploaded', formatShortDate(doc.uploadedAt)],
    ['File', `${formatLabel} · ${sizeLabel(doc.sizeBytes)}`],
  ];

  return (
    <div className={styles.root} data-xref="M-11.2 · Document preview">
      <Header
        title="Document"
        onBack={back}
        backLabel={previousTitle}
        right={<IconButton icon="more" label="More options" onClick={() => setMenu(true)} />}
      />
      <div className={styles.body}>
        <FileSurface type={doc.type} format={doc.format} source={doc.source} fileName={doc.fileName} />
        <h1 className={styles.title}>{doc.title}</h1>
        {doc.description && <p className={styles.description}>{doc.description}</p>}
        <DetailRows label="About this document" rows={rows} />
        {doc.extraction && doc.extraction.fields.length > 0 && (
          <DetailRows
            label="What Deborah can see"
            rows={doc.extraction.fields.map((f) => [f.label, f.value])}
            footnote={doc.extraction.status !== 'approved' ? 'Example details for the prototype.' : undefined}
          />
        )}
      </div>
      <div className={styles.footer}>
        {/* ASSUMPTION: like M-9.5, another profile's document can't be discussed in the active chat. */}
        {isActiveProfile && (
          <Button fullWidth leadingIcon="deborah" onClick={() => openAsk({ documentId: doc.id })}>Discuss with Deborah</Button>
        )}
        {/* Prototype: no real file is written. */}
        <Button fullWidth variant="secondary" leadingIcon="download" onClick={() => toast('Downloaded')}>Download</Button>
      </div>
      <ActionSheet
        open={menu}
        actions={[{ label: 'Delete document', destructive: true, onSelect: () => { setMenu(false); remove(doc, () => { setLeaving(doc); pop(); }); } }]}
        onClose={() => setMenu(false)}
      />
    </div>
  );
}

function sizeLabel(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
