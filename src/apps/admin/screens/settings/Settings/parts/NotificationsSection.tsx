/** Email notification preferences per type (story 11.1). In-app notifications are always on; deletion deadline
 *  reminders can't be turned off. Changes are a draft until Save. */
import { useState } from 'react';
import { CATEGORIES, NOTIFICATION_ORDER, useAdminNotifications, useAdminStore, type NotificationCategory } from '@shared/admin';
import { Button, Checkbox } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import s from './settings.module.css';

export function NotificationsSection() {
  const role = useAdminStore((st) => st.role);
  const prefs = useAdminNotifications((st) => st.prefs);
  const [draft, setDraft] = useState(prefs);
  const sim = useSim();
  const cats = NOTIFICATION_ORDER.filter((c) => role === 'super' || !CATEGORIES[c].superOnly);
  const dirty = cats.some((c) => draft[c].email !== prefs[c].email);
  const toggle = (c: NotificationCategory, email: boolean) => setDraft((d) => ({ ...d, [c]: { email } }));
  const save = () =>
    sim.run(() => {
      const { setPref } = useAdminNotifications.getState();
      cats.forEach((c) => setPref(c, draft[c]));
      useAdminStore.getState().log('Updated notification preferences');
    }, 'Your notification preferences have been updated.');

  return (
    <Section title="Email notifications">
      <p className={s.note}>Everything always appears in the notification centre. Choose which types are also emailed to you.</p>
      <ul className={s.list}>
        {cats.map((c) => (
          <li key={c} className={s.item}>
            <span className={s.itemMain}>
              <span className={s.itemTitle}>{CATEGORIES[c].label}</span>
              <span className={s.itemMeta}>{CATEGORIES[c].locked ? 'Deletion deadline notifications can’t be turned off.' : CATEGORIES[c].description}</span>
            </span>
            <Checkbox label={`Email me about ${CATEGORIES[c].label.toLowerCase()}`} hideLabel checked={CATEGORIES[c].locked || draft[c].email} disabled={CATEGORIES[c].locked} onChange={(v) => toggle(c, v)} />
          </li>
        ))}
      </ul>
      <div className={s.actions}>
        <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(prefs)}>Discard</Button>
        <Button disabled={!dirty} loading={sim.busy} onClick={save}>Save changes</Button>
      </div>
    </Section>
  );
}
