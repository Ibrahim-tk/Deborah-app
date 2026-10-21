/**
 * After guidance: save-to-profile prompt (self or family/advocate).
 * Prototype: saving is local (the answer is already in the conversation history).
 */
import { useState } from 'react';
import { SaveProfileCard } from '@mobile/patterns/chat';

export function SaveToProfile({ name, self = false }: { name: string; self?: boolean }) {
  const [state, setState] = useState<'open' | 'saved' | 'dismissed'>('open');
  const who = name.trim() || 'your';
  return (
    <SaveProfileCard
      title={self ? 'Save this to your profile?' : `Save this to ${who}’s profile?`}
      body={
        self
          ? 'It’ll be ready for your next visit, along with what was shared today.'
          : `It’ll be ready for ${who}’s next visit, along with what was shared today.`
      }
      saved={state === 'saved'}
      savedNote={self ? 'Saved to your profile' : `Saved to ${who}’s profile`}
      dismissed={state === 'dismissed'}
      onSave={() => setState('saved')}
      onNotNow={() => setState('dismissed')}
    />
  );
}
