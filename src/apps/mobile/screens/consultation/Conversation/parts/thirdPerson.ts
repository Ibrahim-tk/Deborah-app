import type { Suggestion } from '@shared/types/content';
import { pronounForms, resolvePronouns } from '@shared/engine';
import type { Profile } from '@shared/types/domain';

/** Tokens for advocate/family copy: {they} {them} {their} {are} {feel}. */
export function pronounTokens(pronouns = ''): Record<string, string> {
  const f = pronounForms(pronouns);
  return {
    they: f.they,
    them: f.them,
    their: f.their,
    are: f.singular ? 'is' : 'are',
    feel: f.singular ? 'feels' : 'feel',
  };
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Fills {name} {they} {them} {their} {are} {feel} (capitalised token → capitalised word). */
export function thirdPerson(list: Suggestion[], name: string, pronouns?: string | Profile): Suggestion[] {
  const resolved = typeof pronouns === 'string' || pronouns === undefined
    ? pronouns
    : resolvePronouns(pronouns);
  const f: Record<string, string> = { ...pronounTokens(resolved), name: name || 'them' };
  return list.map((s) => ({
    ...s,
    text: s.text.replace(/\{(\w+)\}/g, (m, key: string) => {
      const word = f[key.toLowerCase()];
      if (!word) return m;
      return key[0] === key[0].toUpperCase() && key !== 'name' ? cap(word) : word;
    }),
  }));
}
