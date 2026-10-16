/** The control for one onboarding step: who-for tiles, name, year wheel, consent, FullChoicePills / QuestionChoices / ChipPicker. */
import { consentDoc, intakeSuggestionData, medicinesData } from '@shared/data';
import { FullChoicePills, NamedReasonList, QuestionChoices, decodeNamedReasons, encodeNamedReasons } from '@mobile/patterns/widgets';
import { Checkbox, DateWheel, Input, RulerSlider, YearWheel } from '@mobile/ui';
import { list, STEPS, titleFor, visibleSuggestions, withDerived, type Answers, type Step } from '../steps';
import styles from '../HealthBasics.module.css';
import { ProfileForStep } from './ProfileForStep';
import { ChipPicker } from './ChipPicker';

const THIS_YEAR = new Date().getFullYear();
// Same units as Deborah's in-chat rulers (patterns/chat IntakeFields): imperial in the US.
const US = /-(US|LR|MM)$/i.test(navigator.language);
const height = (cm: number) => { const i = Math.round(cm / 2.54); return US ? `${Math.floor(i / 12)} ft ${i % 12} in` : `${cm} cm`; };
const weight = (kg: number) => (US ? `${Math.round(kg / 0.4536)} lb` : `${kg} kg`);

export interface StepBodyProps {
  step: Step;
  answers: Answers;
  set: (key: string, value: string) => void;
  /** Answer and move on (choice rows, "None", profile tiles). Extra merges other keys in the same tick (e.g. expand type). */
  advance: (value: string, extra?: Answers) => void;
}

