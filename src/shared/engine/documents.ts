/**
 * F11 Documents (docs/ux/F11-documents.md › Deborah handoff). A shared document becomes a user
 * attachment bubble, then:
 * - lab result with a lab report → the existing lab-review answer (shareLabs, direct);
 * - prescription → the medication safety card first (never dosing), then Deborah's reply;
 * - other types → a short placeholder reply with suggested questions. Not a counted consultation.
 */
import { documentReview } from '../data';
import type { HealthDocument, LabReport } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { interpolate } from '../utils/text';
import { isGated } from './counting';
import { shareLabsSteps } from './labs';
import { deborahText, pause, userBubble } from './plans';
import { medicationSteps } from './safety';

const r = documentReview;

function attachment(ctx: EngineContext, doc: HealthDocument): Step {
  const step = userBubble(ctx, interpolate(r.bubble, { title: doc.title }));
  return step.type === 'message' ? { ...step, message: { ...step.message, meta: { documentId: doc.id } } } : step;
}

export function shareDocumentSteps(ctx: EngineContext, doc: HealthDocument, report?: LabReport): Step[] {
  if (doc.type === 'lab' && report) {
    // Reuse the lab-review path; swap its "Shared lab results" bubble for the document attachment.
    let swapped = false;
    return shareLabsSteps(ctx, report, true).map((step) => {
      if (swapped || step.type !== 'message' || step.message.role !== 'user') return step;
      swapped = true;
      return attachment(ctx, doc);
    });
  }
  if (isGated(ctx)) return [{ type: 'gate', reason: 'freeLimit' }];
  const type = doc.type === 'lab' ? 'other' : doc.type;
  const meds = doc.type === 'prescription' || doc.extraction?.fields.some((f) => /medication/i.test(f.label));
  return [
    attachment(ctx, doc),
    ...pause('Reading your document'),
    ...(meds ? medicationSteps(ctx, [`document:${doc.id}`]) : []),
    ...deborahText(ctx, r.replies[type], { suggestions: r.suggestions[type], meta: { streaming: true, status: r.status, documentId: doc.id } }),
  ];
}

/** The one-time offer for an upload saved with "Not now". */
export function offerDocumentSteps(ctx: EngineContext, doc: HealthDocument): Step[] {
  return [
    ...pause('Deborah is here', 400, 700),
    ...deborahText(ctx, interpolate(r.offer, { title: doc.title }), {
      kind: 'documentOffer',
      quickReplies: { options: r.offerOptions },
      meta: { streaming: true, status: r.status, documentId: doc.id },
    }),
  ];
}

export function documentOfferReplySteps(ctx: EngineContext, messageId: string, optionId: string, doc?: HealthDocument, report?: LabReport): Step[] {
  const offer = ctx.conversation.messages.find((m) => m.id === messageId);
  const answered: Step[] = offer?.quickReplies
    ? [{ type: 'patch', messageId, patch: { quickReplies: { ...offer.quickReplies, answered: optionId } } }]
    : [];
  // A document deleted since the offer can't be discussed; Deborah says it's gone.
  if (optionId === 'doc-discuss' && doc && !doc.deletedAt) return [...answered, ...shareDocumentSteps(ctx, doc, report)];
  return [...answered, ...deborahText(ctx, r.later)];
}
