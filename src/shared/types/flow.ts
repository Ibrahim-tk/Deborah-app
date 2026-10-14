/** Scripted consultation flows (data/conversation/flows/*.json): a node graph, played without a live LLM. */
export interface FlowOption {
  label: string;
  value?: string | boolean;
  next?: string;
}

export interface FlowWidget {
  type: 'suggested_replies' | 'quick_replies' | 'pill_select' | 'safety_card' | 'thinking_steps' | 'inline_tip' | 'visit_prep_card' | 'reminder_chip' | 'free_text'
    /** On-the-fly widgets (patterns/widgets, docs/ux/F02c). */
    | 'mood_scale' | 'scale_check' | 'upload_card' | 'slot_picker' | 'confirm_card' | 'reminder_card';
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
}

export interface Flow {
  flowId: string;
  startNode: string;
  contentStatus: string;
  carriedFromIntake: { firstName: string } & Record<string, unknown>;
  uiDefaults: { typingIndicatorMs: number; showSkipOnClarifiers?: boolean; earlyExitLabel?: string };
  nodes: Record<string, FlowNode>;
}
