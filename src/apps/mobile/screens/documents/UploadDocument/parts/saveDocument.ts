/** Writes an uploaded document (and, for lab results, its lab report) to the store. Returns its id. */
import { documentConfig, documentExtractions, labSampleReports } from '@shared/data';
import { selectDocuments, useAppStore } from '@shared/store';
import type { DocumentFormat, DocumentType, HealthDocument } from '@shared/types/domain';
import { addDays, formatShortDate, nowFrom, uid } from '@shared/utils';

export interface PickedDocument {
  source: 'camera' | 'file';
  fileName: string;
  sizeBytes: number;
  format: DocumentFormat;
}

export interface DocumentDetails {
  type: DocumentType;
  title: string;
  /** yyyy-mm-dd from the date field, or empty. */
  date: string;
  description: string;
}

export const typeLabel = (type: DocumentType) => documentConfig.types.find((t) => t.id === type)?.label ?? 'Document';

export const defaultTitle = (type: DocumentType, date: string, now: Date) =>
  `${typeLabel(type)} · ${formatShortDate(date ? `${date}T12:00:00` : now.toISOString())}`;

/** OPEN: duplicates are allowed; a repeated title gets " (2)", " (3)"… (docs/ux/F11-documents.md). */
function uniqueTitle(title: string, profileId: string) {
  const taken = new Set(selectDocuments(useAppStore.getState(), profileId).map((d) => d.title));
  if (!taken.has(title)) return title;
  let n = 2;
  while (taken.has(`${title} (${n})`)) n += 1;
  return `${title} (${n})`;
}

export function saveDocument(profileId: string, file: PickedDocument, details: DocumentDetails): string {
  const s = useAppStore.getState();
  const now = nowFrom(s);
  const id = uid('doc');
  const documentDate = details.date ? new Date(`${details.date}T12:00:00`).toISOString() : undefined;

  // OPEN: a lab upload goes straight into Labs with the simulated sample-a values the result step
  // showed (no separate M-5.4 review, since M-5.4 sends to chat). Values are demo, not guidance.
  let labReportId: string | undefined;
  if (details.type === 'lab') {
    const sample = labSampleReports['sample-a'];
    labReportId = uid('lab');
    s.addReport({
      id: labReportId,
      profileId,
      source: file.format === 'pdf' ? 'pdf' : 'photo',
      labName: sample.labName,
      panelTitle: sample.panelTitle,
      collectedAt: documentDate ?? addDays(now.toISOString(), -sample.collectedDaysAgo),
      values: sample.values.map((v) => ({ id: uid('lv'), ...v })),
      confirmed: true,
    });
  }

  const doc: HealthDocument = {
    id,
    profileId,
    type: details.type,
    format: file.format,
    fileName: file.fileName,
    sizeBytes: file.sizeBytes,
    title: uniqueTitle(details.title.trim() || defaultTitle(details.type, details.date, now), profileId),
    description: details.description.trim() || undefined,
    documentDate,
    uploadedAt: now.toISOString(),
    source: file.source,
    extraction: documentExtractions[details.type],
    labReportId,
  };
  s.addDocument(doc);
  return id;
}
