/**
 * F02f closing: "Save this to {name}'s profile?" under the answer of a scripted family chat.
 * Prototype: saving is local (the answer is already in the conversation history).
 */
import { useState } from 'react';
import { SaveProfileCard } from '@mobile/patterns/chat';

export function SaveToProfile({ name }: { name: string }) {
  const [state, setState] = useState<'open' | 'saved' | 'dismissed'>('open');
  return (
    <SaveProfileCard
      title={`Save this to ${name}’s profile?`}
      body={`It’ll be ready for ${name}’s next visit, along with what was shared today.`}
      saved={state === 'saved'}
      savedNote={`Saved to ${name}’s profile`}
      dismissed={state === 'dismissed'}
      onSave={() => setState('saved')}
      onNotNow={() => setState('dismissed')}
    />
  );
}
