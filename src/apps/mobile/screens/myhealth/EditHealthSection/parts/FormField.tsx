/**
 * One health-profile question as a plain form field (design 2026-10-20): choices are dropdowns, a date is a
 * read-only field with an edit icon that opens the date wheel in a bottom sheet, numbers are inputs.
 * Lists (medicines, supplements) and free text fall back to the onboarding control.
 */
import { useState } from 'react';
import { BottomSheet, Button, DateWheel, Icon, Input, Select, YearWheel } from '@mobile/ui';
import { StepBody } from '@mobile/screens/onboarding/HealthBasics/parts/StepBody';
import { STEPS, type Answers, type Step } from '@mobile/screens/onboarding/HealthBasics/steps';
import styles from './FormField.module.css';

const THIS_YEAR = new Date().getFullYear();

export interface FormFieldProps {
  step: Step;
  label: string;
  /** Formatted value (e.g. "4 March 1978"). */
  shown?: string;
  answers: Answers;
  set: (key: string, value: string) => void;
}

export function FormField({ step, label, shown, answers, set }: FormFieldProps) {
  const [open, setOpen] = useState(false);
  const value = answers[step.key] ?? '';

  if (step.kind === 'date' || step.kind === 'year') {
    return (
      <>
        <button type="button" className={styles.picker} onClick={() => setOpen(true)} aria-label={`${label}: ${shown ?? 'not added'}. Edit`}>
          <span className={styles.pickerLabel}>{label}</span>
          <span className={styles.pickerValue} data-empty={!shown || undefined}>
            {shown ?? 'Add'}
            <Icon name="edit" size={18} className={styles.pickerIcon} />
          </span>
        </button>
        <BottomSheet open={open} onClose={() => setOpen(false)} showClose title={label} footer={<Button fullWidth onClick={() => setOpen(false)}>Done</Button>}>
          {step.kind === 'date'
            ? <DateWheel label={label} value={value} minYear={THIS_YEAR - 100} maxYear={THIS_YEAR} onChange={(d) => set(step.key, d)} />
            : <YearWheel label={label} value={Number(value) || THIS_YEAR - 40} min={THIS_YEAR - 100} max={THIS_YEAR - 1} onChange={(y) => set(step.key, String(y))} />}
        </BottomSheet>
      </>
    );
  }

  if (step.kind === 'name') return <Input label={label} value={value} autoCapitalize="words" onChange={(e) => set(step.key, e.target.value)} />;

  if (step.kind === 'measure') {
    return (
      <div className={styles.pair}>
        <Input label="Height (cm)" type="number" inputMode="numeric" value={answers.heightCm ?? ''} onChange={(e) => set('heightCm', e.target.value)} />
        <Input label="Weight (kg)" type="number" inputMode="numeric" value={answers.weightKg ?? ''} onChange={(e) => set('weightKg', e.target.value)} />
      </div>
    );
  }

  if (step.kind === 'choice' && step.choices?.length) {
    const expandKey = step.expandKey;
    const expandChoices = step.expandChoices ?? (expandKey ? STEPS.find((s) => s.key === expandKey)?.choices : undefined);
    const expanding = Boolean(expandKey && expandChoices?.length && step.expandValues?.includes(value));
    const describing = Boolean(step.describeKey && step.describeValue === value);
    return (
      <div className={styles.group}>
        <Select
          label={label}
          options={step.choices.map((c) => ({ value: c.value, label: c.label }))}
          value={value || undefined}
          onChange={(v) => {
            set(step.key, v);
            if (expandKey && !step.expandValues?.includes(v)) set(expandKey, '');
          }}
        />
        {describing && step.describeKey && (
          <Input label="Please specify" placeholder={step.describePlaceholder} value={answers[step.describeKey] ?? ''} onChange={(e) => set(step.describeKey!, e.target.value)} />
        )}
        {expanding && expandKey && (
          <Select
            label={step.expandTitle ?? 'Which type?'}
            options={(expandChoices ?? []).map((c) => ({ value: c.value, label: c.label }))}
            value={answers[expandKey] || undefined}
            onChange={(v) => set(expandKey, v)}
          />
        )}
      </div>
    );
  }

  // Age questions (e.g. "Age puberty started"): a dropdown in the form; the wheel stays in the intake only.
  if (step.presentation === 'ageWheel') {
    const min = step.ageMin ?? 7;
    const max = step.ageMax ?? 18;
    const options = Array.from({ length: max - min + 1 }, (_, i) => String(min + i)).map((n) => ({ value: n, label: n }));
    return <Select label={label} options={options} value={value || undefined} placeholder="Choose an age" onChange={(v) => set(step.key, v)} />;
  }

  // Lists and free text keep the onboarding control (add tiles, text box).
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      <StepBody step={step} answers={answers} set={set} advance={(v, extra) => { set(step.key, v); Object.entries(extra ?? {}).forEach(([k, x]) => set(k, x ?? "")); }} />
    </div>
  );
}
