/** Proxy chat pieces: the "asking about" session banner and a copy-word-for-word block (e.g. for triage). */
import { useState } from 'react';
import { Button, Icon, Panel } from '@mobile/ui';
import styles from './ProxyBits.module.css';

export function SessionBanner({ text }: { text: string }) {
  return <Panel tone="linen" icon="family">{text}</Panel>;
}

export function CopyBlock({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* Clipboard can be blocked in previews; the text stays selectable. */
    }
    setCopied(true);
  };
  return (
    <section className={styles.block} aria-label={title}>
      <p className={styles.head}><Icon name="copy" size={16} />{title}</p>
      <p className={styles.text}>{text}</p>
      <Button variant="secondary" size="md" leadingIcon={copied ? 'check' : 'copy'} onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
    </section>
  );
}
