/** Toggle stable IDs; an exclusive answer such as None cannot coexist with other selections. */
export function toggleSelection(selected: string[], id: string, exclusive?: string): string[] {
  if (id === exclusive) return selected.includes(id) ? [] : [id];
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected.filter((x) => x !== exclusive), id];
}
