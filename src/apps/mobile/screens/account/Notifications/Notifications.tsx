/**
 * @screen  M-10.4 · Notifications
 * @flow    F10 Account, privacy & data
 * @states  reminders off (interval disabled) · on · system permission alert · permission denied (Settings banner)
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F10-account-privacy.md#m-104--notifications-not-in-wireframes
 * @xref    web: W-10.4 (apps/web/screens/account/Notifications) — not built
 */
import { useState } from 'react';
import { FOLLOW_UP_BODY, FOLLOW_UP_TITLE, useAppStore } from '@shared/store';
import { addDays, nowFrom, uid } from '@shared/utils';
import { Button, Header, Panel, Segmented, Toggle, useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './Notifications.module.css';
import { useAccountGate } from '@mobile/hooks/useAccountGate';

/** F10: 1 week · 2 weeks · 1 month — Off is the check-in toggle, not a segment. */
const INTERVALS = [
  { value: '7', label: 'Weekly' },
  { value: '14', label: 'Every 2 weeks' },
  { value: '30', label: 'Monthly' },
];
// Same default as M-2.8 Follow-up opt-in.
const DEFAULT_DAYS = 14;

function resolveInterval(days: number): number {
  return INTERVALS.some((o) => Number(o.value) === days) ? days : DEFAULT_DAYS;
}

export default function Notifications() {
  const { pop } = useNav();
  const gate = useAccountGate();
  const { previousTitle } = useRoute();
  const alert = useAlert();
  const toast = useToast();
  const permission = useAppStore((s) => s.notificationPermission);
  const followUp = useAppStore((s) => s.notifications.followUp[s.activeProfileId]);
  const bookingReminders = useAppStore((s) => s.notifications.bookingReminders);
  const denied = permission === 'denied';
  const checkIns = Boolean(followUp?.enabled) && !denied;
  const days = resolveInterval(followUp?.intervalDays ?? DEFAULT_DAYS);

  /** Turning anything on asks the system first when permission is still 'unknown' (as in M-2.8). */
  const ensurePermission = async () => {
    const p = useAppStore.getState().notificationPermission;
    if (p === 'granted') return true;
    if (p === 'denied') {
      toast('Turn on notifications in Settings first');
      return false;
    }
    const choice = await alert({
      title: '“Your Oracle Clinician” Would Like to Send You Notifications',
      message: 'Notifications may include alerts, sounds and icon badges.',
      buttons: [{ label: 'Don’t Allow', style: 'cancel' }, { label: 'Allow' }],
    });
    useAppStore.getState().setPermission(choice === 1 ? 'granted' : 'denied');
    return choice === 1;
  };

  /** Replace any queued check-in with one `interval` days from now (or none when off). */
  const reschedule = (on: boolean, interval: number) => {
    const s = useAppStore.getState();
    const deepLink = `followup:${s.activeProfileId}`;
    s.cancelNotifications(deepLink);
    s.setFollowUp(s.activeProfileId, on, interval);
    if (!on) return;
    // Lock-screen text stays generic: no symptoms, conditions or products.
    s.scheduleNotification({
      id: uid('n'),
      title: FOLLOW_UP_TITLE,
      body: FOLLOW_UP_BODY,
      deepLink,
      deliverAt: addDays(nowFrom(s).toISOString(), interval),
      delivered: false,
      read: false,
    });
  };

  const setCheckIns = async (on: boolean) => {
    if (!on) return reschedule(false, days);
    if (!useAppStore.getState().accountId) return gate('reminders', () => void setCheckIns(true));
    if (!(await ensurePermission())) return;
    reschedule(true, days);
    toast('Check-in reminders on');
  };

  const changeInterval = (value: string) => {
    reschedule(true, Number(value));
  };

  const [awayFollowUp, setAwayFollowUp] = useState(() => {
    try {
      return localStorage.getItem('oc.away-followup') === '1';
    } catch {
      return false;
    }
  });
  const toggleAway = (on: boolean) => {
    setAwayFollowUp(on);
    try {
      localStorage.setItem('oc.away-followup', on ? '1' : '0');
    } catch {
      /* session-only */
    }
  };

  const setBooking = async (on: boolean) => {
    if (on && !useAppStore.getState().accountId) return gate('reminders', () => void setBooking(true));
    if (on && !(await ensurePermission())) return;
    useAppStore.getState().setBookingReminders(on);
  };

  const openSettings = () => {
    // ASSUMPTION: for the demo, "Open Settings" also grants permission so the flow can continue.
    useAppStore.getState().setPermission('granted');
    toast('Opened Settings (demo) — notifications allowed');
  };

  return (
    <div className={styles.root} data-xref="M-10.4 · Notifications">
      <Header title="Notifications" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body}>
        {denied && (
          <Panel tone="warning" icon="alert">
            <p className={styles.text}>Notifications are off in Settings</p>
            <div>
              <Button variant="secondary" size="md" onClick={openSettings}>Open Settings</Button>
            </div>
          </Panel>
        )}

        <section className={styles.group} aria-label="Check-in reminders">
          <Toggle checked={checkIns} onChange={setCheckIns} label="Check-in reminders" description="Deborah asks how you’re doing." />
          {checkIns && (
            <fieldset className={styles.interval}>
              <legend className={styles.legend}>Preferred frequency</legend>
              <Segmented
                label="Preferred frequency"
                options={INTERVALS}
                value={String(days)}
                onChange={changeInterval}
              />
            </fieldset>
          )}
        </section>

        <section className={styles.group} aria-label="Booking reminders">
          <Toggle
            checked={bookingReminders && !denied}
            onChange={setBooking}
            label="Booking reminders"
            description="The day before a consultation with Deborah."
          />
        </section>

        <section className={styles.group} aria-label="Inactivity follow-up">
          <Toggle
            checked={awayFollowUp && !denied}
            onChange={toggleAway}
            label="Follow-up when I’ve been away"
            description="Design only for now — no automatic inactivity schedule yet."
          />
        </section>
      </div>
    </div>
  );
}
