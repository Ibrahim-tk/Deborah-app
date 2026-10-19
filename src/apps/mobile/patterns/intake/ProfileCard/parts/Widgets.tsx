/** Inline widgets for single-value rows: year wheel, sex at birth, height / weight rulers. */
import { useState } from 'react';
import type { SexAtBirth } from '@shared/types/health';
import { Button, ChoiceGroup, RulerSlider, Segmented, YearWheel } from '@mobile/ui';
import { formatHeight, formatWeight, type Units } from '../units';
import styles from '../ProfileCard.module.css';

export function AgeWidget({ initial, thisYear, onSet }: { initial: number; thisYear: number; onSet: (y: number) => void }) {
  const [year, setYear] = useState(initial);
  return (
    <div className={styles.widget}>
      <YearWheel label="Year you were born" value={year} min={thisYear - 100} max={thisYear - 13} onChange={setYear} />
      <Button size="md" onClick={() => onSet(year)}>Born in {year}</Button>
    </div>
  );
}

export const SEX_CHOICES: { value: SexAtBirth; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'intersex', label: 'Intersex' },
];

export function SexWidget({ value, onSet }: { value?: SexAtBirth; onSet: (s: SexAtBirth) => void }) {
  return <ChoiceGroup label="Sex at birth" fill choices={SEX_CHOICES} value={value} onChange={onSet} />;
}

export function MeasureWidget({ kind, initial, units, onUnits, onSet }: { kind: 'height' | 'weight'; initial: number; units: Units; onUnits: (u: Units) => void; onSet: (v: number) => void }) {
  const [v, setV] = useState(initial);
  const height = kind === 'height';
  return (
    <div className={styles.widget}>
      <Segmented
        label="Units"
        value={units}
        onChange={onUnits}
        options={height ? [{ value: 'metric', label: 'cm' }, { value: 'imperial', label: 'ft / in' }] : [{ value: 'metric', label: 'kg' }, { value: 'imperial', label: 'lb' }]}
      />
      <RulerSlider
        label={height ? 'Height' : 'Weight'}
        value={v}
        min={height ? 120 : 35}
        max={height ? 215 : 200}
        onChange={setV}
        format={(x) => (height ? formatHeight(x, units) : formatWeight(x, units))}
      />
      <Button size="md" onClick={() => onSet(v)}>Use {height ? formatHeight(v, units) : formatWeight(v, units)}</Button>
    </div>
  );
}
