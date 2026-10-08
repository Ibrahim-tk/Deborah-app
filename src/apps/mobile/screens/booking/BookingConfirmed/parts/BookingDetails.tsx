/** Private part of M-8.4: read mode — booking details, Cancel booking (SystemAlert) and the cancelled state. */
import { bookingInfo } from '@shared/data';
import { useAppStore } from '@shared/store';
import type { Booking } from '@shared/types/domain';
import { formatDayDate, formatTime } from '@shared/utils';
import { Button, Card, Panel, useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import styles from './BookingDetails.module.css';

export function BookingDetails({ booking }: { booking: Booking }) {
  const alert = useAlert();
  const toast = useToast();
  const cancelled = booking.status === 'cancelled';

  const rows: [string, string][] = [
    ['Date', formatDayDate(booking.slot)],
    ['Time', formatTime(booking.slot)],
    ['Length', `${booking.durationMin} min`],
    ['Format', bookingInfo.format],
    ['State', booking.state],
    ['App history', booking.shareHistory ? 'Shared with Deborah' : 'Not shared'],
    ['Status', cancelled ? 'Cancelled' : 'Booked'],
  ];

  const cancel = async () => {
    const choice = await alert({
      title: 'Cancel this booking?',
      message: `${formatDayDate(booking.slot)} at ${formatTime(booking.slot)} with Deborah.`,
      buttons: [{ label: 'Keep booking', style: 'cancel' }, { label: 'Cancel booking', style: 'destructive' }],
    });
    if (choice !== 1) return;
    useAppStore.getState().cancelBooking(booking.id);
    toast('Booking cancelled');
  };

  return (
    <div className={styles.root}>
      {cancelled && (
        <Panel tone="lilac" icon="info">
          <p className={styles.text}>This booking is cancelled. You can book a new time whenever you like.</p>
        </Panel>
      )}
      <Card>
        <h2 className={styles.title}>Consultation with Deborah</h2>
        <dl className={styles.rows}>
          {rows.map(([k, v]) => (
            <div key={k} className={styles.row}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      {!cancelled && (
        <Button variant="destructive" fullWidth onClick={cancel}>Cancel booking</Button>
      )}
    </div>
  );
}
