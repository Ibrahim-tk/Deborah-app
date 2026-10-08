/**
 * @screen  M-5.4 · Check your results
 * @flow    F05 Follow-up & return with labs
 * @states  detected (sample-a values) · manual (empty, add form open) · editing a row · adding a value · nothing to send
 *          · edit mode (from M-9.5: prefilled from the stored report, "Save changes", no chat send)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547
 * @spec    docs/ux/F05-followup-labs.md#m-54--check-your-results
 * @xref    web: W-5.4 (apps/web/screens/followup/ConfirmLabs) — not built
 */
import { useState } from 'react';
import { labSampleReports } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { LabReport, LabValue } from '@shared/types/domain';
import { addDays, nowFrom, uid } from '@shared/utils';
import { Button, Input, Modal } from '@mobile/ui';
import { LabValueRow } from '@mobile/patterns/health';
import { useConversation } from '@mobile/hooks/useConversation';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { AddValueForm } from './parts/AddValueForm';
import styles from './ConfirmLabs.module.css';

type Source = LabReport['source'];

/** yyyy-mm-dd for <input type="date">, in local time. */
const toDateInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function initialDraft(source: Source, report?: LabReport) {
  const s = useAppStore.getState();
  if (report) {
    const at = report.collectedAt ? new Date(report.collectedAt) : nowFrom(s);
    return { labName: report.labName ?? '', date: toDateInput(at), values: report.values.map((v) => ({ ...v })) };
  }
  // Any picked file maps to sample-a (docs/07-ai-simulation.md §6); demo values, not guidance.
  const sample = labSampleReports['sample-a'];
  const detected = source !== 'manual';
  return {
    labName: detected ? sample.labName : '',
    date: toDateInput(new Date(addDays(nowFrom(s).toISOString(), detected ? -sample.collectedDaysAgo : 0))),
    values: detected ? sample.values.map((v) => ({ id: uid('lv'), ...v })) : ([] as LabValue[]),
  };
}

export default function ConfirmLabs() {
  const params = useScreenParams<{ source: Source; fileName: string; mode: 'edit'; reportId: string }>();
  const { dismissModal, returnToConversation } = useNav();
  const chat = useConversation();
  const toast = useToast();
  // Edit mode (M-9.5 → Edit): same layout, prefilled from the stored report.
  const [stored] = useState(() => (params.mode === 'edit' && params.reportId ? useAppStore.getState().labs.reportsById[params.reportId] : undefined));
  const source = stored?.source ?? params.source ?? 'manual';
  const [draft] = useState(() => initialDraft(source, stored));
  const [labName, setLabName] = useState(draft.labName);
  const [date, setDate] = useState(draft.date);
  const [values, setValues] = useState<LabValue[]>(draft.values);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(source === 'manual' && !stored);
  const [error, setError] = useState<string | null>(null);

  const patch = (id: string, p: { value?: string; unit?: string }) =>
    setValues((vs) => vs.map((v) => (v.id === id ? { ...v, ...p, edited: source !== 'manual' || v.edited } : v)));

  const send = () => {
    const complete = values.filter((v) => v.value.trim());
    if (complete.length === 0) return setError('Add at least one value from your report first.');
    const s = useAppStore.getState();
    const collectedAt = new Date(`${date}T12:00:00`).toISOString();
    if (stored) {
      s.replaceReport({ ...stored, labName: labName.trim() || undefined, collectedAt, values: complete, confirmed: true });
      dismissModal();
      return toast('Saved');
    }
    const report: LabReport = {
      id: uid('lab'),
      profileId: s.activeProfileId,
      source,
      labName: labName.trim() || undefined,
      collectedAt,
      values: complete,
      confirmed: false,
    };
    s.addReport(report);
    s.confirmReport(report.id);
    returnToConversation();
    chat.shareLabs({ ...report, confirmed: true });
  };

  return (
    <div className={styles.root} data-xref="M-5.4 · Check your results">
      <Modal
        title="Check your results"
        onClose={dismissModal}
        footer={
          <>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <Button fullWidth onClick={send}>{stored ? 'Save changes' : 'Looks right — send to Deborah'}</Button>
          </>
        }
      >
        <div className={styles.body}>
          <div className={styles.meta}>
            <Input label="Lab" placeholder="e.g. Quest Diagnostics" value={labName} onChange={(e) => setLabName(e.target.value)} />
            <Input label="Collection date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className={styles.values}>
            {values.length === 0 && !adding && <p className={styles.empty}>No values yet. Add the ones on your report.</p>}
            {values.map((v) => (
              <LabValueRow
                key={v.id}
                value={v}
                editing={editing === v.id}
                onEdit={() => setEditing(v.id)}
                onChange={(p) => patch(v.id, p)}
                onDone={() => setEditing(null)}
                onDelete={() => {
                  setValues((vs) => vs.filter((x) => x.id !== v.id));
                  setEditing(null);
                }}
              />
            ))}
          </div>

          {adding ? (
            <AddValueForm
              existing={values.map((v) => v.marker)}
              onAdd={(v) => {
                setValues((vs) => [...vs, { id: uid('lv'), ...v }]);
                setError(null);
              }}
              onClose={() => setAdding(false)}
            />
          ) : (
            <Button variant="secondary" leadingIcon="plus" onClick={() => setAdding(true)}>Add a value</Button>
          )}

          <p className={styles.disclaimer}>Please make sure these match your report.</p>
        </div>
      </Modal>
    </div>
  );
}
