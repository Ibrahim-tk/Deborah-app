/** Do's and don'ts (DESIGN.md › Do's and Don'ts, CLAUDE.md rule 8). */
import { Icon } from '@flow-v1/apps/mobile/ui';
import { Section } from '../Section';
import styles from './sections.module.css';

const DO = [
  'Set every screen on the canvas with ink text; keep 20 pt side margins and 32 pt between sections.',
  'Keep readable text at 7:1 or higher; check every new pair.',
  'Use option rows for every set of choices, at least 56 pt tall.',
  'Carry hierarchy with size, family (Cormorant vs DM Sans), colour and space.',
  'Show Deborah with her gold ring or glass blob wherever she speaks.',
  'Pair every colour-coded state with an icon and words.',
  'Consume third-party libraries through their ui adapter (Icon, Motion).',
];
const DONT = [
  'Use any weight above 500, or Medium outside buttons, answer titles, selected options and row titles.',
  'Use pills, tags, badges or chips for labels, statuses, filters or suggestions.',
  'Use wave, ripple, shimmer, bounce or pulse animations, audio waveforms or typing dots.',
  'Use gold as text on light surfaces (except Gold Ink) or as a button on the canvas.',
  'Put shadows on cards, options or inputs; only floating things cast shadows.',
  'Use a coloured side stripe on cards, callouts or alerts.',
  'Use gradient text, eyebrow labels above headings, or emoji as icons.',
];

export function Rules() {
  return (
    <Section id="rules" title="Do’s and don’ts" lede="The bans are part of the system. Components on this page follow them; anything that doesn’t is marked OPEN in its note.">
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
