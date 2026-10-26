/**
 * First-visit greeting on the shared ui/BottomSheet: Deborah's orb says hello, and one clear button
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
  // OPEN: greeting copy is placeholder until Deborah approves it.
  // Heading → body hierarchy; warmth per docs/copy/voice-tone-ux-copy.md (no promised outcomes, AI ≠ Deborah).
  const hello = `Hi${name ? ` ${name}` : ''}, I’m the Oracle.`;
  const intro = 'Tell me how you’re feeling, and we’ll look at what’s going on together, one step at a time. My guidance draws on Deborah Maragopoulos’ experience.';
  return (
    <BottomSheet
      showClose
      open={open}
      onClose={onDismiss}
      label="Deborah says hello"
      footer={<Button fullWidth onClick={onOpenChat}>Start your first conversation</Button>}
    >
      <div className={styles.body} data-placeholder>
        <DeborahBlob size={80} label="Deborah" />
        <div className={styles.copy}>
          <TextReveal as="h2" className={styles.hello} text={hello} delay={350} />
          <TextReveal className={styles.intro} text={intro} delay={550} />
        </div>
      </div>
    </BottomSheet>
  );
}
