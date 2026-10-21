/** Scripted consultation flows (data/conversation/flows/*.json): a node graph, played without a live LLM. */
export interface FlowOption {
  label: string;
  value?: string | boolean;
  next?: string;
  /** What she "says" when she taps it, if longer than the pill (premade chats). */
  reply?: string;
}

export interface FlowWidget {
  type: 'suggested_replies' | 'quick_replies' | 'pill_select' | 'safety_card' | 'thinking_steps' | 'inline_tip' | 'visit_prep_card' | 'reminder_chip' | 'free_text'
    /** On-the-fly widgets (patterns/widgets, docs/ux/F02c). */
    | 'mood_scale' | 'scale_check' | 'upload_card' | 'slot_picker' | 'confirm_card' | 'reminder_card'
    /** The human path (EscalationCard) as an inline tile; options = [book, not now]. */
    | 'escalation'
    /** Premade chat (Sandra): quiet banner pointing to the Health profile; `label` is its dismiss link. */
    | 'intake_banner'
    /** Proxy chats: who the session is about (`text`), pinned at the start. */
    | 'proxy_banner'
    /** A block she can copy word for word (`title`, `text`), e.g. what to tell triage. */
    | 'copy_block'
    /** Emergency: opens a bottom sheet with Call 911 (`title`, `text`); `options[0]` continues the script. */
    | 'emergency_sheet'
    /** One button that opens the visit notes screen (M-9.7); `label` is its text. */
    | 'visit_notes_button'
    /** Generative: provider name + date form after "Yes, I have an appointment" (design 2026-10-21). */
    | 'appointment_form'
    /** Generative: receipt-style visit-notes card (provider · date · notes · small buttons). */
    | 'visit_notes_card';
  options?: FlowOption[];
  actions?: FlowOption[];
  multi?: boolean;
  exclusiveOption?: string;
  steps?: string[];
  durationMs?: number;
  text?: string;
  title?: string;
  label?: string;
  /** free_text: hint inside the field. */
  placeholder?: string;
  itemsFrom?: string[];
  /** scale_check end labels. */
  low?: string;
  high?: string;
  /** slot_picker / confirm_card / reminder_card detail lines. */
  meta?: string;
  detail?: string;
  value?: string;
}

export type FlowSectionBody = string | (string | { test: string; why: string })[];

export interface FlowSection {
  id: number;
  title: string;
  body: FlowSectionBody;
  defaultOpen?: boolean;
  preview?: string;
  productCard?: { name: string; line: string; personalNote?: string; disclosure?: string };
}

export interface FlowNode {
  type: 'message' | 'question' | 'safety' | 'emergency' | 'loading' | 'answer' | 'user_message' | 'end';
  bot?: string;
  user?: string;
  widget?: FlowWidget;
  progress?: string;
  saveAs?: string;
  next?: string;
  branches?: ({ if: string; next: string } | { else: true; next: string })[];
  layout?: 'progressive' | 'conversational';
  sections?: FlowSection[];
  footer?: string;
  suggestedReplies?: FlowOption[];
  sideEffect?: { appendToVisitPrep?: string };
  route?: string;
  /** Skip this node silently when the profile already answers this variable (never re-ask). */
  skipIfKnown?: string;
  /** `greeting`: the chat's opening line, set large in serif with no bubble (design direction 2026-10-14). */
  display?: 'greeting';
  /** Answer only: the visit notes' heading when saved from this answer (M-9.7), e.g. "Night sweats & 2–3 am waking". */
  notesTitle?: string;
  /** Answer only: what Deborah noted, offered as "Save to my profile" right under the seven cards. */
  profileFacts?: { label: string; value: string }[];
}

export interface Flow {
  flowId: string;
  startNode: string;
  contentStatus: string;
  carriedFromIntake: { firstName: string } & Record<string, unknown>;
  uiDefaults: { typingIndicatorMs: number; showSkipOnClarifiers?: boolean; earlyExitLabel?: string };
  nodes: Record<string, FlowNode>;
}
