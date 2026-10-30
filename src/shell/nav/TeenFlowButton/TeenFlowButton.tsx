/** @shell TeenFlowButton — quick entry to the teen invite flow (story 1.5): parent side (S27) or teen side (S28). */
import { useScenario } from '../../useScenario';
import { Popover } from '../Popover';
import styles from './TeenFlowButton.module.css';

const OPTIONS = [
  { id: 'S27', label: 'Parent — invite your teen', text: 'Family plan › Family profiles › Invite your teen to their own account.' },
  { id: 'S28', label: 'Teen — after Finish Sign Up', text: 'Skips the Email tab: name › age › password with the email locked › teen basics › chat.' },
];

export function TeenFlowButton() {
  const { select } = useScenario();
  return (
    <Popover trigger="Teen invite" label="Teen invite flow" width="sm">
      {(close) => (
        <div className={styles.body}>
          <p className={styles.title}>Teen invite flow</p>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={styles.option}
              onClick={() => {
                select(o.id);
                close();
              }}
            >
              <span className={styles.label}>{o.label}</span>
              <span className={styles.text}>{o.text}</span>
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
