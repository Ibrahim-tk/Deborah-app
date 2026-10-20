/**
 * Health profile as readable rows (My Health · M-7.2): every basic and clinical step that applies to this
 * profile, with a short label and the answer in words. Editing one row reuses the step's own control (M-7.7).
 */
import { decodeNamedReasons } from '@mobile/patterns/widgets';
import { list, profileVisibleSteps, visibleSteps, type Answers, type Step } from './steps';

const LABELS: Record<string, string> = {
  birthDate: 'Date of birth',
  sex: 'Sex at birth',
  gender: 'Gender identity',
  pronouns: 'Pronouns',
  reproductive: 'Hormonal stage',
  reproductiveTeen: 'Hormonal stage',
  periodsStarted: 'Periods started',
  pubertyBlockers: 'Puberty blockers',
  ageAtLastPeriod: 'Age at last period',
  hysterectomy: 'Hysterectomy',
  ovariesRemoved: 'Ovaries removed',
  hrtStatus: 'Hormone therapy',
  hrtType: 'Type of hormone therapy',
  otherPuberty: 'Puberty',
  pubertyStart: 'Puberty started',
  pubertyNotes: 'Puberty notes',
  pubertyAge: 'Age puberty started',
  fertilityConcerns: 'Fertility concerns',
  medications: 'Medications',
  childMedications: 'Medications',
  supplements: 'Supplements',
  allergies: 'Allergies',
  genesisGold: 'Genesis Gold®',
  guardianNames: 'Guardians',
};

/** Onboarding steps that are about setup, not health details. */
const SETUP = new Set(['profileFor', 'relationship', 'memberName', 'consent']);

export interface DetailRow {
  key: string;
  label: string;
  value?: string;
  step: Step;
}

function words(step: Step, a: Answers): string | undefined {
  const raw = a[step.key]?.trim();
  if (!raw) return undefined;
  if (step.kind === 'date') {
    const d = new Date(`${raw}T12:00:00`);
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (step.presentation === 'namedReasons') {
    const items = decodeNamedReasons(raw, step.none);
    return items.length ? items.map((x) => (x.reason ? `${x.name} (${x.reason})` : x.name)).join(', ') : step.none ?? 'None';
  }
  const choice = step.choices?.find((c) => c.value === raw);
  if (choice) {
    const describe = step.describeKey ? a[step.describeKey]?.trim() : undefined;
    return describe && ['other', 'describe'].includes(raw) ? describe : choice.label;
  }
  if (step.kind === 'text' && !step.presentation) return list(raw, step.none).join(', ') || step.none || raw;
  return raw;
}

export function healthDetailRows(a: Answers): DetailRow[] {
  const basics = visibleSteps(a).filter((s) => !SETUP.has(s.key));
  const clinical = profileVisibleSteps(a);
  return [...basics, ...clinical].map((step) => ({ key: step.key, label: LABELS[step.key] ?? step.title, value: words(step, a), step }));
}

/** The step to edit for a key, given the current answers (keys can repeat across age/sex branches). */
export function stepFor(key: string, a: Answers): Step | undefined {
  return [...visibleSteps(a), ...profileVisibleSteps(a)].find((s) => s.key === key);
}
