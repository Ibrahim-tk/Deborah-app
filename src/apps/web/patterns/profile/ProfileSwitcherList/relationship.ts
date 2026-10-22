import type { Relationship } from '@shared/types/domain';

/** Display labels for a profile's relationship to the account holder ("You" for self). */
export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  self: 'You',
  child: 'Child',
  /** Legacy aliases — same label as `child`. */
  daughter: 'Child',
  son: 'Child',
  partner: 'Partner',
  parent: 'Parent',
  other: 'Family member',
};

/** Selectable relationships in Add Member / Profile Details (excludes self + legacy aliases). */
export const RELATIONSHIP_OPTIONS: { value: Exclude<Relationship, 'self' | 'daughter' | 'son'>; label: string }[] = [
  { value: 'child', label: RELATIONSHIP_LABELS.child },
  { value: 'partner', label: RELATIONSHIP_LABELS.partner },
  { value: 'parent', label: RELATIONSHIP_LABELS.parent },
  { value: 'other', label: 'Other' },
];

/** Display label; pass `other` free text from intake.relationshipOther when present. */
export const relationshipLabel = (r: Relationship, other?: string) =>
  r === 'other' && other?.trim() ? other.trim() : RELATIONSHIP_LABELS[r];
