/**
 * Saves the onboarding profile (plan P-04). These are basics the person typed into a form — who it's for,
 * birth year, sex at birth — so they go straight onto the profile (decision D-4); they are not health facts
 * and don't go through Review and Confirm. Health details are only ever asked and saved in the chat.
 */
import { ageBandFor, ageGroupFor } from '@shared/engine';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import type { Profile } from '@shared/types/domain';
import type { SexAtBirth } from '@shared/types/health';
import { nowFrom, uid } from '@shared/utils';
import { forSomeoneElse, type Answers } from './steps';

const CONSENT_PATH = { child: 'guardian-child', teen: 'guardian-teen', adult: 'adult-agreement' } as const;

/** Writes the onboarding profile; returns the profile the first chat should open as. */
export function saveOnboarding(a: Answers): string {
  const s = useAppStore.getState();
  const now = nowFrom(s);
  const at = now.toISOString();
  const year = Number(a.birthYear);
  const age = now.getFullYear() - year;
  const sex = a.sex as SexAtBirth | undefined;
  const birthYear = { value: year, source: 'manual' as const, updatedAt: at };
  const self = s.profiles.byId[SELF_PROFILE_ID];

  if (!forSomeoneElse(a)) {
    s.updateProfile(SELF_PROFILE_ID, { ...(sex && { sexAtBirth: sex }), health: { ...self?.health, birthYear } });
    s.updateIntake(SELF_PROFILE_ID, { profileFor: 'self', ageBand: ageBandFor(age) });
    s.setIntakeProgress(SELF_PROFILE_ID, { step: 'done', completedAt: at, closedAt: at });
    return SELF_PROFILE_ID;
  }

  // Someone else: their own profile with the consent the account holder gave (age-group path).
  // D-3: allowed on any plan as the first person added; M-6.1 still asks to upgrade for more.
  const group = ageGroupFor(age);
  const minor = group !== 'adult';
  const member: Profile = {
    id: uid('p'),
    name: a.memberName?.trim() || 'Them',
    relationship: (a.relationship ?? 'other') as Profile['relationship'],
    ...(sex && { sexAtBirth: sex }),
    health: { birthYear },
    intake: { conditions: [], medications: [], ageBand: ageBandFor(age) },
    createdAt: at,
    consent: { path: CONSENT_PATH[group], attestedAt: at, attestedBy: s.accountId ?? SELF_PROFILE_ID },
    ...(minor && { guardianConsentAt: at }),
    intakeV2: { step: 'done', completedAt: at, closedAt: at },
  };
  s.addProfile(member);
  // Home's first-visit check reads this on the account holder's own profile.
  s.updateIntake(SELF_PROFILE_ID, { profileFor: 'dependent' });
  s.setIntakeProgress(SELF_PROFILE_ID, { step: 'done', completedAt: at, closedAt: at });
  return member.id;
}
