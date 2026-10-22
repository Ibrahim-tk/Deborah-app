/** Home data for intake V2 states: new vs returning, profile completion, next steps, reports. */
import { useShallow } from 'zustand/react/shallow';
import { findProduct, scripts } from '@shared/data';
import { healthProfileCompletion } from '@web/screens/onboarding/HealthBasics/healthProfile';
import { selectActiveConversation, selectHistory, useAppStore } from '@shared/store';

const DEFERRED = [
  { key: 'genderIdentity', label: 'Gender identity' },
  { key: 'lifestyle', label: 'Sleep, food, movement & stress' },
  { key: 'careContext', label: 'Your doctors & appointments' },
  { key: 'fullDob', label: 'Full date of birth' },
] as const;

export function useHomeData() {
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const active = useAppStore(selectActiveConversation);
  const profileCount = useAppStore((s) => s.profiles.order.length);
  const history = useAppStore(useShallow(selectHistory));
  const reports = useAppStore(useShallow((s) => Object.values(s.labs.reportsById).filter((r) => r.profileId === s.activeProfileId)));

  const isNew = history.length === 0 && !active?.messages.length;
  const health = profile?.health;
  const completion = profile ? healthProfileCompletion(profile) : 0;
  const intakeDone = Boolean(profile?.intakeV2?.completedAt);

  // Next steps: Deborah's follow-up questions from the most recent answered chat.
  const last = history[0];
  const steps = [...(last?.messages ?? [])].reverse().find((m) => m.suggestions?.length)?.suggestions?.slice(0, 3) ?? [];
  // Recommendation only when personalised: the product from her last answer.
  const productId = last ? [...last.messages].reverse().find((m) => m.answer?.product)?.answer?.product?.productId : undefined;
  const product = productId ? findProduct(productId) : undefined;
  const summary = last?.summary ?? (last?.scriptId ? scripts[last.scriptId]?.topic : undefined);
  // Half-answered intake question in the open conversation: resume exactly there.
  const midIntake = active?.status === 'intake' && active.messages.length > 0;

  const deferred = DEFERRED.filter((d) => !health?.[d.key]);
  // "New": a report she hasn't checked yet.
  const reportsNew = reports.some((r) => !r.confirmed);

  return { profileCount, profile, active, history, isNew, completion, intakeDone, steps, product, summary, midIntake, deferred, reports, reportsNew };
}
