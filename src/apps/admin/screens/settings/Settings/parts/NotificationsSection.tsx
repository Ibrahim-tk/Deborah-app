/** Notification preferences as a simple grid: category | In-app | Email | When, with checkboxes.
 *  Changes are a draft until Save; Discard puts them back. Locked rows stay on. */
import { useState } from 'react';
import { CATEGORIES, NOTIFICATION_ORDER, useAdminNotifications, useAdminStore, type DeliveryPref, type NotificationCategory } from '@shared/admin';
import { Button, Checkbox, Select } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import { Section } from '@admin/patterns';
import p from './NotificationsSection.module.css';

const SHORT: Record<string, string> = {
  safety: 'Emergency and critical cases',
  support: 'New requests and requests for Deborah',
  data: 'Deletion requests and deadlines',
  clients: 'Consent withdrawn',
  billing: 'Failed payments, Stripe issues, daily summary',
  team: 'Invites and deactivations',
  security: 'New sign-ins and failed sign-ins',
  compliance: 'Consent versions and reviews',
};

export function NotificationsSection() {
  const role = useAdminStore((st) => st.role);
  const saved = useAdminNotifications((st) => st.prefs);
  const [prefs, setPrefs] = useState(saved);
  const sim = useSim();
  const cats = NOTIFICATION_ORDER.filter((c) => role === 'super' || !CATEGORIES[c].superOnly);
  const setPref = (c: NotificationCategory, pref: Partial<DeliveryPref>) => setPrefs((p0) => ({ ...p0, [c]: { ...p0[c], ...pref } }));
  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);
  const save = () =>
    sim.run(() => {
      const store = useAdminNotifications.getState();
      cats.forEach((c) => store.setPref(c, prefs[c]));
      useAdminStore.getState().log('Updated notification preferences');
    }, 'Preferences saved');

  return (
    <Section title="Notification preferences" surface>
      <div className={p.wrap}>
        <div className={p.grid} role="table" aria-label="Notification preferences">
          <div className={p.head} role="row">
            <span role="columnheader">Notify me about</span>
            <span role="columnheader" className={p.center}>In-app</span>
            <span role="columnheader" className={p.center}>Email</span>
            <span role="columnheader">When</span>
          </div>
          {cats.map((c) => {
            const meta = CATEGORIES[c];
            const pref = prefs[c];
            return (
              <div key={c} className={p.row} role="row">
                <span className={p.what} role="cell">
                  <span className={p.label}>
                    {meta.label}
                  </span>
                  <span className={p.description}>{SHORT[c]}</span>
                </span>
                <span className={p.center} role="cell">
                  <Checkbox hideLabel label={`${meta.label}: in-app`} checked={meta.locked ? true : pref.inApp} disabled={meta.locked} onChange={(v) => setPref(c, { inApp: v })} />
                </span>
                <span className={p.center} role="cell">
                  <Checkbox hideLabel label={`${meta.label}: email`} checked={meta.locked ? true : pref.email} disabled={meta.locked} onChange={(v) => setPref(c, { email: v })} />
                </span>
                <span role="cell" className={p.when}>
                  {meta.digest ? (
                    <Select<'instant' | 'daily'>
                      label={`${meta.label}: when`}
                      hideLabel
                      value={pref.frequency ?? 'instant'}
                      onChange={(v) => setPref(c, { frequency: v })}
                      options={[{ value: 'instant', label: 'Right away' }, { value: 'daily', label: 'Daily summary' }]}
                    />
                  ) : (
                    <span className={p.muted}>Right away</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className={p.footer}>
          <Button variant="ghost" disabled={!dirty || sim.busy} onClick={() => setPrefs(saved)}>Discard</Button>
          <Button disabled={!dirty} loading={sim.busy} onClick={save}>Save changes</Button>
        </div>
      </div>
    </Section>
  );
}
