/** The control for one health-basics step: year wheel, rulers, option rows, chips (+ Other), or the profile tiles. */
import { RulerSlider, YearWheel } from '@mobile/ui';
import { list, visibleSuggestions, type Answers, type Step } from '../steps';
import { ProfileForStep } from './ProfileForStep';
import { ChipPicker } from './ChipPicker';
import { ChoiceTiles } from './ChoiceTiles';

const THIS_YEAR = new Date().getFullYear();
// Same units as Deborah's in-chat rulers (patterns/chat IntakeFields): imperial in the US.
const US = /-(US|LR|MM)$/i.test(navigator.language);
const height = (cm: number) => { const i = Math.round(cm / 2.54); return US ? `${Math.floor(i / 12)} ft ${i % 12} in` : `${cm} cm`; };
const weight = (kg: number) => (US ? `${Math.round(kg / 0.4536)} lb` : `${kg} kg`);

export interface StepBodyProps {
  step: Step;
  answers: Answers;
  set: (key: string, value: string) => void;
  /** Answer and move on (choice rows, "None", profile tiles). */
  advance: (value: string) => void;
}

export function StepBody({ step, answers, set, advance }: StepBodyProps) {
  const value = answers[step.key] ?? '';
  // Chips add or remove a name in the comma list, so typing and tapping mix freely.
  const picked = list(value, step.none);
  const toggle = (name: string) => set(step.key, (picked.includes(name) ? picked.filter((n) => n !== name) : [...picked, name]).join(', '));

  switch (step.kind) {
    case 'year':
      return <YearWheel cinematic label="Year of birth" value={Number(value)} min={THIS_YEAR - 100} max={THIS_YEAR - 13} onChange={(y) => set(step.key, String(y))} />;
    case 'measure':
      return (
        <>
          <RulerSlider label="Height" value={Number(answers.heightCm ?? 165)} min={120} max={215} format={height} onChange={(v) => set('heightCm', String(v))} />
          <RulerSlider label="Weight" value={Number(answers.weightKg ?? 70)} min={35} max={200} format={weight} onChange={(v) => set('weightKg', String(v))} />
        </>
      );
    case 'profileFor':
      return <ProfileForStep value={value} onPick={advance} />;
    case 'choice':
      return <ChoiceTiles label={step.title} choices={step.choices!} value={value} onPick={advance} />;
    case 'text':
      return (
        <ChipPicker
          key={step.key}
          label={step.title}
          picked={picked}
          suggestions={visibleSuggestions(step, answers)}
          none={step.none ?? 'None'}
          noneSelected={value === step.none}
          onToggle={toggle}
          onAdd={(name) => set(step.key, [...picked, name].join(', '))}
          onNone={() => advance(step.none ?? '')}
        />
      );
  }
}
