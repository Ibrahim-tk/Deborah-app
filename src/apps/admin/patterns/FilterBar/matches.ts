/** Case-insensitive match of a query against any of the given fields. */
export const matches = (q: string, ...fields: (string | undefined)[]) =>
  !q.trim() || fields.some((f) => f?.toLowerCase().includes(q.trim().toLowerCase()));
