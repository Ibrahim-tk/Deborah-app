/** F11: a user bubble that shared a document — live title, or "Document removed" once deleted. */
import { documentConfig } from '@shared/data';
import { selectDocument, useAppStore } from '@shared/store';
import { AttachedDocument } from '@web/patterns/chat';
import { DOCUMENT_ICON } from '@web/patterns/health';
import { useNav } from '@web/navigation';

export function DocumentMessage({ documentId }: { documentId: string }) {
  const { push } = useNav();
  const doc = useAppStore((s) => selectDocument(s, documentId));
  if (!doc) return <AttachedDocument />;
  const type = documentConfig.types.find((t) => t.id === doc.type)?.label;
  const format = documentConfig.formats.find((f) => f.format === doc.format)?.label;
  return (
    <AttachedDocument
      title={doc.title}
      meta={[type, format].filter(Boolean).join(' · ')}
      icon={DOCUMENT_ICON[doc.type]}
      onOpen={() => push('M-11.2', { documentId })}
    />
  );
}
