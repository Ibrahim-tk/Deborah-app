/**
 * Widget lab scenarios: a believable first consultation that uses every on-the-fly widget once, plus a
 * keyword router that answers anything typed with the most fitting widget (simulated, no AI call).
 * OPEN: all Deborah-voice copy here is placeholder until Deborah approves it.
 */
export type WidgetKind =
  | 'consent' | 'yesno' | 'multi'
  | 'pillsInline' | 'pillsRegular' | 'pillsFull' | 'pillsFullDescribe' | 'pillsFullYesDetails' | 'pillsFullExpand'
  | 'scale' | 'mood' | 'answer' | 'product' | 'slots'
  | 'upload' | 'tip' | 'prep' | 'brief' | 'emergency';

export interface LabMessage {
  id: string;
  role: 'user' | 'deborah';
  text?: string;
  widget?: WidgetKind;
  /** Short label shown above the widget in the lab, so designers can find each one. */
  tag?: string;
}

let n = 0;
export const mid = () => `m${++n}`;
const d = (text: string, widget?: WidgetKind, tag?: string): LabMessage => ({ id: mid(), role: 'deborah', text, widget, tag });
const u = (text: string): LabMessage => ({ id: mid(), role: 'user', text });

export const SCENARIO: LabMessage[] = [
  d('Hello Maria, I’m so glad you’re here. Before we talk, one quick thing.', 'consent', 'Inline consent + disclaimer'),
  u('I keep waking up at 3am and I can’t fall back asleep.'),
  d('That sounds exhausting. When you wake, do you feel hot or sweaty?', 'yesno', 'QuestionChoices · inline (chat)'),
  d('Which of these happen to you as well?', 'multi', 'QuestionChoices · multi + tick'),
  d('Here are the three pill sizes side by side — compact chat first.', 'pillsInline', 'InlineChoicePills · chat 34px'),
  d('Regular wrapping pills for intake forms (Health Basics).', 'pillsRegular', 'ChoicePills · intake 44px wrapping'),
  d('And full-width stacked options — sex at birth style.', 'pillsFull', 'FullChoicePills · full-width stacked'),
  d('Have your periods started? Tap “I’m not sure” to type, then the check.', 'pillsFullDescribe', 'FullChoicePills · describe morph'),
  d('Using any puberty blockers? Yes opens a details field with check; No advances.', 'pillsFullYesDetails', 'FullChoicePills · yes details morph'),
  d('On HRT? Yes / Yes Previously opens type pills below; No advances.', 'pillsFullExpand', 'FullChoicePills · HRT type expand'),
  d('How is your energy during the day, from 0 to 10?', 'scale', 'Scale (knob slider)'),
  d('And overall, how are you feeling this week?', 'mood', 'Mood check-in'),
  d('Thank you. Here is how I’d think about it.', 'answer', '7-section answer (signature card + Visit notes)'),
  d('Many women in your situation ask about this one. Talk to your clinician first.', 'product', 'Product card'),
  d('Would you like to bring this to Deborah herself?', 'slots', 'Book with Deborah'),
  d('If you have recent labs, add them and I’ll read them alongside your answers.', 'upload', 'Upload'),
  d('One small thing to try tonight:', 'tip', 'Inline tip'),
  d('I put your questions for your next appointment together.', 'prep', 'Visit prep card'),
  d('Here is the structured note for your provider.', 'brief', 'My Visit Notes brief (M-9.7)'),
];

/** Typed message → the widget Deborah answers with (keyword match; the fallback asks a yes/no). */
const ROUTES: { test: RegExp; widget: WidgetKind; text: string }[] = [
  { test: /chest pain|can.?t breathe|faint|bleeding heavily|suicid|emergency/i, widget: 'emergency', text: 'This could be serious.' },
  { test: /book|appointment|see deborah|visit|consult/i, widget: 'slots', text: 'I can ask the team to reach out and set up a time with Deborah.' },
  { test: /lab|blood|test result|pdf|report/i, widget: 'upload', text: 'Add your report and I’ll read it with you.' },
  { test: /mood|feel|sad|anxious|stress/i, widget: 'mood', text: 'Let’s start with how you’re feeling right now.' },
  { test: /energy|tired|fatigue|pain|scale|how much/i, widget: 'scale', text: 'On a scale from 0 to 10, how strong is it today?' },
  { test: /sex at birth|full.?width|stacked pill/i, widget: 'pillsFull', text: 'What was your sex at birth?' },
  { test: /puberty blocker|yes details/i, widget: 'pillsFullYesDetails', text: 'Using any puberty blockers?' },
  { test: /\bhrt\b|hormone therapy|yes previously/i, widget: 'pillsFullExpand', text: 'Are you currently on hormone therapy (HRT)?' },
  { test: /describe|not sure|periods started/i, widget: 'pillsFullDescribe', text: 'Have your periods started?' },
  { test: /regular pill|intake pill|wrapping/i, widget: 'pillsRegular', text: 'Which of these fit?' },
  { test: /inline pill|chat pill|compact pill/i, widget: 'pillsInline', text: 'Quick yes or no:' },
  { test: /symptom|which|also|other/i, widget: 'multi', text: 'Which of these are you noticing?' },
  { test: /supplement|vitamin|magnesium|product|shop/i, widget: 'product', text: 'This is one many women ask about.' },
  { test: /question|doctor|prepare|notes|brief|provider/i, widget: 'brief', text: 'Here’s a structured note for your provider.' },
  { test: /why|what|explain|sleep|hot flash|sweat|period|hormone|thyroid/i, widget: 'answer', text: 'Here’s how I’d think about it.' },
  { test: /tip|try|tonight|help/i, widget: 'tip', text: 'Something small you can try:' },
];

export function routeQuestion(text: string): LabMessage {
  const hit = ROUTES.find((r) => r.test.test(text));
  return hit ? d(hit.text, hit.widget) : d('Can I ask one thing first: is this new for you in the last few months?', 'yesno');
}

/** Same Option shape as IntakeQuestion / FlowChoice — lab must not invent a parallel multi-select. */
export const YES_NO_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'not-sure', label: 'Not sure' },
];

export const MULTI_OPTIONS = [
  { id: 'night-sweats', label: 'Night sweats' },
  { id: 'racing-thoughts', label: 'Racing thoughts' },
  { id: 'bathroom', label: 'Needing the bathroom' },
  { id: 'dry-mouth', label: 'A dry mouth' },
  { id: 'none', label: 'None of these' },
];

/** FullChoicePills specimen — Health Basics sex-at-birth style. */
export const SEX_AT_BIRTH_OPTIONS = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'intersex', label: 'Intersex' },
];

/** FullChoicePills + describe morph — periods style (third option → field + check). */
export const PERIODS_DESCRIBE_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'describe', label: 'I’m not sure / I want to describe' },
];

/** FullChoicePills + Yes→details morph — puberty blockers style. */
export const PUBERTY_BLOCKERS_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];

/** FullChoicePills + expand — HRT status; Yes / Yes Previously reveal type pills. */
export const HRT_STATUS_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'yes-previously', label: 'Yes, Previously' },
  { id: 'no', label: 'No' },
];

export const HRT_TYPE_OPTIONS = [
  { id: 'estrogen-only', label: 'Estrogen only' },
  { id: 'combined', label: 'Combined' },
  { id: 'progesterone-only', label: 'Progesterone only' },
  { id: 'other', label: 'Other / not sure' },
];

/** ChoicePills specimen — short wrapping intake labels. */
export const REGULAR_PILL_LABELS = ['Hot flashes', 'Night sweats', 'Brain fog', 'None of these'];
