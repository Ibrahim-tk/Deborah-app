/**
 * First-visit greeting: a bottom sheet where Deborah's orb says hello, and one clear button
 * into a first chat with her; she asks age and gender before anything else. Tapping the scrim (anywhere else) dismisses it.
 */
import { Button, DeborahBlob, IconButton, TextReveal } from '@mobile/ui';
import styles from './GreetingSheet.module.css';

export interface GreetingSheetProps {
  name: string;
  onDismiss: () => void;
  onOpenChat: () => void;
}

export function GreetingSheet({ name, onDismiss, onOpenChat }: GreetingSheetProps) {
  // OPEN: greeting copy is placeholder until Deborah approves it.
  const hello = `Hi${name ? ` ${name}` : ''}, I’m Deborah. Ask me anything about how you’re feeling, and we’ll take it from there together.`;
  return (
    <div className={styles.root}>
      <button type="button" className={styles.scrim} onClick={onDismiss} aria-label="Dismiss greeting" />
      <div className={styles.sheet} role="dialog" aria-label="Deborah says hello" data-placeholder>
        <span className={styles.handle} aria-hidden />
        <IconButton icon="close" label="Close" className={styles.close} onClick={onDismiss} />
        <DeborahBlob size={80} label="Deborah" />
        <TextReveal className={styles.hello} text={hello} delay={350} />
        <div className={styles.actions}>
          <Button fullWidth onClick={onOpenChat}>Start your first conversation</Button>
        </div>
      </div>
    </div>
  );
}
