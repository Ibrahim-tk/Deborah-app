/**
 * Desktop mock card checkout for M-4.2 (designer, 2026-10-29): a hosted-checkout look — order summary left,
 * card form right — so the prototype shows a real payment moment. Simulated only: nothing is sent anywhere,
 * no SDK, and the fields are pre-filled with a published test card. Our own "You're all set" follows.
 * OPEN: renewal and cancellation wording follows counsel (California Automatic Renewal Law).
 */
import { useState } from 'react';
import { Spinner } from '@web/ui';
import styles from './MockCheckout.module.css';

export interface MockCheckoutProps {
  planName: string;
  amount: number;
  email: string;
  processing: boolean;
  onPay: () => void;
}

export function MockCheckout({ planName, amount, email, processing, onPay }: MockCheckoutProps) {
  const [card, setCard] = useState({ email, number: '4242 4242 4242 4242', expiry: '12 / 34', cvc: '123', name: '', zip: '' });
  const set = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) => setCard((c) => ({ ...c, [k]: e.target.value }));
  const price = `$${amount.toFixed(2)}`;

  return (
    <div className={styles.root}>
      <section className={styles.summary} aria-label="Order summary">
        <p className={styles.merchant}>Your Oracle</p>
        <p className={styles.caption}>Subscribe to {planName}</p>
        <p className={styles.total}>{price} <span>per month</span></p>
        <dl className={styles.lines}>
          <div><dt>{planName} plan</dt><dd>{price}</dd></div>
          <div><dt>Billed monthly</dt><dd /></div>
          <div className={styles.due}><dt>Total due today</dt><dd>{price}</dd></div>
        </dl>
        <p className={styles.fine}>Renews automatically each month until cancelled. Cancel anytime in Settings.</p>
      </section>

      <form className={styles.form} aria-label="Payment" onSubmit={(e) => { e.preventDefault(); if (!processing) onPay(); }}>
        <p className={styles.test}>Test mode · simulated payment, no card is charged</p>
        <label className={styles.field}>
          <span>Email</span>
          <input type="email" value={card.email} onChange={set('email')} autoComplete="off" />
        </label>
        <div className={styles.field}>
          <span id="card-info">Card information</span>
          <div className={styles.cardGroup} role="group" aria-labelledby="card-info">
            <input aria-label="Card number" inputMode="numeric" value={card.number} onChange={set('number')} className={styles.full} autoComplete="off" />
            <input aria-label="Expiry date (MM / YY)" value={card.expiry} onChange={set('expiry')} autoComplete="off" />
            <input aria-label="CVC" inputMode="numeric" value={card.cvc} onChange={set('cvc')} autoComplete="off" />
          </div>
        </div>
        <label className={styles.field}>
          <span>Name on card</span>
          <input value={card.name} onChange={set('name')} placeholder="Full name" autoComplete="off" />
        </label>
        <label className={styles.field}>
          <span>ZIP</span>
          <input inputMode="numeric" value={card.zip} onChange={set('zip')} placeholder="12345" autoComplete="off" />
        </label>
        <button type="submit" className={styles.pay} disabled={processing} aria-live="polite">
          {processing ? <><Spinner size={18} label="Processing" /> Processing…</> : `Subscribe — ${price}/month`}
        </button>
        <p className={styles.fine}>By subscribing you allow Your Oracle to charge your card for this and future payments until you cancel.</p>
      </form>
    </div>
  );
}
