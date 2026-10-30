/** Tokens for the proxy chat: `{you}` = advocate, `{name}` / pronouns = the person they're asking about. */
import { SELF_PROFILE_ID, selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import type { FlowValue } from '@shared/engine';
import { resolvePronouns } from '@shared/engine';
import { pronounTokens } from '@web/screens/consultation/Conversation/parts/thirdPerson';

export function useProxyContext(): { tokens: Record<string, string>; vars: Record<string, FlowValue> } {
  const you = useAppStore((s) => s.profiles.byId[SELF_PROFILE_ID]?.name ?? '');
  const profile = useAppStore(selectActiveProfile);
  const dob = profile?.dob;
  const now = nowFrom(useAppStore.getState());
  const age = dob ? Math.floor((now.getTime() - new Date(dob).getTime()) / 31_557_600_000) : 80;
  const name = profile?.name?.trim() || 'Eleanor';
  const forms = pronounTokens(resolvePronouns(profile));
  return {
    tokens: {
      you: you || 'there',
      name,
      age: String(age),
      they: forms.they,
      them: forms.them,
      their: forms.their,
      are: forms.are,
      feel: forms.feel,
      They: forms.they.charAt(0).toUpperCase() + forms.they.slice(1),
      Their: forms.their.charAt(0).toUpperCase() + forms.their.slice(1),
    },
    vars: {},
  };
}
