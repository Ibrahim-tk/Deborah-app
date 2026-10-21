/** Typography: the 12 roles as the app renders them (the .t-* classes), with live computed metrics. */
import { useCallback, useState } from 'react';
import { useAppStore } from '@shared/store';
import { Segmented } from '@mobile/ui';
import { Section, Group } from '../Section';
import { useToken } from '../live';
import { TYPE_ROLES } from '../catalog';
import styles from './sections.module.css';

interface Metrics { size: string; line: string; weight: string; family: string; tracking: string }

const firstFamily = (f: string) => f.split(',')[0].replace(/["']/g, '').trim();

function TypeRow({ cls, role, use, sample }: (typeof TYPE_ROLES)[number]) {
  const [m, setM] = useState<Metrics | null>(null);
  const textSize = useAppStore((s) => s.settings.textSize);
  // Re-measure when the text size changes: the ref callback identity follows it.
  const measure = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      const cs = getComputedStyle(el);
      setM({ size: cs.fontSize, line: cs.lineHeight, weight: cs.fontWeight, family: firstFamily(cs.fontFamily), tracking: cs.letterSpacing });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textSize],
  );
  return (
    <div className={styles.typeRow}>
      <div className={styles.typeMeta}>
        <span className={styles.mono}>{role}</span>
        <span className={styles.monoMuted}>.{cls}</span>
        {m && (
          <span className={styles.monoMuted}>
            {m.family} · {m.weight} · {m.size} / {m.line}
            {m.tracking !== 'normal' && m.tracking !== '0px' ? ` · ${m.tracking}` : ''}
          </span>
        )}
        <span className={styles.swatchUse}>{use}</span>
      </div>
      <p ref={measure} className={cls}>{sample}</p>
    </div>
  );
}

const SIZES = [
  { value: '0.9', label: 'Smaller' },
  { value: '1', label: 'Default' },
  { value: '1.15', label: 'Larger' },
  { value: '1.3', label: 'Largest' },
];

export function Typography() {
  const textSize = useAppStore((s) => s.settings.textSize);
  const setTextSize = useAppStore((s) => s.setTextSize);
  const display = useToken('--font-display');
  const body = useToken('--font-body');
  return (
    <Section
      id="type"
      title="Typography"
      lede="Families and roles as computed on .phone-root today. Change text size to see the same scale Account uses in the app."
    >
      <Group title="Families">
        <div className={styles.families}>
          <div className={styles.family}>
            <span className={styles.familyDisplay}>Aa</span>
            <span className={styles.mono}>--font-display</span>
            <span className={styles.monoMuted}>{display}</span>
            <span className={styles.swatchUse}>display, title-1, title-2, sign-off, initials. Never below 26 px.</span>
          </div>
          <div className={styles.family}>
            <span className={styles.familyBody}>Aa</span>
            <span className={styles.mono}>--font-body · --font-ui</span>
            <span className={styles.monoMuted}>{body}</span>
            <span className={styles.swatchUse}>Every sentence, label and control. Weights 400 and 500 only.</span>
          </div>
        </div>
      </Group>
      <Group title="Scale" note="Live: change the text size to see every role scale, exactly as Account › Text size does in the app.">
        <div className={styles.typeControl}>
          <Segmented
            label="Text size"
            options={SIZES}
            value={String(textSize)}
            onChange={(v) => setTextSize(Number(v) as Parameters<typeof setTextSize>[0])}
          />
        </div>
        <div className={styles.typeList}>
          {TYPE_ROLES.map((r) => <TypeRow key={r.role} {...r} />)}
        </div>
      </Group>
    </Section>
  );
}
