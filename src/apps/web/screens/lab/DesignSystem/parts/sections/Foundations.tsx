/** Overview: live V2 phone tokens and the components product screens actually use. */
import { Section, Group } from '../Section';
import styles from './sections.module.css';

const PRINCIPLES: [string, string][] = [
  ['What ships is the source', 'This lab reads live CSS on .phone-root and mounts the same ui/ and patterns/ modules V2 screens import. No parallel mock kit.'],
  ['One action colour', 'Accent is the only colour that means “you can do something here”. Gold and rose stay for Oracle moments.'],
  ['Seven to one', 'Readable text pairs aim for 7:1 on their surface. Contrast is measured live on the Colour page.'],
  ['Medium is the ceiling', 'Nothing heavier than 500. Hierarchy comes from size, family, colour and space.'],
  ['Only floating things cast shadows', 'Cards, options and inputs are flat. Composer, sheets, menus and toasts float.'],
  ['Option rows, not chips', 'Choices are full-width rows. Labels like “New” are plain text, never a capsule.'],
  ['Calm motion', 'iOS easing with no overshoot. No waves, ripples, shimmer, bounce, pulse or typing dots (Composer recording wave is the documented exception).'],
];

const LAYERS: [string, string][] = [
  ['src/styles/tokens.primitives.css', 'Brand ramps, spacing, radius, motion primitives.'],
  ['apps/mobile/styles/mobile.tokens.css', 'Semantic roles, type scale, layout, elevation on .phone-root.'],
  ['apps/mobile/styles/mobile.refresh.css', 'Translucent surfaces, field and button recipes.'],
  ['apps/mobile/styles/mobile.skin.deborah.css', 'The Oracle skin (loaded last) — the values this lab shows.'],
];

export function Foundations() {
  return (
    <Section
      id="overview"
      title="Your Oracle"
      lede={
        <>
          Mobile design system for <strong>Version 2</strong> only. Swatches are computed from the phone’s live stylesheets;
          blocks mount components used in product flows — not v1, not unused lab experiments.
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
      <Group title="Where the values come from" note="Later layers override earlier ones. Components read semantic tokens; this page reads whatever .phone-root currently resolves.">
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
