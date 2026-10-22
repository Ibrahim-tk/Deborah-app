/** Do's and don'ts enforced by V2 components and CSS Modules. */
import { Icon } from '@web/ui';
import { Section } from '../Section';
import styles from './sections.module.css';

const DO = [
  'Read colours and type from live semantic tokens on .phone-root — never invent hex in a screen.',
  'Keep readable text at 7:1 or higher; check new pairs on the Colour page.',
  'Use option rows for choices, at least the row minimum height.',
  'Carry hierarchy with size, family, colour and space — not weight above 500.',
  'Show Deborah with her gold ring or glass blob wherever she speaks.',
  'Pair colour-coded states with an icon and words.',
  'Consume third-party libraries through the ui adapter (Icon, Motion).',
];
const DONT = [
  'Use any weight above 500, or Medium outside buttons, answer titles, selected options and row titles.',
  'Use pills, tags, badges or chips for labels, statuses, filters or suggestions.',
  'Use wave, ripple, shimmer, bounce or pulse animations, or typing dots (Composer recording wave is the one exception).',
  'Use gold as a primary button fill on the canvas.',
  'Put shadows on cards, options or inputs; only floating chrome casts shadows.',
  'Use a coloured side stripe on cards, callouts or alerts.',
  'Ship v1-only or unused components in this catalog.',
];

export function Rules() {
  return (
    <Section id="rules" title="Do’s and don’ts" lede="Bans mirrored by V2 ui/ and patterns/. Specimens on this page follow them.">
      <div className={styles.rules}>
        <div className={styles.ruleCol}>
          <h3 className={styles.ruleHead}><Icon name="success" size={22} /> Do</h3>
          <ul className={styles.ruleList}>{DO.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <div className={styles.ruleCol}>
          <h3 className={styles.ruleHead} data-tone="danger"><Icon name="close" size={22} /> Don’t</h3>
          <ul className={styles.ruleList}>{DONT.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}
