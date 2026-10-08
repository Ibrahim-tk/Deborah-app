/** M-7.5 list: tab (For you · All · New) → topic → search. Audience filtering comes from selectForYou. */
import { useAppStore } from '@shared/store';
import { daysBetween, nowFrom } from '@shared/utils';
import { useForYou, type ForYouEntry } from '@mobile/hooks/useForYou';

export const TOPIC_ALL = 'all';

export type LibraryTab = 'forYou' | 'all' | 'new';

// ASSUMPTION: "New" = published in the last 30 days on the simulated clock, newest first.
const NEW_DAYS = 30;

export function useLibraryResults(tab: LibraryTab, topic: string, query: string): ForYouEntry[] {
  const forYou = useForYou();
  const now = useAppStore((s) => nowFrom(s).toISOString().slice(0, 10));
  const q = query.trim().toLowerCase();

  // "For you" keeps its ranking and reasons; All / New are plain newest-first lists.
  let list: ForYouEntry[] =
    tab === 'forYou' ? forYou : [...forYou].map(({ item }) => ({ item })).sort((a, b) => b.item.publishedAt.localeCompare(a.item.publishedAt));
  if (tab === 'new') list = list.filter(({ item }) => daysBetween(item.publishedAt, now) <= NEW_DAYS);
  if (topic !== TOPIC_ALL) list = list.filter(({ item }) => item.topics.includes(topic));
  if (q) {
    list = list.filter(({ item }) =>
      [item.title, item.summary, ...item.topics.map((t) => t.replace(/-/g, ' '))].some((text) => text.toLowerCase().includes(q)),
    );
  }
  return list;
}
