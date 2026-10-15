/**
 * Verification code: 6 boxes in two groups of three, auto-advance, paste fills all, any code
 * accepted, resend after 30 s. Filled boxes take a soft lilac fill; the active box the accent ring.
 */
import { Fragment, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Button, ProgressStatus } from '@flow-v1/apps/mobile/ui';
import { useToast } from '@flow-v1/apps/mobile/hooks/toast.store';
import { simMs } from '@flow-v1/apps/mobile/hooks/simTiming';
import { useLatest } from '@flow-v1/apps/mobile/hooks/useLatest';
import styles from './CodeStep.module.css';

const LENGTH = 6;
const RESEND_S = 30;

export function CodeStep({ email, onVerified, onChangeEmail }: { email: string; onVerified: () => void; onChangeEmail?: () => void }) {
  const toast = useToast();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [wait, setWait] = useState(RESEND_S);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const verified = useLatest(onVerified);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  useEffect(() => {
    if (!verifying) return;
    const id = window.setTimeout(() => verified.current(), simMs(900));
    return () => window.clearTimeout(id);
  }, [verifying, verified]);

  const update = (next: string[]) => {
    setDigits(next);
    if (next.every(Boolean)) setVerifying(true);
  };

  const onType = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    update(next);
    if (d && i < LENGTH - 1) boxes.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    update(Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? ''));
    boxes.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className={styles.root}>
      <p className={styles.text}>
        Enter the 6-digit code we sent to
        <span className={styles.emailRow}>
          <span className={styles.email}>{email}</span>
          {onChangeEmail && !verifying && (
            <button type="button" className={styles.change} onClick={onChangeEmail}>Change</button>
          )}
        </span>
      </p>
      <div className={styles.boxes} role="group" aria-label="Verification code" onPaste={onPaste} data-verifying={verifying || undefined}>
        {digits.map((d, i) => (
          <Fragment key={i}>
            {i === LENGTH / 2 && <span className={styles.dash} aria-hidden />}
            <input
              ref={(el) => {
                boxes.current[i] = el;
              }}
              className={styles.box}
              data-filled={d ? true : undefined}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1}`}
              autoFocus={i === 0}
              disabled={verifying}
              value={d}
              onChange={(e) => onType(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
            />
          </Fragment>
        ))}
      </div>
      <div className={styles.foot}>
        {verifying ? (
          <ProgressStatus label="Checking your code" />
        ) : wait > 0 ? (
          <p className={styles.resend}>Didn’t get it? Resend in 0:{String(wait).padStart(2, '0')}</p>
        ) : (
          <Button
            variant="link"
            onClick={() => {
              setWait(RESEND_S);
              toast('Code sent again');
            }}
          >
            Resend code
          </Button>
        )}
      </div>
    </div>
  );
}
