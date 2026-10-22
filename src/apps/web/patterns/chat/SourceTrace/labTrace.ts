import type { LabReport } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import type { SourceTraceProps } from './SourceTrace';

/** Props for a lab-grounded answer: the first few confirmed values Deborah read. */
export function labTrace(report: LabReport, onOpen?: () => void): SourceTraceProps {
  return {
    kind: 'lab',
    title: 'Read your lab report',
    date: report.collectedAt ? formatShortDate(report.collectedAt) : undefined,
    items: report.values.slice(0, 4).map((v) => ({ label: v.marker, value: `${v.value} ${v.unit}`.trim() })),
    onOpen,
  };
}
