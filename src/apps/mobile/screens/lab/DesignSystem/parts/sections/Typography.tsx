/** Typography: each role as a pangram, with its live size · weight · tracking underneath. */
import { useCallback, useState } from 'react';
import { Section } from '../Section';
import { TYPE_ROLES } from '../catalog';
import styles from './sections.module.css';

const SAMPLE = 'The quick brown fox jumps over the lazy dog';
const title = (role: string) => role.replace(/-(\d)/, ' $1').replace(/^./, (c) => c.toUpperCase());

function TypeRow({ cls, role }: (typeof TYPE_ROLES)[number]) {
  const [meta, setMeta] = useState('');
  const measure = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const cs = getComputedStyle(el);
    const tracking = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    setMeta(`size ${cs.fontSize} · weight ${cs.fontWeight} · tracking ${tracking}`);
  }, []);
  return (
    <div className={styles.typeRow}>
      <p ref={measure} className={cls}>{SAMPLE}</p>
      <p className={styles.typeMeta}><strong>{title(role)}</strong> · {meta}</p>
    </div>
  );
}

export function Typography() {
  return (
    <Section id="type" title="Typography" lede="Each role applies size, weight and tracking together.">
      <div className={styles.typeList}>
        {TYPE_ROLES.map((r) => <TypeRow key={r.role} {...r} />)}
      </div>
    </Section>
  );
}
