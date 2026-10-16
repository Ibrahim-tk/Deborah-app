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

/** Display label; pass `other` free text from intake.relationshipOther when present. */
export const relationshipLabel = (r: Relationship, other?: string) =>
  r === 'other' && other?.trim() ? other.trim() : RELATIONSHIP_LABELS[r];
