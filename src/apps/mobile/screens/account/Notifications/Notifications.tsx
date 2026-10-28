/**
 * @screen  M-10.4 · Notifications
 * @flow    F10 Account, privacy & data
 * @states  all off · per-type on/off · system permission alert · permission denied (Settings banner)
 * Notification settings (Miro 2026-10-20); the inbox of arrived notifications is M-10.6.
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F10-account-privacy.md#m-104--notifications-not-in-wireframes
 * @xref    web: W-10.4 (apps/web/screens/account/Notifications) — not built
 */
import { FOLLOW_UP_BODY, FOLLOW_UP_TITLE, useAppStore } from '@shared/store';
import { addDays, nowFrom, uid } from '@shared/utils';
import { Button, Header, Panel, Toggle, ToggleGroup, useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './Notifications.module.css';
import { useAccountGate } from '@mobile/hooks/useAccountGate';

/** F10: 1 week · 2 weeks · 1 month — Off is the check-in toggle, not a segment. */
const INTERVALS = [
  { value: '7', label: 'Weekly' },
  // Short label so all three segments fit a phone without truncating.
  { value: '14', label: '2 weeks' },
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
      title: '“Your Oracle” Would Like to Send You Notifications',
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

  // Per-type preferences (missing = on); critical and re-consent can't be turned off.
  const prefs = useAppStore((s) => s.notifications.prefs);
  const enabled = useAppStore((s) => s.notifications.enabled !== false);
  const setPref = async (type: 'inactivity' | 'plan', on: boolean) => {
    if (on && !(await ensurePermission())) return;
    useAppStore.getState().setNotificationPref(type, on);
  };
  const setEnabled = async (on: boolean) => {
    if (on && !(await ensurePermission())) return;
    useAppStore.getState().setNotificationsEnabled(on);
    toast(on ? 'Notifications on' : 'Notifications off — important ones still come through');
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
      <Header title="Notification settings" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body}>
        {denied && (
          <Panel tone="warning" icon="alert">
            <p className={styles.text}>Notifications are off in Settings</p>
            <div>
              <Button variant="secondary" size="md" onClick={openSettings}>Open Settings</Button>
            </div>
          </Panel>
        )}

        <section className={styles.group} aria-label="Notifications">
          <Toggle checked={enabled && !denied} onChange={setEnabled} label="Allow notifications" description="Push notifications from the Oracle on this phone." />
        </section>

        {enabled && !denied && (
          <>
            <section className={styles.group} aria-label="Wellness Plan check-in">
              <Toggle checked={prefs?.plan !== false} onChange={(on) => void setPref('plan', on)} label="Wellness Plan check-in" description="A nudge to log today’s habits while your plan is running." />
            </section>
            <section className={styles.group} aria-label="30-day inactivity reminder">
              <Toggle checked={prefs?.inactivity !== false} onChange={(on) => void setPref('inactivity', on)} label="30-day inactivity reminder" description="If you haven’t talked with the Oracle for 30 days." />
            </section>
            <section className={styles.group} aria-label="Booking reminders">
              <Toggle checked={bookingReminders} onChange={setBooking} label="Booking reminders" description="The day before a consult with support team." />
            </section>
            <section className={styles.group} aria-label="Follow-up after guidance">
              {checkIns && (
                // Mobile: frequency first, then the follow-up toggle (designer, 2026-10-28). Web keeps the dropdown below.
                <fieldset className={styles.interval}>
                  <legend className={styles.legend}>Preferred frequency</legend>
                  <ToggleGroup label="Preferred frequency" options={INTERVALS} value={String(days)} onChange={changeInterval} />
                </fieldset>
              )}
              <Toggle checked={checkIns} onChange={setCheckIns} label="Follow-up after guidance" description="The Oracle asks how you’re doing after she’s shared guidance." />
            </section>
          </>
        )}

        <section className={styles.group} aria-label="Always on">
          <Toggle checked disabled onChange={() => {}} label="Critical follow-up" description="Always on: safety follow-ups when something needs attention." />
          <Toggle checked disabled onChange={() => {}} label="Re-consent on policy update" description="Always on: we ask again when our privacy policy changes." />
        </section>
      </div>
    </div>
  );
}
