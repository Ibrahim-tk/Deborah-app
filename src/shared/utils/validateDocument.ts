/**
 * F11 upload checks (docs/ux/F11-documents.md › M-11.3): PDF/JPG/PNG/TXT, up to 20 MB, not empty.
 * Pure — reads only the name, MIME type and size the picker reports. The file itself is never read.
 */
import { documentConfig } from '../data';
import type { DocumentFormat } from '../types/domain';

export type DocumentCheck =
  | { ok: true; format: DocumentFormat }
  | { ok: false; reason: 'format' | 'size' | 'empty'; sizeMb?: number };

export interface PickedFile {
  name: string;
  type: string;
  size: number;
}

const extensionOf = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

/** MIME first; fall back to the extension (some pickers report an empty type for .txt). */
export function documentFormatOf(file: Pick<PickedFile, 'name' | 'type'>): DocumentFormat | undefined {
  const byMime = documentConfig.formats.find((f) => f.mime.includes(file.type));
  if (byMime) return byMime.format;
  const ext = extensionOf(file.name);
  return file.type ? undefined : documentConfig.formats.find((f) => f.extensions.includes(ext))?.format;
}

export function validateDocument(file: PickedFile): DocumentCheck {
  const format = documentFormatOf(file);
  if (!format) return { ok: false, reason: 'format' };
  if (file.size <= 0) return { ok: false, reason: 'empty' };
  if (file.size > documentConfig.maxBytes) {
    return { ok: false, reason: 'size', sizeMb: Math.ceil((file.size / (1024 * 1024)) * 10) / 10 };
  }
  return { ok: true, format };
}

/** The date on a document can't be in the future. Empty is allowed. */
export function isFutureDocumentDate(date: string | undefined, now: Date): boolean {
  if (!date) return false;
  const d = new Date(date);
  return !Number.isNaN(d.getTime()) && d.getTime() > now.getTime();
}
