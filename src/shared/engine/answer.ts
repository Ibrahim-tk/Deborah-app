/**
 * Answer construction (docs/07-ai-simulation.md §2): start from the script, interpolate the
 * profile (and confirmed labs), always 7 sections in fixed order, closing line always last.
 */
import type { Script } from '../types/content';
import { SECTION_ORDER, type Answer, type AnswerSection, type LabReport, type Profile } from '../types/domain';
import { formatShortDate } from '../utils/dates';
import { interpolate } from '../utils/text';
import { ageLabel } from './intake';
import { isMinor } from './profile';

/** Lab tokens for interpolation: {labDate} {labCount} {labHighlight} {labMarker}. */
function labValues(report: LabReport): Record<string, string> {
  const first = report.values[0];
  return {
    labDate: report.collectedAt ? formatShortDate(report.collectedAt) : 'your recent test',
    labCount: String(report.values.length),
    labHighlight: `your ${first.marker} at ${first.value} ${first.unit}`.trim(),
    labMarker: first.marker,
  };
}

/** One plain bullet per confirmed value; hedged, no interpretation (placeholder copy). */
const labBullets = (report: LabReport) =>
  report.values.map((v) => `${v.marker} ${v.value} ${v.unit} — ask how this compares with how you've been feeling`.replace(/\s+—/, ' —'));

function withLabsVariant(script: Script, sections: AnswerSection[]): AnswerSection[] {
  const overrides = script.variants?.withLabs?.sections ?? [];
  return sections.map((s) => {
    const o = overrides.find((x) => x.key === s.key);
    return o ? { ...s, body: o.body ?? s.body, bullets: o.bullets ?? s.bullets } : s;
  });
}

export function buildAnswer(script: Script, profile: Profile, labs?: LabReport): Answer {
  const report = labs && labs.values.length > 0 ? labs : undefined;
  const usesLabs = Boolean(report && (script.usesLabs || script.variants?.withLabs));
  const values = { name: profile.name, ageLabel: ageLabel(profile) ?? 'this stage of life', ...(usesLabs && report ? labValues(report) : {}) };

  const base = SECTION_ORDER.map((key) => {
    const s = script.answer.sections.find((x) => x.key === key);
    if (!s) throw new Error(`Script ${script.id} is missing section ${key}`);
    return s;
  });
  const sections = (usesLabs ? withLabsVariant(script, base) : base).map((s) => ({
    ...s,
    body: interpolate(s.body, values),
    bullets: [...(usesLabs && report && s.key === 'tests' ? labBullets(report) : []), ...(s.bullets ?? [])].map((b) => interpolate(b, values)),
  }));
  // Keep `bullets` absent on sections that never had any.
  const clean = sections.map((s, i) => (base[i].bullets || s.bullets.length ? s : { ...s, bullets: undefined }));

  // ASSUMPTION (pending Deborah, F06 OPEN): no product card for teen or child profiles.
  return {
    sections: clean,
    product: isMinor(profile) ? undefined : script.answer.product,
    closingLine: script.answer.closingLine,
    labsReferenced: usesLabs && report ? [report.id] : undefined,
    status: script.status,
  };
}

/** Empty shell of the answer: titles visible, bodies filled by streaming. */
export function emptyAnswer(answer: Answer): Answer {
  return { ...answer, sections: answer.sections.map((s) => ({ ...s, body: '', bullets: s.bullets ? [] : undefined })) };
}
