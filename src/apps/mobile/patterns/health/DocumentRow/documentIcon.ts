/** Icon per document type — shared by DocumentRow, the document preview and the chat attachment. */
import type { DocumentType } from '@shared/types/domain';
import type { IconName } from '@mobile/ui';

export const DOCUMENT_ICON: Record<DocumentType, IconName> = {
  lab: 'labs',
  imaging: 'image',
  prescription: 'medicine',
  'visit-note': 'note',
  other: 'file',
};
