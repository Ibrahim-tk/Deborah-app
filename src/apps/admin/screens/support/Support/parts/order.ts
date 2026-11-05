/** Sort choices for the Support tables: time only, newest first by default. */
export type Order = 'latest' | 'oldest';

export const ORDER_OPTIONS: { value: Order; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
];
