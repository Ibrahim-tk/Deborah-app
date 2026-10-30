/**
 * F11 Delete (docs/ux/F11-documents.md › Delete): confirm with the "Oracle will no longer use
 * this document" warning, soft-delete, then "Document deleted". Shared by M-11.1 and M-11.2.
 */
import { useAppStore } from '@shared/store';
import type { HealthDocument } from '@shared/types/domain';
import { useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';

export function useDeleteDocument() {
  const alert = useAlert();
  const toast = useToast();
  /** Resolves true once deleted; `beforeDelete` runs first (e.g. leave the preview). */
  return async (doc: HealthDocument, beforeDelete?: () => void) => {
    const shared = (doc.sharedWith?.length ?? 0) > 0;
    const choice = await alert({
      title: 'Delete this document?',
      // OPEN: may users delete a document they've shared? Default yes, with this line.
      message: `The Oracle will no longer use this document in your conversations.${shared ? ' It stays with anyone you already shared it with.' : ''}`,
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive' }],
    });
    if (choice !== 1) return false;
    beforeDelete?.();
    useAppStore.getState().deleteDocument(doc.id);
    toast('Document deleted');
    return true;
  };
}
