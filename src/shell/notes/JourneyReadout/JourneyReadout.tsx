/**
 * @shell JourneyReadout — dev panel (plan C-20): which decision nodes the active conversation took.
 * Age group (DN-03), symptom group (DN-07), journey (DN-08), the planned questions with done ones struck
 * through (DN-09 to DN-11), the product gate (DN-12) and the facts waiting for Confirm (DN-13).
 * Reads the store; never writes it. Toggle: Toggles › Show journey readout.
 */
import { ageGroupFor, ageOf, journeyFor, pendingFacts, productAllowed, withFacts } from '@shared/engine';
import { contextFor } from '@shared/bridge';
import { selectActiveConversation, selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import styles from './JourneyReadout.module.css';

export function JourneyReadout() {
  const s = useAppStore();
  const profile = selectActiveProfile(s);
  const conv = selectActiveConversation(s);
  if (!profile) return null;
  const now = nowFrom(s);
  const effective = withFacts(profile, conv?.facts);
  const age = ageOf(effective, now);
  const ctx = conv ? contextFor(s, conv) : null;
  const done = conv?.intakeDone ?? [];
  const gate = ctx && conv ? (productAllowed(ctx, conv, effective) ? 'allowed' : 'off') : '—';

  return (
    <aside className={styles.root} aria-label="Journey readout">
      <p className={styles.title}>Journey readout</p>
      <dl className={styles.rows}>
        <dt>Age group</dt><dd>{age === undefined ? 'unknown' : `${ageGroupFor(age)} (${age})`}</dd>
        <dt>Sex · stage</dt><dd>{effective.sexAtBirth ?? '—'} · {effective.intake.reproductive ?? '—'}</dd>
        <dt>Symptom group</dt><dd>{conv?.symptomGroup ?? (conv?.scriptId ? 'general' : '—')}</dd>
        <dt>Journey</dt><dd>{conv?.journey ?? journeyFor(effective, now) ?? 'needs a basic'}</dd>
        <dt>Product</dt><dd>{gate}{conv?.redFlag ? ' (red flag)' : ''}</dd>
        <dt>To confirm</dt><dd>{pendingFacts(conv).map((f) => f.label).join(', ') || 'nothing'}</dd>
        <dt>Saved</dt><dd>{(profile.confirmedFacts ?? []).map((f) => f.label).join(', ') || 'nothing'}</dd>
      </dl>
      {conv?.intakePlan?.length ? (
        <ol className={styles.plan}>
          {conv.intakePlan.map((id) => (
            <li key={id} data-done={done.includes(id) || undefined}>{id}</li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No questions planned yet.</p>
      )}
    </aside>
  );
}
