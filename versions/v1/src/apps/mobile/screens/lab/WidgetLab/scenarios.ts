/**
 * Widget lab scenarios: a believable first consultation that uses every on-the-fly widget once, plus a
 * keyword router that answers anything typed with the most fitting widget (simulated, no AI call).
 * OPEN: all Deborah-voice copy here is placeholder until Deborah approves it.
 */
export type WidgetKind =
  | 'consent' | 'yesno' | 'multi' | 'scale' | 'mood' | 'answer' | 'product' | 'slots' | 'confirm'
  | 'reminder' | 'upload' | 'tip' | 'prep' | 'escalation' | 'emergency';

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
  d('That sounds exhausting. When you wake, do you feel hot or sweaty?', 'yesno', 'Yes / no pills'),
  d('Which of these happen to you as well?', 'multi', 'Multi-select pills'),
  d('How is your energy during the day, from 0 to 10?', 'scale', 'Scale (knob slider)'),
  d('And overall, how are you feeling this week?', 'mood', 'Mood check-in'),
  d('Thank you. Here is how I’d think about it.', 'answer', '7-section answer (signature card + Visit notes)'),
  d('Many women in your situation ask about this one. Talk to your clinician first.', 'product', 'Product card'),
  d('Would you like to bring this to Deborah herself? Here are her next openings.', 'slots', 'Slot picker (two-week slider)'),
  d('Please confirm before I book it.', 'confirm', 'Confirm card'),
  d('Shall I check in with you about your sleep in a week?', 'reminder', 'Reminder'),
  d('If you have recent labs, add them and I’ll read them alongside your answers.', 'upload', 'Upload'),
  d('One small thing to try tonight:', 'tip', 'Inline tip'),
  d('I put your questions for your next appointment together.', 'prep', 'Visit prep card'),
  d('One more thing, Maria.', 'escalation', 'Safety escalation'),
];

/** Typed message → the widget Deborah answers with (keyword match; the fallback asks a yes/no). */
const ROUTES: { test: RegExp; widget: WidgetKind; text: string }[] = [
  { test: /chest pain|can.?t breathe|faint|bleeding heavily|suicid|emergency/i, widget: 'emergency', text: 'This could be serious.' },
  { test: /book|appointment|see deborah|visit|consult/i, widget: 'slots', text: 'Let’s find a time with Deborah.' },
  { test: /pay|buy|order|subscribe|confirm/i, widget: 'confirm', text: 'Here’s what that looks like. Please confirm.' },
  { test: /lab|blood|test result|pdf|report/i, widget: 'upload', text: 'Add your report and I’ll read it with you.' },
  { test: /remind|reminder|check in|later/i, widget: 'reminder', text: 'I can nudge you.' },
  { test: /mood|feel|sad|anxious|stress/i, widget: 'mood', text: 'Let’s start with how you’re feeling right now.' },
  { test: /energy|tired|fatigue|pain|scale|how much/i, widget: 'scale', text: 'On a scale from 0 to 10, how strong is it today?' },
  { test: /symptom|which|also|other/i, widget: 'multi', text: 'Which of these are you noticing?' },
  { test: /supplement|vitamin|magnesium|product|shop/i, widget: 'product', text: 'This is one many women ask about.' },
  { test: /question|doctor|prepare|notes/i, widget: 'prep', text: 'Here’s a list to bring with you.' },
  { test: /why|what|explain|sleep|hot flash|sweat|period|hormone|thyroid/i, widget: 'answer', text: 'Here’s how I’d think about it.' },
  { test: /tip|try|tonight|help/i, widget: 'tip', text: 'Something small you can try:' },
];

export function routeQuestion(text: string): LabMessage {
  const hit = ROUTES.find((r) => r.test.test(text));
  return hit ? d(hit.text, hit.widget) : d('Can I ask one thing first: is this new for you in the last few months?', 'yesno');
}

export const MULTI_OPTIONS = ['Night sweats', 'Racing thoughts', 'Needing the bathroom', 'A dry mouth', 'None of these'];

/** Two weeks for the slider variation; weekends and full days have no openings (dimmed). */
const WEEKDAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
const SLOTS = [['9:30 am', '1:00 pm', '3:00 pm'], ['10:00 am', '2:30 pm'], [], [], ['8:30 am', '11:00 am', '4:00 pm'], ['9:00 am'], []];
export const SLOT_FORTNIGHT = Array.from({ length: 14 }, (_, i) => ({
  value: `d${i}`,
  label: `${WEEKDAYS[i % 7]} ${16 + i}`,
  times: SLOTS[i % 7],
}));
