/** @pattern UnsavedChangesDialog — asked before closing a form with edits (stories 6.2, 8.2, 9.2, 12.1). */
import { ConfirmDialog } from '../ConfirmDialog';

export function UnsavedChangesDialog({ onLeave, onStay }: { onLeave: () => void; onStay: () => void }) {
  return (
    <ConfirmDialog
      title="You have unsaved changes"
      body="Leave without saving? Your changes will be lost."
      confirm="Leave without saving"
      destructive
      onConfirm={onLeave}
      onClose={onStay}
    />
  );
}
