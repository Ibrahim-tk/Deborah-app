/**
 * @screen  M-8.4 · Booking confirmed
 * @flow    F08 Book Deborah (human escalation)
 * @states  confirmed (check animation) · read mode (details + Cancel booking) · cancelled · not found
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470
 * @spec    docs/ux/F08-book-deborah.md#m-84--booking-confirmed
 * @xref    web: W-8.4 (apps/web/screens/booking/BookingConfirmed) — not built
 *
 * Read mode is reached by "View details" or by the `booking:<id>` deep link (mode: 'read').
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { formatDayDate, formatTime } from '@shared/utils';
import { Button, DURATION, EASE_OUT, Header, Icon, MotionDiv, useReducedMotionPref } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { BookingDetails } from './parts/BookingDetails';
import styles from './BookingConfirmed.module.css';

export default function BookingConfirmed() {
  const { bookingId, mode } = useScreenParams<{ bookingId: string; mode: 'read' }>();
  const { pop, returnToConversation } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const toast = useToast();
  const reduced = useReducedMotionPref();
  const booking = useAppStore((s) => s.booking.bookings.find((b) => b.id === bookingId));
  // "View details" switches this screen into read mode; Back returns to the confirmation.
  const [reading, setReading] = useState(mode === 'read');

  if (!booking || reading) {
    const onBack = reading && mode !== 'read' ? () => setReading(false) : canGoBack ? pop : undefined;
    return (
      <div className={styles.root} data-xref="M-8.4 · Booking details">
        <Header title="Your booking" onBack={onBack} backLabel={reading && mode !== 'read' ? 'Booked' : previousTitle} />
        <div className={styles.body}>
          {booking ? (
            <BookingDetails booking={booking} />
          ) : (
            <p className={styles.text}>This booking is no longer available.</p>
          )}
          <Button variant="link" onClick={returnToConversation}>Back to chat</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root} data-xref="M-8.4 · Booking confirmed">
      <Header />
      <div className={styles.confirmed}>
        <div className={styles.content}>
          {/* Calm arrival: fade and settle, no bounce or overshoot (DESIGN.md › Motion). */}
          <MotionDiv
            className={styles.mark}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? DURATION.reduced : DURATION.base, ease: EASE_OUT }}
          >
            <Icon name="check" size={40} strokeWidth={1.5} />
          </MotionDiv>
          <h1 className={styles.title}>Booked with Deborah</h1>
          <p className={styles.when}>
            {formatDayDate(booking.slot)} at {formatTime(booking.slot)}
          </p>
          <p className={styles.text}>We’ll remind you the day before.</p>
        </div>
        <div className={styles.actions}>
          <Button fullWidth leadingIcon="calendar" onClick={() => toast('Added to your calendar (demo)')}>Add to calendar</Button>
          <Button variant="secondary" fullWidth onClick={() => setReading(true)}>View details</Button>
          <Button variant="link" onClick={returnToConversation}>Back to chat</Button>
        </div>
      </div>
    </div>
  );
}
