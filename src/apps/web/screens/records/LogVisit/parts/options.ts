/** Option labels for M-9.8 (docs/ux/F09c-log-visit.md › What is recorded). Rows, never tags. */
import { visitSpecialties } from '@shared/data';
import type { VisitMedChange, VisitSpecialty, VisitTestStatus } from '@shared/types/domain';

export const SPECIALTY_OPTIONS: { value: VisitSpecialty; label: string }[] = visitSpecialties.map((s) => ({ value: s.id, label: s.label }));

export const TEST_STATUS_OPTIONS: { value: VisitTestStatus; label: string }[] = [
  { value: 'ordered', label: 'Ordered' },
  { value: 'done', label: 'Done' },
  { value: 'results', label: 'Results back' },
];

export const MED_CHANGE_OPTIONS: { value: VisitMedChange; label: string }[] = [
  { value: 'started', label: 'Started' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'dose', label: 'Changed dose' },
  { value: 'continue', label: 'Continue' },
];

export const labelOf = <T extends string>(options: { value: T; label: string }[], value: T | undefined) =>
  options.find((o) => o.value === value)?.label;
