import type { Suggestion } from '@shared/types/content';

/** Pronoun forms for a profile's stored pronouns value (she-her, he-him, she-they…). Unknown → they. */
const FORMS = {
  she: { they: 'she', them: 'her', their: 'her', are: 'is', feel: 'feels' },
  he: { they: 'he', them: 'him', their: 'his', are: 'is', feel: 'feels' },
  they: { they: 'they', them: 'them', their: 'their', are: 'are', feel: 'feel' },
};

const formsFor = (pronouns = '') =>
  pronouns.startsWith('she') ? FORMS.she : pronouns.startsWith('he') ? FORMS.he : FORMS.they;

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Fills {name} {they} {them} {their} {are} {feel} (capitalised token → capitalised word). */
export function thirdPerson(list: Suggestion[], name: string, pronouns?: string): Suggestion[] {
  const f: Record<string, string> = { ...formsFor(pronouns), name: name || 'them' };
  return list.map((s) => ({
    ...s,
    text: s.text.replace(/\{(\w+)\}/g, (m, key: string) => {
      const word = f[key.toLowerCase()];
      if (!word) return m;
      return key[0] === key[0].toUpperCase() && key !== 'name' ? cap(word) : word;
    }),
  }));
}
