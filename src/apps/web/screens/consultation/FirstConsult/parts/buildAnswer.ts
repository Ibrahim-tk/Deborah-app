/** Turns a scripted answer node (sections 1–7) into the app's Answer shape, so AnswerSections renders it. */
import { SECTION_ORDER, type Answer } from '@shared/types/domain';
import type { FlowNode, FlowSectionBody } from '@shared/types/flow';

const bullets = (body: FlowSectionBody) =>
  Array.isArray(body) ? body.map((b) => (typeof b === 'string' ? b : `${b.test}: ${b.why}`)) : undefined;

export function buildAnswer(node: FlowNode, say: (s?: string) => string): Answer {
  const sections = (node.sections ?? []).map((s, i) => ({
    // Old 7-section flows: the 7th is the retired "A Word from the Oracle".
    key: SECTION_ORDER[i] ?? ('word' as const),
    title: s.title,
    body: typeof s.body === 'string' ? say(s.body) : '',
    bullets: bullets(s.body)?.map((b) => say(b)),
  }));
  const card = node.sections?.find((s) => s.productCard)?.productCard;
  return {
    sections,
    product: card && { productId: 'genesis-gold', why: card.line, frame90: card.personalNote ?? '' },
    closingLine: node.footer ?? '',
    status: 'placeholder',
  };
}

/** Section 4 (questions) and 5 (tests) for the visit-prep card. */
export function visitPrepItems(node: FlowNode | undefined) {
  const s = node?.sections ?? [];
  return { questions: bullets(s[3]?.body ?? []) ?? [], tests: bullets(s[4]?.body ?? []) ?? [] };
}
