/** Colour: semantic roles first (what V2 uses), then ramps. Values from live .phone-root. */
import type { CSSProperties } from 'react';
import { Section, Group } from '../Section';
import { useTokenReader, contrast } from '../live';
import { COLOR_GROUPS, RAMPS, SEMANTIC } from '../catalog';
import styles from './sections.module.css';

const fill = (value: string) => ({ '--sw': value }) as CSSProperties;

function ratioText(r: number | null) {
  if (r === null) return '';
  return `${r.toFixed(1)}:1${r < 7 ? ' · below 7:1' : ''}`;
}

export function Colors() {
  const read = useTokenReader();
  const canvas = read('--color-canvas');
  return (
    <Section id="color" title="Colour" lede="Colours as computed on .phone-root today (mobile tokens + the Oracle skin). Product CSS uses semantic roles; ramps are the primitives underneath.">
      {COLOR_GROUPS.map((g) => (
        <Group key={g.title} title={g.title} note={g.note}>
          <div className={styles.swatches}>
            {g.tokens.map((t) => {
              const v = read(t.name);
              return (
                <div key={t.name} className={styles.swatch}>
                  {g.text ? (
                    <span className={styles.swatchText} style={fill(v)}>Aa</span>
                  ) : (
                    <span className={styles.swatchFill} style={fill(v)} />
                  )}
                  <span className={styles.mono}>{t.name}</span>
                  <span className={styles.monoMuted}>{v}</span>
                  <span className={styles.swatchUse}>{t.use}</span>
                  {g.text && <span className={styles.swatchUse}>{ratioText(contrast(v, canvas))} on canvas</span>}
                </div>
              );
            })}
          </div>
        </Group>
      ))}

      <Group title="Semantic states" note="Danger · Success · Warning — ink on tint, measured live.">
        <div className={styles.swatches}>
          {SEMANTIC.map((s) => {
            const ink = read(s.ink);
            const tint = read(s.tint);
            return (
              <div key={s.role} className={styles.swatch}>
                <span className={styles.semantic} style={{ '--ink': ink, '--tint': tint } as CSSProperties}>{s.role}</span>
                <span className={styles.mono}>{s.ink}</span>
                <span className={styles.mono}>{s.tint}</span>
                <span className={styles.swatchUse}>{ratioText(contrast(ink, tint))} ink on tint</span>
              </div>
            );
          })}
        </div>
      </Group>

      <Group title="Primitive ramps" note="Under the semantics. Skin may remap steps; chips show the resolved value.">
        <div className={styles.ramps}>
          {RAMPS.map((ramp) => (
            <div key={ramp.name} className={styles.ramp}>
              <span className={styles.rampName}>{ramp.name}</span>
              <div className={styles.rampSteps}>
                {ramp.tokens.map((t) => (
                  <div key={t} className={styles.step}>
                    <span className={styles.stepChip} style={fill(read(t))} />
                    <span className={styles.mono}>{t.replace(/^--[a-z]+-/, '')}</span>
                    <span className={styles.monoMuted}>{read(t)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Group>
    </Section>
  );
}
