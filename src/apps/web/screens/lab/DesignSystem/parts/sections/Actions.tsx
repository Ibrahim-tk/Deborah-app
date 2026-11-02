/** Buttons — the essential variants, each in its own labelled cell. */
import type { ReactNode } from 'react';
import { Button, IconButton } from '@web/ui';
import { Section } from '../Section';
import styles from './sections.module.css';

function Cell({ label, children }: { label: string; use?: string; children: ReactNode }) {
  return (
    <figure className={styles.buttonCell}>
      <div className={styles.buttonStage}>{children}</div>
      <figcaption className={styles.buttonMeta}>
        <span className={styles.buttonLabel}>{label}</span>
      </figcaption>
    </figure>
  );
}

export function Actions() {
  return (
    <Section id="buttons" title="Buttons" lede="Fully rounded, one primary per view.">
      <div className={styles.buttonBoard}>
        <Cell label="Primary" use="The main action on a screen"><Button>Continue</Button></Cell>
        <Cell label="Secondary" use="A quieter alternative"><Button variant="secondary">Not now</Button></Cell>
        <Cell label="Outline" use="Edit or review"><Button variant="outline">Edit answers</Button></Cell>
        <Cell label="Text" use="Low-emphasis links"><Button variant="ghost">Skip</Button></Cell>
        <Cell label="Emergency" use="Emergency card only"><Button variant="emergency" leadingIcon="phone">Call 911</Button></Cell>
        <Cell label="Icon" use="Icon-only, always labelled"><IconButton icon="send" label="Send" tone="accent" /></Cell>
      </div>
    </Section>
  );
}
