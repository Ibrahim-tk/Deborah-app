import type { Relationship } from '@shared/types/domain';

/** Display labels for a profile's relationship to the account holder ("You" for self). */
export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  self: 'You',
  daughter: 'Daughter',
  son: 'Son',
  partner: 'Partner',
  parent: 'Parent',
  other: 'Family member',
};

export const relationshipLabel = (r: Relationship) => RELATIONSHIP_LABELS[r];
