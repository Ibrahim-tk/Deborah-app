/** M-7.5 "Topic" select row: every topic in Deborah's library, plus All topics. */
import { libraryItems } from '@shared/data';
import { Select } from '@mobile/ui';
import { TOPIC_ALL } from './useLibraryResults';


const label = (slug: string) => {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const OPTIONS = [
  { value: TOPIC_ALL, label: 'All topics' },
  ...[...new Set(libraryItems.flatMap((i) => i.topics))].sort().map((t) => ({ value: t, label: label(t) })),
];

export function TopicSelect({ value, onChange }: { value: string; onChange: (topic: string) => void }) {
  return <Select label="Topic" options={OPTIONS} value={value} onChange={onChange} />;
}
