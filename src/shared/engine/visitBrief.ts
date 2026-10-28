/**
 * Miro Step 5 — My Visit Notes / prepare for provider (docs/ux/F09b-visit-brief.md).
 * Assembles a structured brief from a completed 7-section answer + profile.
 */
import type {
  Answer,
  Conversation,
  Message,
  Profile,
  VisitBriefContent,
  VisitBriefLab,
  VisitBriefMed,
  VisitBriefQuestion,
} from '../types/domain';

export const VISIT_BRIEF_DISCLAIMER = [
  'Not a diagnosis or prescription',
  'Genesis Gold contains no hormones and is not a pharmaceutical product',
  'Not a licensed prescriber',
] as const;

export const VISIT_BRIEF_WHAT_THIS_IS = 'Note for the provider — prepared with Your Oracle, an AI health education tool, from our conversation';

const GENESIS_GOLD_NOTE =
  'Genesis Gold contains no hormones and is not a pharmaceutical product. Please monitor response alongside any other care.';

/** Rule A: full 7-section guidance (or completed 7-section answer) → enough detail. */
export function hasEnoughDetailForVisitBrief(conv: Conversation): boolean {
  if (conv.guidanceGivenAt) return true;
  const msg = latestCompletedAnswer(conv);
  return Boolean(msg?.answer && msg.answer.sections.length >= 7);
}

export function latestCompletedAnswer(conv: Conversation): Message | undefined {
  return [...conv.messages].reverse().find((m) => m.kind === 'answer' && m.answer && !m.meta?.streaming);
}

function section(answer: Answer, key: string) {
  return answer.sections.find((s) => s.key === key);
}

/** Split "Name — reason" / "Name: reason" into lab rows. `tier` from JSON wins; else the first three are primary. */
export function parseLabBullet(bullet: string, index: number, tier?: VisitBriefLab['tier']): VisitBriefLab {
  const t = tier ?? (index < 3 ? 'primary' : 'also');
  const m = bullet.match(/^(.+?)\s*[—–:]\s*(.+)$/);
  if (m) {
    return { name: m[1].trim(), tier: t, reason: m[2].trim() };
  }
  return { name: bullet.trim(), tier: t, reason: '' };
}

