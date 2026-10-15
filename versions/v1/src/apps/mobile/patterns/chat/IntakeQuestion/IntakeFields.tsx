/**
 * Field mode of IntakeQuestion: year of birth on a wheel, height and weight on rulers (one question
 * each), or the older date / height+weight fields. An outlined Select button commits the value (no
 * auto-commit on settle — a stray scroll could pick the wrong value). Units follow the device locale; values are metric.
 */
import { useState } from 'react';
import { Button, DateWheel, RulerSlider, YearWheel } from '@flow-v1/apps/mobile/ui';
import styles from './IntakeQuestion.module.css';

type Input = 'date' | 'measure' | 'year' | 'height' | 'weight';

export interface IntakeFieldsProps {
  input: Input;
  /** values + the label for her bubble, in her units. */
  onAnswer: (values: string[], label?: string) => void;
}

const imperial = () => /-(US|LR|MM)$/i.test(typeof navigator === 'undefined' ? 'en-US' : navigator.language);
const ftIn = (cm: number) => {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)} ft ${inches % 12} in`;
};

export function IntakeFields({ input, onAnswer }: IntakeFieldsProps) {
  const thisYear = new Date().getFullYear();
  const us = imperial();
  const [year, setYear] = useState(thisYear - 35);
  const [dob, setDob] = useState(`${thisYear - 45}-06-15`);
  const [cm, setCm] = useState(165);
  const [kg, setKg] = useState(70);

  const height = (v: number) => (us ? ftIn(v) : `${v} cm`);
  const weight = (v: number) => (us ? `${Math.round(v / 0.4536)} lb` : `${v} kg`);

  const select = () => {
    if (input === 'year') onAnswer([String(year)], String(year));
    else if (input === 'height') onAnswer([String(cm)], height(cm));
    else if (input === 'weight') onAnswer([String(kg)], weight(kg));
    else if (input === 'date') onAnswer([dob]);
    else onAnswer([height(cm), weight(kg)]);
  };

  return (
    <div className={styles.fieldWrap}>
      {input === 'year' && <YearWheel label="Year you were born" value={year} min={thisYear - 100} max={thisYear - 13} onChange={setYear} />}
      {input === 'date' && <DateWheel label="Date of birth" value={dob} minYear={thisYear - 100} maxYear={thisYear - 13} onChange={setDob} />}
      {(input === 'height' || input === 'measure') && <RulerSlider label="Height" value={cm} min={120} max={215} format={height} onChange={setCm} />}
      {(input === 'weight' || input === 'measure') && <RulerSlider label="Weight" value={kg} min={35} max={200} format={weight} onChange={setKg} />}
      <Button variant="outline" size="md" className={styles.select} onClick={select}>Select</Button>
    </div>
  );
}
