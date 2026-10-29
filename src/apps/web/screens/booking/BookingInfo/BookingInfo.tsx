/**
 * @screen  M-8.2 · Book a consultation
 * @flow    F08 Human escalation — routes to the support team (Gabby). No booking or payment in the app (Oct 27).
 * @presentation sheet — tapping "Book a consultation" anywhere sends the request; this only confirms it (designer, 2026-10-29).
 * @states  request sent
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470
 * @spec    docs/ux/F08-book-deborah.md#m-82--consult-with-deborah
 * @xref    web: W-8.2 (apps/web/screens/booking/BookingInfo)
 */
// OPEN: Oct 26 — "Routing rules (e.g., by the user's state) pending legal confirmation." Support copy is placeholder.
import { Button, Icon, Sheet } from '@web/ui';
import { useNav } from '@web/navigation';
import styles from './BookingInfo.module.css';

export default function BookingInfo() {
  const { dismissSheet } = useNav();
  return (
    <div data-xref="M-8.2 · Book a consultation">
      <Sheet detent="medium" footer={<Button fullWidth onClick={dismissSheet}>Done</Button>}>
        <div className={styles.body} data-placeholder>
          <span className={styles.check} aria-hidden><Icon name="check" size={28} /></span>
          <h1 className={styles.title}>Request sent</h1>
          <p className={styles.text}>Your request has been sent. Someone from our support team will contact you soon.</p>
        </div>
      </Sheet>
    </div>
  );
}
