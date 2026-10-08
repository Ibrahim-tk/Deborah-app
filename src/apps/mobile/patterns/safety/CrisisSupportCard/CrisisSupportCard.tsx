/**
 * @pattern CrisisSupportCard — calm tone (not alarm red), 988 first, more support inline
 * @usedBy  M-2.1
 * @spec    docs/ux/F03-safety.md#pattern--crisissupportcard-figma-33
 * @xref    web: apps/web/patterns/safety/CrisisSupportCard — not built
 */
// OPEN: "exact behaviour and copy with Deborah + attorney (SOW requires crisis safeguards)".
import { useState } from 'react';
import { Button, Card } from '@mobile/ui';
import styles from './CrisisSupportCard.module.css';

export interface CrisisSupportCardProps {
  body: string;
  lifelineLabel: string;
  moreSupport: string[];
  onCall: () => void;
  onKeepTalking: () => void;
}

export function CrisisSupportCard({ body, lifelineLabel, moreSupport, onCall, onKeepTalking }: CrisisSupportCardProps) {
  const [more, setMore] = useState(false);
  return (
    <Card>
      <div className={styles.root} data-placeholder>
        <p className={styles.body}>{body}</p>
        <Button fullWidth leadingIcon="phone" onClick={onCall}>{lifelineLabel}</Button>
        <Button variant="secondary" fullWidth onClick={() => setMore((m) => !m)} aria-expanded={more}>
          More ways to get support
        </Button>
        {more && (
          <ul className={styles.list}>
            {moreSupport.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <Button variant="ghost" fullWidth onClick={onKeepTalking}>Keep talking with Deborah</Button>
      </div>
    </Card>
  );
}
