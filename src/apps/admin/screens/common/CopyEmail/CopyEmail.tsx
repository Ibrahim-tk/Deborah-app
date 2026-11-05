/** Shared by the client and escalation drawers. An email with an always-visible copy button. After copying, the button
 *  turns into a green check with "Copied" beside it for two seconds. */
import { useEffect, useState } from 'react';
import { IconButton } from '@admin/ui';
import { useAdminToast } from '@admin/hooks/toast.store';
import styles from './CopyEmail.module.css';

/** Any short value with a copy button (emails, Stripe IDs). */
export function CopyText({ value, label = 'value' }: { value: string; label?: string }) {
  const toast = useAdminToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast(`Couldn't copy. Select the ${label} and copy it instead.`);
    }
  };

  return (
    <span className={styles.root} data-copied={copied || undefined}>
      <span className={styles.text}>{value}</span>
      <IconButton icon={copied ? 'check' : 'copy'} size="sm" label={copied ? 'Copied' : `Copy ${label}`} className={styles.copy} onClick={copy} />
      {copied && <span className={styles.done} role="status">Copied</span>}
    </span>
  );
}

export const CopyEmail = ({ email }: { email: string }) => <CopyText value={email} label="email" />;
