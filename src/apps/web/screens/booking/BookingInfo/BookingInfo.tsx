/**
 * @screen  M-8.2 · Book a consultation
 * @flow    F08 Human escalation — routes to the support team (Gabby). No booking or payment in the app (Oct 27).
 * @states  default · history shared · request sent
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470
 * @spec    docs/ux/F08-book-deborah.md#m-82--consult-with-deborah
 * @xref    web: W-8.2 (apps/web/screens/booking/BookingInfo)
 */
// OPEN: Oct 27 — "This routes to Gabby; there's no booking or payment in the app." Support contact copy is placeholder.
import { useState } from 'react';
import { Button, Card, Checkbox, Header } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useRoute } from '@web/navigation';
import styles from './BookingInfo.module.css';

export default function BookingInfo() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const toast = useToast();
  // Explicit consent: sharing app history is always off until she ticks it.
  const [shareHistory, setShareHistory] = useState(false);
  const [sent, setSent] = useState(false);

  const send = () => {
    setSent(true);
    toast('Request sent to the support team (demo)');
  };

  return (
    <div className={styles.root} data-xref="M-8.2 · Book a consultation">
      <Header title="Book a consultation" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body}>
        <Card>
          <h2 className={styles.cardTitle}>What to expect</h2>
          <p className={styles.text} data-placeholder>
            Someone from our support team will reach out to help with your question and next steps.
          </p>
        </Card>
        <Checkbox
          checked={shareHistory}
          onChange={setShareHistory}
          label="Share my app history with the support team"
          description="Only for this request. You can say no."
        />
      </div>
      <div className={styles.footer}>
        <Button fullWidth disabled={sent} onClick={send}>{sent ? 'Request sent' : 'Send request'}</Button>
      </div>
    </div>
  );
}
