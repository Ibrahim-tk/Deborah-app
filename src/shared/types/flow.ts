/** Scripted consultation flows (data/conversation/flows/*.json): a node graph, played without a live LLM. */
export interface FlowOption {
  label: string;
  value?: string | boolean;
  next?: string;
}

export interface FlowWidget {
  type: 'suggested_replies' | 'quick_replies' | 'pill_select' | 'safety_card' | 'thinking_steps' | 'inline_tip' | 'visit_prep_card' | 'reminder_chip';
  options?: FlowOption[];
  actions?: FlowOption[];
  multi?: boolean;
  exclusiveOption?: string;
  steps?: string[];
  durationMs?: number;
  text?: string;
  title?: string;
  label?: string;
  itemsFrom?: string[];
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
  type: 'message' | 'question' | 'safety' | 'loading' | 'answer' | 'user_message' | 'end';
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
}

export interface Flow {
  flowId: string;
  startNode: string;
  contentStatus: string;
  carriedFromIntake: { firstName: string } & Record<string, unknown>;
  uiDefaults: { typingIndicatorMs: number; showSkipOnClarifiers?: boolean; earlyExitLabel?: string };
  nodes: Record<string, FlowNode>;
}
