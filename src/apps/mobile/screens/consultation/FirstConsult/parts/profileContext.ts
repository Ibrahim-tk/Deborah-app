/**
 * What Deborah already knows when the first consultation opens (docs/ux/F02c): the sign-up health basics,
 * read from the held answers (before consent) or the saved profile (after). Gives the script its
 * `{tokens}`, the variables that let nodes with `skipIfKnown` stay silent, and the plain-text known line.
 * Falls back to the script's sample person (Linda) when nothing was answered, e.g. a scenario jump.
 */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { peekHealthBasics } from '@mobile/hooks/healthBasics';
import type { FlowValue } from '@shared/engine';
import type { HealthBasicsAnswers } from '@mobile/hooks/healthBasics';

const STAGE: Record<string, string> = {
  cycling: 'still having regular cycles',
  perimenopausal: 'in perimenopause',
  postmenopausal: 'past menopause',
  pregnant: 'pregnant or breastfeeding',
};
const STAGE_SHORT: Record<string, string> = { cycling: 'Regular cycles', perimenopausal: 'Perimenopause', postmenopausal: 'Postmenopause', pregnant: 'Pregnant or breastfeeding' };

/** The script's sample person, used when no health basics exist. */
const SAMPLE: HealthBasicsAnswers = { birthYear: '1964', sex: 'female', reproductive: 'postmenopausal', medications: 'Levothyroxine', supplements: 'Magnesium' };

const list = (v?: string) => (v ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const joinAnd = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

export interface ProfileContext {
  tokens: Record<string, string>;
  vars: Record<string, FlowValue>;
  known: string[];
}

export function useProfileContext(): ProfileContext {
  const profile = useAppStore(selectActiveProfile);
  const h = profile?.health;
  const held = peekHealthBasics() ?? (h ? undefined : SAMPLE);
  const year = held?.birthYear ? Number(held.birthYear) : h?.birthYear?.value;
  const age = year ? nowFrom(useAppStore.getState()).getFullYear() - year : undefined;
  const stage = held?.reproductive ?? profile?.intake.reproductive;
  const meds = held ? list(held.medications) : (h?.medications?.value ?? []).map((m) => m.name);
  const supplements = held ? list(held.supplements) : list(h?.careContext?.value?.supplements);
  const conditions = held ? list(held.conditions) : (h?.conditions?.value ?? []).map((c) => c.name);

  const facts = [
    age && `you're ${age}`,
    stage && STAGE[stage] && `you're ${STAGE[stage]}`,
    meds.length ? `you take ${joinAnd(meds)}` : 'you aren’t on any medication',
    supplements.length && `you use ${joinAnd(supplements.map((x) => x.toLowerCase()))}`,
    conditions.length && `you live with ${joinAnd(conditions)}`,
  ].filter(Boolean) as string[];

  const firstMed = meds[0] ?? supplements[0];
  return {
    tokens: {
      // Fallbacks for answers she skipped; her own words replace them once tapped.
      symptoms: 'these symptoms',
      impact: 'a few',
      duration: 'a while',
      slot: 'Your time',
      age: age ? String(age) : 'your age',
      knownFacts: `I know ${joinAnd(facts)}.`,
      stage: stage && STAGE[stage] ? STAGE[stage] : 'where you are hormonally',
      stageShort: stage && STAGE_SHORT[stage] ? STAGE_SHORT[stage] : 'Your hormones',
      // Her voice (suggested replies, visit prep) and Deborah's voice need different fallbacks.
      medMine: firstMed ?? 'my other supplements',
      medYours: firstMed ?? 'anything you already take',
      medClause: firstMed ? `, and I'm keeping ${firstMed} in mind` : '',
      medShort: firstMed ?? 'Your daily routine',
      medNote: firstMed
        ? `Because you take ${firstMed}, check timing with your prescriber before starting.`
        : 'If you start any new medicine, check timing with your prescriber.',
    },
    vars: { ...(stage && { cycleStatus: stage }), ...(age && { age: String(age) }) },
    known: [age && `${age}`, stage && STAGE_SHORT[stage], ...meds, ...supplements, ...conditions].filter(Boolean) as string[],
  };
}
