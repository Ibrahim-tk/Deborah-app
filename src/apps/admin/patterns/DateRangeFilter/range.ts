export type DateRange = { preset: '7' | '30' | '90' | 'custom'; from: string; to: string };

export const TODAY = '2026-11-02';
const back = (days: number) => new Date(Date.parse(TODAY) - days * 86_400_000).toISOString().slice(0, 10);
export const presetRange = (p: '7' | '30' | '90'): DateRange => ({ preset: p, from: back(Number(p)), to: TODAY });
