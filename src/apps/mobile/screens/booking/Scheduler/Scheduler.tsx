/**
 * @screen  M-8.3 · Pick a time (simulated scheduler)
 * @flow    F08 Book Deborah (human escalation)
 * @states  no time chosen · time chosen (summary bar) · processing (1 s) · → replaced by M-8.4
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470
 * @spec    docs/ux/F08-book-deborah.md#m-83--pick-a-time-simulated-scheduler
 * @xref    web: W-8.3 (apps/web/screens/booking/Scheduler) — not built
 *
 * A native-feeling mock, not a web view. OPEN: "real telehealth system and payment."
 */
import { useEffect, useMemo, useState } from 'react';
import { bookingInfo } from '@shared/data';
import { useAppStore } from '@shared/store';
import { dayKey, formatTime, nowFrom, uid } from '@shared/utils';
import { Button, Header, OptionList, OptionRow } from '@mobile/ui';
import { simMs } from '@mobile/hooks/simTiming';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { WeekStrip } from './parts/WeekStrip';
import styles from './Scheduler.module.css';

/** The local Date for a day at "HH:MM". */
const at = (day: Date, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
};

export default function Scheduler() {
  const { state = '', shareHistory = false } = useScreenParams<{ state: string; shareHistory: boolean }>();
  const { pop, replace } = useNav();
  const { previousTitle } = useRoute();
  const bookedSlots = useAppStore((s) => s.booking.bookings.filter((b) => b.status === 'booked').map((b) => b.slot).join('|'));

  // ASSUMPTION: the week starts tomorrow (no same-day bookings) and runs 7 days on the simulated clock.
  const days = useMemo(() => {
    const now = nowFrom(useAppStore.getState());
    return Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1 + i));
  }, []);

  const [dayId, setDayId] = useState(dayKey(days[0]));
  const [slot, setSlot] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const day = days.find((d) => dayKey(d) === dayId) ?? days[0];

  const slots = bookingInfo.dailyTimes.map((t) => {
    const iso = at(day, t).toISOString();
    const closed = bookingInfo.unavailable.some(([wd, time]) => wd === day.getDay() && time === t);
    return { iso, label: formatTime(iso), unavailable: closed || bookedSlots.includes(iso) };
  });

  useEffect(() => {
    if (!processing || !slot) return;
    const id = window.setTimeout(() => {
      const s = useAppStore.getState();
      const bookingId = uid('bk');
      s.book({
        id: bookingId,
        profileId: s.activeProfileId,
        slot,
        durationMin: bookingInfo.durationMin,
        // OPEN: price — 0 until Deborah's consultation price is known.
        price: bookingInfo.price ?? 0,
        state,
        shareHistory,
        status: 'booked',
      });
      replace('M-8.4', { bookingId });
    }, simMs(1000));
    return () => window.clearTimeout(id);
  }, [processing, slot, state, shareHistory, replace]);

  const chosen = slot ? new Date(slot) : null;

  return (
    <div className={styles.root} data-xref="M-8.3 · Pick a time">
      <Header title="Pick a time" onBack={processing ? undefined : pop} backLabel={previousTitle} />
      <div className={styles.body}>
        <div className={styles.section}>
          <h2 className={styles.month}>{day.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <WeekStrip
            days={days}
            selected={dayId}
            onSelect={(k) => {
              setDayId(k);
              setSlot(null);
            }}
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.label}>{day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <OptionList layout="grid2" label="Time">
            {slots.map((s) => (
              <OptionRow
                key={s.iso}
                selected={slot === s.iso}
                disabled={s.unavailable || processing}
                onSelect={() => setSlot(s.iso)}
                className={s.unavailable ? styles.unavailable : undefined}
              >
                <span className={styles.time}>{s.label}</span>
                {s.unavailable && <span className={styles.taken}> · Taken</span>}
              </OptionRow>
            ))}
          </OptionList>
          <p className={styles.note}>Times are in your local time zone.</p>
        </div>
      </div>

      <div className={styles.summary} aria-live="polite">
        <p className={styles.summaryText}>
          {chosen
            ? `${chosen.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}, ${formatTime(slot!)} · ${bookingInfo.durationMin} min`
            : 'Choose a time'}
        </p>
        <Button fullWidth disabled={!slot} loading={processing} onClick={() => setProcessing(true)}>
          {processing ? 'Booking…' : 'Confirm booking'}
        </Button>
      </div>
    </div>
  );
}
