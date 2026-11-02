/** Overview: live V2 phone tokens and the components product screens actually use. */
import { Section, Group } from '../Section';
import styles from './sections.module.css';

const PRINCIPLES: [string, string][] = [
  ['What ships is the source', 'This lab reads live CSS on .phone-root and mounts the same ui/ and patterns/ modules V2 screens import. No parallel mock kit.'],
  ['One action colour', 'Plum is the only colour that means “you can do something here”. Gold stays for Oracle moments.'],
  ['Seven to one', 'Readable text pairs aim for 7:1 on their surface. Contrast is measured live on the Colour page.'],
  ['Medium is the ceiling', 'Nothing heavier than 500. Hierarchy comes from size, family, colour and space.'],
  ['Colour fields, then glass', 'Cards separate by tonal fill. Tappable surfaces are frosted glass. Only composer, sheets, menus and toasts cast real shadows.'],
  ['Rows and pills for choices', 'Choices are option rows or choice pills. Labels like “New” are plain text, never a capsule.'],
  ['Calm motion', 'iOS easing with no overshoot. No waves, ripples, shimmer, bounce, pulse or typing dots (Composer recording wave is the documented exception).'],
];

export function Foundations() {
  return (
    <Section
      id="overview"
      title="Your Oracle"
      lede={
        <>The colours, type and components that make up the Your Oracle app.</>
      }
    >
      <Group title="Principles">
        <ol className={styles.principles}>
          {PRINCIPLES.map(([title, body], i) => (
            <li key={title} className={styles.principle}>
              <span className={styles.principleNum}>{i + 1}</span>
              <span className={styles.principleTitle}>{title}</span>
              <span className={styles.principleBody}>{body}</span>
            </li>
          ))}
        </ol>
      </Group>
    </Section>
  );
}
