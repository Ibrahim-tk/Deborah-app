/**
 * First-visit greeting on the shared ui/BottomSheet: Oracle's orb says hello, and one clear button
 * into a first conversation with her; she asks age and gender before anything else. Drag, scrim tap or Escape dismisses.
 */
import { BottomSheet, Button, DeborahBlob, TextReveal } from '@web/ui';
import styles from './GreetingSheet.module.css';

export interface GreetingSheetProps {
  open: boolean;
  name: string;
  onDismiss: () => void;
  onOpenChat: () => void;
}

export function GreetingSheet({ open, name, onDismiss, onOpenChat }: GreetingSheetProps) {
  // OPEN: greeting copy is placeholder until clinical review approves it.
  // Heading → body hierarchy; warmth per docs/copy/voice-tone-ux-copy.md (no promised outcomes, AI ≠ a clinician).
  const hello = `Hi${name ? ` ${name}` : ''}, I’m Oracle.`;
  const intro = 'I’m an AI system. Tell me how you’re feeling, and we’ll look at what’s going on together, one step at a time.';
  return (
    <BottomSheet
      showClose
      open={open}
      onClose={onDismiss}
      label="The Oracle says hello"
      footer={<Button fullWidth onClick={onOpenChat}>Start a conversation</Button>}
    >
      <div className={styles.body} data-placeholder>
        <DeborahBlob size={80} label="The Oracle" />
        <div className={styles.copy}>
          <TextReveal as="h2" className={styles.hello} text={hello} delay={350} />
          <TextReveal className={styles.intro} text={intro} delay={550} />
        </div>
      </div>
    </BottomSheet>
  );
}
