/**
 * Scripted-chat adapter: maps flow `profileFacts` into SaveHealthProfile (F02g).
 * OPEN: wire to the store's pending-fact flow once the premade chat writes real facts.
 */
import { SaveHealthProfile, type HealthFact } from '@web/patterns/chat';

export function ProfileFacts({ facts, onEdit }: { facts: HealthFact[]; onEdit: () => void }) {
  return <SaveHealthProfile facts={facts} onEdit={onEdit} />;
}