export function StepBody({ step, answers, set, advance }: StepBodyProps) {
  const value = answers[step.key] ?? '';
  // Chips add or remove a name in the comma list, so typing and tapping mix freely.
  const picked = list(value, step.none);
  const toggle = (name: string) =>
    set(step.key, step.single ? (picked.includes(name) ? '' : name) : (picked.includes(name) ? picked.filter((n) => n !== name) : [...picked, name]).join(', '));

  switch (step.kind) {
    case 'date':
      return <DateWheel label="Date of birth" value={value} minYear={THIS_YEAR - 100} maxYear={THIS_YEAR} onChange={(d) => set(step.key, d)} />;
    case 'year':
      // Down to this year − 1: children can be added for someone else; self under 13 meets the age gate.
      return <YearWheel cinematic label="Year of birth" value={Number(value)} min={THIS_YEAR - 100} max={THIS_YEAR - 1} onChange={(y) => set(step.key, String(y))} />;
    case 'name':
      return (
        <Input label="First name" placeholder={step.placeholder ?? 'First name'} value={value} autoComplete="off" autoCapitalize="words" maxLength={40} enterKeyHint="next" onChange={(e) => set(step.key, e.target.value)} />
      );
    case 'consent': {
      // Copy by age group (child · teen · adult) from legal/consent.json; placeholder until legal review.
      const group = (withDerived(answers).ageGroup ?? 'adult') as 'child' | 'teen' | 'adult';
      const copy = consentDoc.profileConsent[group];
      const name = answers.memberName?.trim() || 'them';
      return (
        <div className={styles.consent} data-placeholder>
          <p className={styles.consentText}>{copy.body.replaceAll('{name}', name)}</p>
          <Checkbox checked={value === 'yes'} onChange={(on) => set(step.key, on ? 'yes' : '')} label={copy.check.replaceAll('{name}', name)} />
        </div>
      );
    }
    case 'measure':
      return (
        <>
          <RulerSlider label="Height" value={Number(answers.heightCm ?? 165)} min={120} max={215} format={height} onChange={(v) => set('heightCm', String(v))} />
          <RulerSlider label="Weight" value={Number(answers.weightKg ?? 70)} min={35} max={200} format={weight} onChange={(v) => set('weightKg', String(v))} />
        </>
      );
    case 'profileFor':
      return <ProfileForStep value={value} onPick={advance} />;
    case 'choice': {
      const options = (step.choices ?? []).map((c) => ({ id: c.value, label: c.label }));
      const describeValue = step.describeValue;
      const describeKey = step.describeKey;
      const expandValues = step.expandValues;
      const expandKey = step.expandKey;
      const expandStep = expandKey ? STEPS.find((s) => s.key === expandKey) : undefined;
      const expandChoices = step.expandChoices ?? expandStep?.choices;
      const expanding = Boolean(expandValues?.includes(value) && expandKey && expandChoices?.length);
      // Full-width options (sex/gender) + describe morph + expand follow-up (HRT type under status).
      if (step.presentation === 'yesNo' || step.presentation === 'rows' || describeValue || expandValues) {
        return (
          <div className={styles.choiceStack}>
            <FullChoicePills
              label={step.title}
              options={options}
              selected={value || undefined}
              describeValue={describeValue}
              describeLabel={step.describeLabel ?? 'Describe'}
              describePlaceholder={step.describePlaceholder ?? 'describe your situation'}
              describeText={describeKey ? (answers[describeKey] ?? '') : ''}
              onDescribeChange={describeKey ? (text) => set(describeKey, text) : undefined}
              onDescribeConfirm={
                describeValue
                  ? () => advance(describeValue)
                  : undefined
              }
              onPick={(id) => {
                // Stay: morph that row into PillDescribeField (no advance / remount).
                if (describeValue && id === describeValue) {
                  set(step.key, describeValue);
                  return;
                }
                // Stay: reveal follow-up FullChoicePills (e.g. HRT type) under status.
                if (expandValues?.includes(id)) {
                  set(step.key, id);
                  if (expandKey) set(expandKey, '');
                  return;
                }
                if (describeKey) set(describeKey, '');
                if (expandKey) set(expandKey, '');
                advance(id);
              }}
            />
            {expanding && (
              <FullChoicePills
                label={step.expandTitle ?? (expandStep ? titleFor(expandStep, answers) : 'Type')}
                options={expandChoices!.map((c) => ({ id: c.value, label: c.label }))}
                selected={answers[expandKey!] || undefined}
                onPick={(typeId) => advance(value, { [expandKey!]: typeId })}
              />
            )}
          </div>
        );
      }
      // Wrapping regular ChoicePills via QuestionChoices; chat uses InlineChoicePills.
      return (
        <div className={styles.choiceWidget}>
          <QuestionChoices
            key={step.key}
            label={step.title}
            options={options}
            pills="regular"
            onSubmit={(ids) => {
              const id = ids[0];
              if (!id) return;
              advance(id);
            }}
          />
        </div>
      );
    }
    case 'text':
      if (step.presentation === 'namedReasons') {
        const addLabel =
          step.key === 'medications' || step.key === 'childMedications'
            ? 'Add medicine'
            : step.key === 'supplements'
              ? 'Add supplement'
              : 'Add';
        return (
          <NamedReasonList
            key={step.key}
            label={step.title}
            entries={decodeNamedReasons(value, step.none)}
            addLabel={addLabel}
            noneSelected={value === step.none}
            namePlaceholder={step.namePlaceholder ?? 'Name'}
            reasonPlaceholder={step.reasonPlaceholder ?? 'Reason'}
            nameSuggestions={
              step.key === 'medications' || step.key === 'childMedications'
                ? medicinesData
                : step.key === 'supplements'
                  ? intakeSuggestionData.supplements
                  : undefined
            }
            onChange={(entries) => set(step.key, encodeNamedReasons(entries))}
            onNone={() => advance(step.none ?? 'None')}
          />
        );
      }
      return (
        <ChipPicker
          key={step.key}
          label={step.title}
          picked={picked}
          suggestions={visibleSuggestions(step, answers)}
          none={step.single ? undefined : step.none ?? 'None'}
          noneSelected={value === step.none}
          onToggle={toggle}
          onAdd={(name) => set(step.key, step.single ? name : [...picked, name].join(', '))}
          onNone={() => advance(step.none ?? '')}
        />
      );
  }
}
