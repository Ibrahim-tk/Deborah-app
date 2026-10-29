/** The control for one onboarding step: who-for tiles, name, year wheel, consent, FullChoicePills / FullChoicePillsGrid / QuestionChoices / ChipPicker. */
import { FullChoicePills, FullChoicePillsGrid, InlineChoicePills, NamedReasonList, QuestionChoices, decodeNamedReasons, encodeNamedReasons } from '@web/patterns/widgets';
import { DateWheel, Input, RulerSlider, YearWheel } from '@web/ui';
import { choiceLabel, list, orderedChoices, STEPS, titleFor, visibleSuggestions, type Answers, type Step } from '../steps';
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
  /** Answer and move on. Unused by taps on web — every pick waits for Next. */
  advance: (value: string, extra?: Answers) => void;
}

export function StepBody({ step, answers, set }: StepBodyProps) {
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
    case 'consent':
      // Rendered as ConsentSheet over HealthBasics — not inline in the step body.
      return null;
    case 'measure':
      return (
        <>
          <RulerSlider label="Height" value={Number(answers.heightCm ?? 165)} min={120} max={215} format={height} onChange={(v) => set('heightCm', String(v))} />
          <RulerSlider label="Weight" value={Number(answers.weightKg ?? 70)} min={35} max={200} format={weight} onChange={(v) => set('weightKg', String(v))} />
        </>
      );
    case 'profileFor':
      return <ProfileForStep value={value} onPick={(v) => set(step.key, v)} />;
    case 'choice': {
      const options = orderedChoices(step, answers).map((c) => ({ id: c.value, label: choiceLabel(step, c.value, c.label, answers) }));
      const describeValue = step.describeValue;
      const describeKey = step.describeKey;
      const expandValues = step.expandValues;
      const expandKey = step.expandKey;
      const expandStep = expandKey ? STEPS.find((s) => s.key === expandKey) : undefined;
      const expandChoices = step.expandChoices ?? expandStep?.choices;
      const expanding = Boolean(expandValues?.includes(value) && expandKey && expandChoices?.length);
      // Pronouns / gender: 2-col grid
      // (describe/Other/Someone else stays in-cell — or always spans — then morphs).
      // Other rows (incl. otherPuberty): stacked FullChoicePills + describe morph + expand follow-up.
      if (step.presentation === 'yesNo' || step.presentation === 'rows' || describeValue || expandValues) {
        const useGrid = step.key === 'gender';
        // Gender grid: "Prefer not to say" then "Other" share the last row; Other's field opens below.
        const gridOptions = useGrid && describeValue
          ? [
              ...options.filter((o) => o.id !== describeValue),
              ...options.filter((o) => o.id === describeValue).map((o) => ({ ...o, label: 'Other' })),
            ]
          : options;
        const Pills = useGrid ? FullChoicePillsGrid : FullChoicePills;
        const expandPrompt = step.expandTitle ?? (expandStep ? titleFor(expandStep, answers) : 'Please specify');
        const expandOpts = expandChoices ?? [];
        const expandSelectedId = expandKey ? answers[expandKey] : undefined;
        const expandSelectedLabel = expandOpts.find((c) => c.value === expandSelectedId)?.label;
        return (
          <div className={styles.choiceStack}>
            <Pills
              label={step.title}
              options={gridOptions}
              selected={value || undefined}
              describeValue={describeValue}
              describeLabel={step.describeLabel ?? 'Describe'}
              describePlaceholder={step.describePlaceholder ?? 'describe your situation'}
              describeText={describeKey ? (answers[describeKey] ?? '') : ''}
              describeAlwaysSpan={useGrid ? false : step.describeAlwaysSpan}
              onDescribeChange={describeKey ? (text) => set(describeKey, text) : undefined}
              onDescribeConfirm={
                describeValue
                  ? () => set(step.key, describeValue)
                  : undefined
              }
              onPick={(id) => {
                // Stay: morph that row into PillDescribeField (no advance / remount).
                if (describeValue && id === describeValue) {
                  set(step.key, describeValue);
                  return;
                }
                // Stay: reveal follow-up inline type pills (e.g. HRT type under status).
                if (expandValues?.includes(id)) {
                  set(step.key, id);
                  if (expandKey) set(expandKey, '');
                  return;
                }
                if (describeKey) set(describeKey, '');
                if (expandKey) set(expandKey, '');
                set(step.key, id);
              }}
            />
            {expanding && (
              <div className={styles.expandFollowUp}>
                <p className={styles.expandPrompt}>{expandPrompt}</p>
                <InlineChoicePills
                  label={expandPrompt}
                  options={expandOpts.map((c) => c.label)}
                  optionIds={expandOpts.map((c) => c.value)}
                  keepAnswer
                  selected={expandSelectedLabel ? [expandSelectedLabel] : undefined}
                  onPick={(_label, index) => {
                    const typeId = expandOpts[index]?.value;
                    if (typeId) set(expandKey!, typeId);
                  }}
                />
              </div>
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
              set(step.key, id);
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
            label={titleFor(step, answers)}
            entries={decodeNamedReasons(value, step.none)}
            addLabel={addLabel}
            noneSelected={value === step.none}
            namePlaceholder={step.namePlaceholder ?? 'Name'}
            reasonPlaceholder={step.reasonPlaceholder ?? 'Reason'}
            showNone={false}
            onChange={(entries) => set(step.key, encodeNamedReasons(entries))}
            onNone={() => set(step.key, step.none ?? 'None')}
          />
        );
      }
      if (step.presentation === 'ageWheel') {
        const min = step.ageMin ?? 7;
        const max = step.ageMax ?? 18;
        const age = Math.min(max, Math.max(min, Number(value) || 12));
        // Clean DateWheel-style band (lilac selection + soft fade) — not the cinematic 3D drum.
        return (
          <YearWheel
            label={step.title}
            value={age}
            min={min}
            max={max}
            formatValue={(n) => `Age ${n}`}
            onChange={(n) => set(step.key, String(n))}
          />
        );
      }
      if (step.key === 'guardianNames' || step.prompt) {
        return (
          <Input
            label={step.prompt ?? step.title}
            placeholder={step.placeholder ?? 'enter name'}
            value={value}
            autoComplete="off"
            autoCapitalize="words"
            maxLength={80}
            enterKeyHint="next"
            onChange={(e) => set(step.key, e.target.value)}
          />
        );
      }
      if (step.single && !step.none && !step.suggestions?.length) {
        return (
          <Input
            label={step.title}
            placeholder={step.placeholder ?? ''}
            value={value}
            autoComplete="off"
            autoCapitalize="sentences"
            maxLength={280}
            enterKeyHint="next"
            onChange={(e) => set(step.key, e.target.value)}
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
          onNone={() => set(step.key, step.none ?? '')}
        />
      );
  }
}
