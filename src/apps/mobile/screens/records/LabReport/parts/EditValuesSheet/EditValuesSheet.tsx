/**
 * Edit lab values in a bottom sheet (same sheet as the app's other edit forms): one field per marker, the unit
 * in its label, Save writes the values back and marks changed ones as edited.
 */
import { useState } from 'react';
import type { LabReport } from '@shared/types/domain';
import { useAppStore } from '@shared/store';
import { BottomSheet, Button, Input } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import styles from './EditValuesSheet.module.css';

export interface EditValuesSheetProps {
  open: boolean;
  report: LabReport;
  onClose: () => void;
}

export function EditValuesSheet({ open, report, onClose }: EditValuesSheetProps) {
  const toast = useToast();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const valueOf = (id: string, fallback: string) => draft[id] ?? fallback;

  const save = () => {
    const values = report.values.map((v) => {
      const next = draft[v.id]?.trim();
      return next !== undefined && next !== '' && next !== v.value ? { ...v, value: next, edited: true } : v;
    });
    useAppStore.getState().replaceReport({ ...report, values });
    toast('Lab values updated');
    setDraft({});
    onClose();
  };
  const close = () => {
    setDraft({});
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={close} height="large" title="Edit values" footer={<Button fullWidth onClick={save}>Save</Button>}>
      <div className={styles.body}>
        <p className={styles.intro}>Change any value that doesn’t match your report.</p>
        {report.values.map((v) => (
          <Input
            key={v.id}
            label={v.unit.trim() ? `${v.marker} (${v.unit.trim()})` : v.marker}
            value={valueOf(v.id, v.value)}
            inputMode="decimal"
            autoComplete="off"
            onChange={(e) => setDraft((d) => ({ ...d, [v.id]: e.target.value }))}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
