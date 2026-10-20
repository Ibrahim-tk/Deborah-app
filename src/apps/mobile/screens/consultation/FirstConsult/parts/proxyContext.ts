/** Tokens for the proxy chat: `{you}` = the account holder asking, `{age}` = the person they're asking about. */
import { SELF_PROFILE_ID, selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import type { FlowValue } from '@shared/engine';

export function useProxyContext(): { tokens: Record<string, string>; vars: Record<string, FlowValue> } {
  const you = useAppStore((s) => s.profiles.byId[SELF_PROFILE_ID]?.name ?? '');
  const dob = useAppStore((s) => selectActiveProfile(s)?.dob);
  const now = nowFrom(useAppStore.getState());
  const age = dob ? Math.floor((now.getTime() - new Date(dob).getTime()) / 31_557_600_000) : 80;
  return { tokens: { you: you || 'there', age: String(age) }, vars: {} };
}
