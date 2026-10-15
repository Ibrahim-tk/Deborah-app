/** Folds picked symptoms into the draft as one plain sentence she can still edit. */
export function withSymptoms(draft: string, symptoms: string[]): string {
  const list = symptoms.map((s, i) => (i ? s.toLowerCase() : s));
  const line = `${list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list.at(-1)}` : list[0]}.`;
  const base = draft.trim();
  return base ? `${base} I'm also noticing: ${line.charAt(0).toLowerCase()}${line.slice(1)}` : `I'm noticing: ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
}
