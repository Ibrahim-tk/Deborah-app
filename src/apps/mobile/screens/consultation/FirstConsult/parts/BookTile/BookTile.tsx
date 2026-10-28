/** After the answer: one tile to book Deborah; the sheet says she'll follow up by email (no slot picking here). */
import { useState } from 'react';
import { ActionTile, BottomSheet, Button, Sheet } from '@mobile/ui';
import styles from './BookTile.module.css';

export function BookTile({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ActionTile icon="calendar" title="Consult with support team" meta="30 min · Video or phone" onClick={() => setOpen(true)} />
      <BottomSheet open={open} onClose={() => setOpen(false)} showClose>
        <Sheet
          title="You’ll get an email"
          subtitle="the support team will email you to find a time that works for a 30‑minute video or phone consult."
          footer={<Button fullWidth onClick={() => { setOpen(false); onBook(); }}>Request a consultation</Button>}
        >
          <p className={styles.note} data-placeholder>Nothing is booked until you confirm the time in that email.</p>
        </Sheet>
      </BottomSheet>
    </>
  );
}
