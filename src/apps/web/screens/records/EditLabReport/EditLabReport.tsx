/**
 * @screen  M-9.11 · Edit lab report
 * @flow    F09 Records
 * @presentation push (DerivedPage) — same form as M-7.8 Edit health profile
 * @states  editing
 * @spec    Design request 2026-10-21 (OPEN: add to docs/ux/F09-records.md)
 * @xref    web: W-9.11
 *
 * Rename the report (panel name), the lab, and change any value. Back closes without saving; Save is pinned.
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { Button, Input } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useScreenParams } from '@web/navigation';
import { useToast } from '@web/hooks/toast.store';
import styles from '@web/screens/myhealth/EditHealthSection/EditHealthSection.module.css';

export default function EditLabReport() {
  const { reportId = '' } = useScreenParams<{ reportId: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const report = useAppStore((s) => s.labs.reportsById[reportId]);
  const [name, setName] = useState(report?.panelTitle ?? '');
  const [lab, setLab] = useState(report?.labName ?? '');
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries((report?.values ?? []).map((v) => [v.id, v.value])));

  const save = () => {
    if (!report) return pop();
    const next = report.values.map((v) => {
      const val = values[v.id]?.trim();
      return val && val !== v.value ? { ...v, value: val, edited: true } : v;
    });
    useAppStore.getState().replaceReport({
      ...report,
      panelTitle: name.trim() || report.panelTitle,
      labName: lab.trim() || report.labName,
      values: next,
    });
    toast('Lab report updated');
    pop();
  };

  return (
    <DerivedPage title="Edit lab report" composerPlaceholder="Ask Deborah about these labs…">
      <div className={styles.body} data-xref="M-9.11 · Edit lab report">
        <p className={styles.note}>Change anything that doesn’t match your report.</p>
        <section className={styles.field} aria-label="Report name">
          <Input label="Report name" value={name} autoCapitalize="words" onChange={(e) => setName(e.target.value)} />
        </section>
        <section className={styles.field} aria-label="Lab">
          <Input label="Lab" value={lab} autoCapitalize="words" onChange={(e) => setLab(e.target.value)} />
        </section>
        {report?.values.map((v) => (
          <section key={v.id} className={styles.field} aria-label={v.marker}>
            <Input
              label={v.unit.trim() ? `${v.marker} (${v.unit.trim()})` : v.marker}
              value={values[v.id] ?? ''}
              inputMode="decimal"
              autoComplete="off"
              onChange={(e) => setValues((d) => ({ ...d, [v.id]: e.target.value }))}
            />
          </section>
        ))}
        <Button fullWidth onClick={save}>Save</Button>
      </div>
    </DerivedPage>
  );
}
