/**
 * Intake rules (docs/07-ai-simulation.md §2): at most 3 questions, one at a time, from the
 * script's list, skipping fields already known in the profile.
 */
import { intakeData } from '../data';
import type { IntakeQuestion } from '../types/content';
import type { Intake, Profile } from '../types/domain';

export function question(id: string): IntakeQuestion | undefined {
  return intakeData.questions.find((q) => q.id === id);
}

function isKnown(profile: Profile, q: IntakeQuestion): boolean {
  const field = q.profileField.replace(/^intake\./, '') as keyof Intake;
  const value = profile.intake[field];
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

/** Questions to ask in a new consultation. */
export function planIntake(scriptIntake: string[], profile: Profile): string[] {
  return scriptIntake
    .map(question)
    .filter((q): q is IntakeQuestion => Boolean(q) && !(q!.skipIfKnown && isKnown(profile, q!)))
    .slice(0, intakeData.maxQuestions)
    .map((q) => q.id);
}

/** Profile patch for an answered question. */
export function intakePatch(q: IntakeQuestion, optionIds: string[]): Partial<Intake> {
  const field = q.profileField.replace(/^intake\./, '');
  return { [field]: q.multi ? optionIds : optionIds[0] } as Partial<Intake>;
}

export function optionLabels(q: IntakeQuestion, optionIds: string[], otherText?: string): string {
  // The "other" option echoes what the user typed; the scripted reply stays the same.
  return optionIds
    .map((id) => (id === 'other' && otherText?.trim() ? otherText.trim() : q.options.find((o) => o.id === id)?.label ?? id))
    .join(', ');
}

/** Human label for the profile's age band, for interpolation ("46–50"). */
export function ageLabel(profile: Profile): string | undefined {
  const band = profile.intake.ageBand;
  return question('age')?.options.find((o) => o.id === band)?.label;
}
