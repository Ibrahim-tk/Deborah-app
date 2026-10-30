/**
 * Client-handoff sticky copy. Only these keys show a note — everywhere else stays quiet.
 * Plain language; body text only (no screen IDs in the UI).
 */
export const CLIENT_GUIDE: Record<string, string> = {
  'chat-empty':
    'These three suggestions start a simulated conversation. Choose one to try the chat.',
  'chat-running':
    'This is a simulated chat. No real AI is running here.',
  'visit-notes':
    'These are visit notes. You can save a copy or download them to share with a clinician.',
  'records-notes':
    'My Visit Notes are here. Open an old one, or log what happened after a provider visit.',
  'healing-plan':
    'This is the Wellness Plan. Newest concern stays on top — check off actions as you go. Confirm when a concern is resolved. The letter below is the Oracle’s reference.',
};

export type ClientGuideKey = keyof typeof CLIENT_GUIDE;