function dobLabel(profile: Profile): string | undefined {
  if (profile.dob) {
    try {
      return new Date(profile.dob).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch {
      return profile.dob;
    }
  }
  const year = profile.health?.birthYear?.value;
  return year != null ? String(year) : undefined;
}

function medicationsFrom(profile: Profile): VisitBriefMed[] {
  const fromHealth = (profile.health?.medications?.value ?? []).map((m) => m.name);
  const fromIntake = (profile.intake.medications ?? []).filter((m) => m && m !== 'none');
  const names = fromHealth.length ? fromHealth : fromIntake;
  const meds: VisitBriefMed[] = names.map((name) => ({ name, current: true }));
  if (profile.intake.genesisGold === 'yes') {
    const existing = meds.find((m) => /genesis\s*gold/i.test(m.name));
    if (existing) existing.genesisGoldNote = GENESIS_GOLD_NOTE;
    else meds.push({ name: 'Genesis Gold®', current: true, genesisGoldNote: GENESIS_GOLD_NOTE });
  }
  return meds;
}

function concernFrom(conv: Conversation, answer: Answer, profile: Profile): string {
  const concern = profile.intake.mainConcern?.trim();
  if (concern) return concern;
  const hearing = section(answer, 'hearing')?.body?.trim();
  if (hearing) return hearing;
  const user = [...conv.messages].reverse().find((m) => m.role === 'user' && m.text?.trim());
  return user?.text?.trim() || conv.topic || 'See conversation with the Oracle';
}

/** Client's words + a “Duration:” line when intake captured one (mock: “Duration: e.g., 8–12 months”). */
function chiefComplaintFrom(conv: Conversation, answer: Answer, profile: Profile): string {
  const text = concernFrom(conv, answer, profile);
  // OPEN: no intake step saves `concernDuration` yet — the line only prints when a seed or future step sets it.
  const duration = profile.intake.concernDuration?.trim();
  return duration ? `${text}\nDuration: ${duration}` : text;
}

function clinicalContextFrom(answer: Answer): string {
  const hypo = section(answer, 'hypothalamic')?.body?.trim() ?? '';
  const mean = section(answer, 'mayMean')?.body?.trim() ?? '';
  return [hypo, mean].filter(Boolean).join('\n\n') || 'Context from the Oracle (placeholder).';
}

const WHY_FALLBACK = 'Why I’m asking: context from my conversation with the Oracle.';

/** Per-question “why”: JSON `bulletWhy` first, then an inline “ — because …” split, then the placeholder. */
export function parseQuestionBullet(bullet: string, why?: string): VisitBriefQuestion {
  if (why?.trim()) return { text: bullet.trim(), why: why.trim() };
  const m = bullet.match(/^(.+?\?)\s*[—–]\s*(.+)$/) ?? bullet.match(/^(.+?)\s+because\s+(.+)$/i);
  if (m) return { text: m[1].trim(), why: m[2].trim() };
  return { text: bullet.trim(), why: WHY_FALLBACK };
}

function questionsFrom(answer: Answer): VisitBriefQuestion[] {
  const s = section(answer, 'providerQuestions');
  return (s?.bullets ?? []).map((b, i) => parseQuestionBullet(b, s?.bulletWhy?.[i]));
}

function labsFrom(answer: Answer): VisitBriefLab[] {
  const s = section(answer, 'tests');
  return (s?.bullets ?? []).map((b, i) => parseLabBullet(b, i, s?.bulletTiers?.[i]));
}

function redFlagsFrom(conv: Conversation, answer: Answer): string {
  if (conv.redFlag) {
    return (
      'A concern was flagged in this session that should be reviewed with a clinician. ' +
      'This is not an emergency assessment — seek urgent care if symptoms worsen.'
    );
  }
  const mean = section(answer, 'mayMean')?.body;
  return (
    'No urgent red flags identified in this session. ' +
    (mean ? `Symptoms were discussed in context of: ${mean.split(/[.!?]/)[0]}.` : 'Symptoms appear consistent with a non-emergent pattern.')
  );
}

function recommendationFrom(answer: Answer): string {
  const doNow = section(answer, 'doNow');
  const parts = [doNow?.body, ...(doNow?.bullets ?? []).map((b) => `• ${b}`), section(answer, 'word')?.body].filter(Boolean);
  return parts.join('\n') || answer.closingLine;
}

export function assembleVisitBrief(conv: Conversation, profile: Profile, answer: Answer, planNote?: string): VisitBriefContent {
  return {
    header: {
      name: profile.name,
      dob: dobLabel(profile),
      priority: Boolean(conv.redFlag),
      whatThisIs: VISIT_BRIEF_WHAT_THIS_IS,
    },
    chiefComplaint: chiefComplaintFrom(conv, answer, profile),
    // F09c: what she reported from a recent provider visit, in her words (never interpreted).
    clinicalContext: [
      clinicalContextFrom(answer),
      conv.afterVisit && `Recent provider visit (as reported by the client): ${conv.afterVisit.summary}.`,
      planNote && `Healing plan: ${planNote}`,
    ].filter(Boolean).join('\n\n'),
    labs: labsFrom(answer),
    questions: questionsFrom(answer),
    medications: medicationsFrom(profile),
    redFlagsSummary: redFlagsFrom(conv, answer),
    recommendation: recommendationFrom(answer),
    disclaimer: [...VISIT_BRIEF_DISCLAIMER],
    status: answer.status === 'approved' ? 'approved' : 'placeholder',
  };
}

/** One-line preview for Visit Notes list rows. */
export function visitBriefPreview(brief: VisitBriefContent): string {
  const line = brief.chiefComplaint.split('\n').find((l) => l.trim())?.trim() ?? brief.header.whatThisIs;
  return line.length > 120 ? `${line.slice(0, 117)}…` : line;
}

/** Minimal conversation shell so First Consult / Widget Lab can assemble a brief without a live chat. */
export function briefFromAnswer(profile: Profile, answer: Answer, topic?: string): VisitBriefContent {
  const now = new Date().toISOString();
  const conv: Conversation = {
    id: 'visit-brief-shell',
    profileId: profile.id,
    topic,
    status: 'answered',
    messages: [
      {
        id: 'visit-brief-answer',
        role: 'deborah',
        kind: 'answer',
        answer,
        createdAt: now,
        text: '',
      },
    ],
    startedAt: now,
    guidanceGivenAt: now,
  };
  return assembleVisitBrief(conv, profile, answer);
}
