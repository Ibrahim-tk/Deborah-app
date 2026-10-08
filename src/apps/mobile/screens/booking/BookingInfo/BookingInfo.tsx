/**
 * @screen  M-8.2 · Consult with Deborah
 * @flow    F08 Book Deborah (human escalation)
 * @states  default (no state chosen, Choose a time disabled) · state chosen · state not licensed (notice + Notify me)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-470
 * @spec    docs/ux/F08-book-deborah.md#m-82--consult-with-deborah
 * @xref    web: W-8.2 (apps/web/screens/booking/BookingInfo) — not built
 */
import { useState } from 'react';
import { bookingInfo } from '@shared/data';
import { Button, Card, Checkbox, Header, Panel, Select } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './BookingInfo.module.css';

const STATE_OPTIONS = bookingInfo.states.map((s) => ({ value: s, label: s }));

export default function BookingInfo() {
  const { pop, push } = useNav();
  const { previousTitle } = useRoute();
  const toast = useToast();
  const [state, setState] = useState<string | undefined>();
  // Explicit consent: sharing app history is always off until she ticks it.
  const [shareHistory, setShareHistory] = useState(false);

  // Empty licensed list = accept every state (prototype).
  const licensed = bookingInfo.statesLicensed;
  const notLicensed = Boolean(state && licensed.length > 0 && !licensed.includes(state));
  const placeholder = bookingInfo.status === 'placeholder' || undefined;

  return (
    <div className={styles.root} data-xref="M-8.2 · Consult with Deborah">
      <Header title="Consult with Deborah" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body}>
        <Card>
          <h2 className={styles.cardTitle}>What to expect</h2>
          <p className={styles.text} data-placeholder={placeholder}>
            A {bookingInfo.durationMin}-minute {bookingInfo.format.toLowerCase()} with Deborah.
          </p>
          <div className={styles.prepare}>
            <p className={styles.label}>What to prepare</p>
            <ul className={styles.list} data-placeholder={placeholder}>
              {bookingInfo.prepare.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </Card>

        <div className={styles.priceRow}>
          <span className={styles.label}>Price</span>
          {/* OPEN: "Price" (F08 M-8.2) — shows "Price shown at checkout" until known. */}
          <span className={styles.price}>{bookingInfo.price === null ? 'Price shown at checkout' : `$${bookingInfo.price}`}</span>
        </div>

        <Select label="Where do you live?" placeholder="Choose your state" options={STATE_OPTIONS} value={state} onChange={setState} />

        {notLicensed && (
          <Panel tone="warning" icon="location">
            <p className={styles.text}>Deborah can’t see patients in {state} yet. Get notified when she can.</p>
            <div>
              <Button variant="secondary" size="md" onClick={() => toast('We’ll let you know when Deborah can see you')}>Notify me</Button>
            </div>
          </Panel>
        )}

        <Checkbox
          checked={shareHistory}
          onChange={setShareHistory}
          label="Share my app history with Deborah for this visit"
          description="Only for this consultation. You can say no."
        />
      </div>

      <div className={styles.footer}>
        {/* ASSUMPTION: an unlicensed state also blocks "Choose a time" (the notice offers Notify me instead). */}
        <Button fullWidth disabled={!state || notLicensed} onClick={() => push('M-8.3', { state, shareHistory })}>
          Choose a time
        </Button>
        {!state && <p className={styles.hint}>Choose your state to see times.</p>}
      </div>
    </div>
  );
}
