/** Overview: what the system is, where its values come from, and the rules every component follows. */
import { Section, Group } from '../Section';
import styles from './sections.module.css';

const PRINCIPLES: [string, string][] = [
  ['The consulting room at dusk', 'A reading-and-listening experience first. Deborah’s words are the interface; everything around them recedes.'],
  ['One action colour', 'Plum is the only colour that means “you can do something here”. Gold marks Deborah; rose is her signature only.'],
  ['Seven to one', 'Every readable text pair reaches 7:1 on its surface. Only placeholders and decorative numerals sit below.'],
  ['Medium is the ceiling', 'Nothing heavier than 500. Hierarchy comes from size, family, colour and space; emphasis uses italic.'],
  ['Only floating things cast shadows', 'Cards, options and inputs are flat. Composer, sheets, menus and toasts float.'],
  ['Option rows, not chips', 'Choices are full-width rows at least 56 pt tall. Labels like “New” are plain text, never a capsule.'],
  ['Calm motion', 'iOS easing with no overshoot. No waves, ripples, shimmer, bounce, pulse or typing dots.'],
];

const LAYERS: [string, string][] = [
  ['src/styles/tokens.primitives.css', 'Brand ramps, spacing, radius, motion (DESIGN.md).'],
  ['apps/mobile/styles/mobile.tokens.css', 'Semantic roles, type scale × text size, layout, elevation.'],
  ['apps/mobile/styles/mobile.refresh.css', 'Soft refresh: translucent surfaces, field and button recipes.'],
  ['apps/mobile/styles/mobile.skin.deborah.css', 'Deborah skin (loaded last): plum / mauve, DM Sans, flat plum buttons.'],
];

export function Foundations() {
  return (
    <Section
      id="overview"
      title="Your Oracle Clinician"
      lede={
        <>
          The mobile design system, rendered from the app’s own code. Every swatch, size and component on this page
          is read live from the same stylesheets and components the phone app uses, so it cannot drift from what ships.
          DESIGN.md stays the authority for visual rules; this page shows the current implementation.
        </>
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
      <Group title="Where the values come from" note="Later layers override earlier ones. Components read semantic tokens only, never primitives.">
        <ol className={styles.layers}>
          {LAYERS.map(([file, what]) => (
            <li key={file} className={styles.layer}>
              <code className={styles.mono}>{file}</code>
              <span className={styles.layerWhat}>{what}</span>
            </li>
          ))}
        </ol>
      </Group>
    </Section>
  );
}
