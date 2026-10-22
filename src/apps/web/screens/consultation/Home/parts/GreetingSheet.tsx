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
  const hello = `Hi${name ? ` ${name}` : ''}, I’m the Oracle, an AI that speaks in Deborah’s voice. Ask me anything about how you’re feeling, and we’ll take it from there together.`;
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
        <TextReveal className={styles.hello} text={hello} delay={350} />
      </div>
    </BottomSheet>
  );
}
