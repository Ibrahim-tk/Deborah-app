/**
 * @screen  M-9.9 · Log your visit (provider visit summary)
 * @flow    F09 Records — Visit Notes tile › Log visit
 * @presentation push (DerivedPage)
 * @states  new (pre-filled from the provider note) · saved (reopen to edit)
 * @spec    Design request 2026-10-20 — "Provider Visit Summary" reference (OPEN: add to docs/ux/F09)
 * @xref    web: not built
 *
 * Same plain-form language as Edit health profile: inputs, text areas, dropdowns, repeating rows. Ends with
 * your own optional notes. Save writes `visitLog` onto the note. Clinical wording is placeholder.
 */
import { useState } from 'react';
import { uid } from '@shared/utils';
import { useAppStore } from '@shared/store';
import type { VisitLog as Log } from '@shared/types/domain';
import { IconButton, Input, Segmented, Select } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useNav, useScreenParams } from '@web/navigation';
import { useToast } from '@web/hooks/toast.store';
import { Area, ItemList, Section } from './parts/Rows';
import styles from './VisitLog.module.css';

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));
const SPECIALTY = opts(['Primary care', 'Gynecology', 'Endocrinology', 'Nurse practitioner', 'Other']);
const STATUS = opts(['Pending', 'Drawn', 'Resulted']);
const CHANGE = opts(['Started', 'Stopped', 'Dose changed', 'Continued']);
const PRIORITY = opts(['Routine', 'Schedule', 'Urgent']);

export default function VisitLog() {
  const { noteId = '', profileId } = useScreenParams<{ noteId: string; profileId: string }>();
  const { pop } = useNav();
  const toast = useToast();
  const note = useAppStore((s) => s.notes.byId[noteId]);
  const brief = note?.brief;
  const [log, setLog] = useState<Log>(() => note?.visitLog ?? {
    visitDate: brief?.appointmentDate?.slice(0, 10),
    chiefComplaint: brief?.chiefComplaint,
    labs: (brief?.labs ?? []).map((l) => ({ test: l.name, orderedBy: 'Provider', status: 'Pending' })),
    changes: [],
    nextSteps: [],
    loggedAt: '',
  });
  const set = <K extends keyof Log>(k: K, v: Log[K]) => setLog((x) => ({ ...x, [k]: v }));
  const t = (k: keyof Log) => ({ value: (log[k] as string) ?? '', onChange: (e: { target: { value: string } }) => set(k, e.target.value as never) });

  const save = () => {
    const s = useAppStore.getState();
    const at = new Date().toISOString();
    const visitLog = { ...log, loggedAt: at };
    if (note) s.updateNote(noteId, { visitLog });
    // From "+ New note › Log a provider visit": a new visit note in the same shape.
    else s.addNote({ id: uid('note'), profileId: profileId ?? s.activeProfileId, kind: 'after-visit', title: log.chiefComplaint?.split(/[.\n]/)[0]?.trim() || 'Provider visit', body: log.diagnosis ?? '', updatedAt: at, visitLog });
    toast('Visit logged');
    pop();
  };

  return (
    <DerivedPage
      title="Log your visit"
      composerPlaceholder="Ask Deborah about this visit…"
      trailing={<IconButton icon="check" label="Save visit log" onClick={save} />}
    >
      <div className={styles.body} data-xref="M-9.9 · Log your visit" data-placeholder>
        <Input label="Visit date" type="date" {...t('visitDate')} />
        <Section n="1" title="Why you went">
          <Area label="What you wanted help with" minRows={2} {...t('chiefComplaint')} />
          <Input label="How long has this been going on?" placeholder="e.g. 8–12 months" {...t('duration')} />
        </Section>
        <Section n="2" title="Provider seen">
          <Input label="Provider name" placeholder="Dr. / NP / PA" {...t('providerName')} />
          <Select label="Specialty" options={SPECIALTY} value={log.specialty} onChange={(v) => set('specialty', v)} />
          <Input label="Practice or clinic" placeholder="Optional" {...t('clinic')} />
          <Input label="Follow-up appointment" placeholder="e.g. 6 weeks, pending labs" {...t('followUp')} />
        </Section>
        <Section n="3" title="What I took away">
          <Area label="Diagnosis or impression given" minRows={2} {...t('diagnosis')} />
          <Area label="My own understanding" minRows={2} {...t('understanding')} />
          <Area label="Questions not addressed" minRows={2} {...t('unaddressed')} />
        </Section>
          <ItemList n="4" title="Labs ordered" addLabel="Add lab" items={log.labs} onChange={(v) => set('labs', v)} blank={() => ({ test: '', orderedBy: 'Provider', status: 'Pending' })}
            summary={(l) => ({ title: l.test, detail: l.status })}
            fields={(l, p) => (<>
              <Input label="Lab or test name" placeholder="e.g. Vitamin D, TSH, FSH" value={l.test} onChange={(e) => p({ test: e.target.value })} />
              <fieldset className={styles.seg}><legend className={styles.segLabel}>Status</legend><Segmented label="Status" options={STATUS} value={l.status} onChange={(v) => p({ status: v })} /></fieldset>
            </>)}>
            <Input label="Lab notes" placeholder="e.g. Results in 5–7 days" {...t('labNotes')} />
          </ItemList>
          <ItemList n="5" title="Medicines and supplements" addLabel="Add medicine or supplement" items={log.changes} onChange={(v) => set('changes', v)} blank={() => ({ name: '', change: 'Started', dose: '' })}
            summary={(c) => ({ title: c.name, detail: [c.change, c.dose].filter(Boolean).join(' · ') })}
            fields={(c, p) => (<>
              <Input label="Medicine or supplement" placeholder="e.g. Magnesium glycinate" value={c.name} onChange={(e) => p({ name: e.target.value })} />
              <Select label="Change" options={CHANGE} value={c.change} onChange={(v) => p({ change: v })} />
              <Input label="New dose or notes" placeholder="e.g. 200 mg at night" value={c.dose} onChange={(e) => p({ dose: e.target.value })} />
            </>)} />
          <ItemList n="6" title="Next steps" addLabel="Add next step" items={log.nextSteps} onChange={(v) => set('nextSteps', v)} blank={() => ({ priority: 'Routine', text: '' })}
            summary={(x) => ({ title: x.text, detail: x.priority })}
            fields={(x, p) => (<>
              <Input label="Step" placeholder="e.g. Pick up lab order this week" value={x.text} onChange={(e) => p({ text: e.target.value })} />
              <Select label="Priority" options={PRIORITY} value={x.priority} onChange={(v) => p({ priority: v })} />
            </>)} />
        <Section n="7" title="Your own notes (optional)">
          <Area label="Anything you want to remember" minRows={3} placeholder="How the visit felt, what to mention next time" {...t('ownNotes')} />
        </Section>
      </div>
    </DerivedPage>
  );
}
