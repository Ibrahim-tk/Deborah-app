/**
 * @screen  M-7.5 · Deborah's library
 * @flow    F07 My Health hub
 * @states  default (For you) · filtered (All / New / topic) · search with results · no results · leave-app alert (community)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-75--deborahs-library
 * @xref    web: W-7.5 (apps/web/screens/myhealth/Library) — not built
 */
import { useState } from 'react';
import { Header, Icon, Input, ListRow, Segmented, useAlert } from '@mobile/ui';
import { ContentCard, EmptyState } from '@mobile/patterns/health';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import { TopicSelect } from './parts/TopicSelect';
import { TOPIC_ALL, useLibraryResults, type LibraryTab } from './parts/useLibraryResults';
import styles from './Library.module.css';

const TABS: { value: LibraryTab; label: string }[] = [
  { value: 'forYou', label: 'For you' },
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
];

export default function Library() {
  const { pop, push, openAsk } = useNav();
  const { previousTitle } = useRoute();
  const alert = useAlert();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<LibraryTab>('forYou');
  const [topic, setTopic] = useState(TOPIC_ALL);
  const results = useLibraryResults(tab, topic, query);

  const openCommunity = async () => {
    const choice = await alert({
      title: 'Leave the app to open Facebook?',
      message: 'Deborah’s community group opens in Facebook.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Open' }],
    });
    if (choice === 1) toast('Opening Facebook (demo)');
  };

  return (
    <div className={styles.root} data-xref="M-7.5 · Deborah’s library">
      <Header title="Deborah’s library" onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        <div className={styles.body}>
          <div className={styles.filters}>
            <Input label="Search Deborah’s library" type="search" placeholder="Sleep, hot flashes, cycles…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Segmented label="Show" options={TABS} value={tab} onChange={setTab} />
            <TopicSelect value={topic} onChange={setTopic} />
          </div>

          <section className={styles.list} aria-live="polite" aria-label="Library items">
            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="Nothing found."
                text="Try ‘sleep’ or ask Deborah directly."
                actionLabel="Ask Deborah"
                actionIcon="deborah"
                onAction={() => openAsk({ focus: true })}
              />
            ) : (
              results.map(({ item, reason }) => (
                <ContentCard key={item.id} item={item} reason={reason} onPress={() => push('M-7.4', { itemId: item.id })} />
              ))
            )}
          </section>

          <div className={styles.group}>
            {/* OPEN: real community URL / platform — the prototype never leaves the app. */}
            <ListRow title="Join the community (Facebook group)" trailing={<Icon name="external" size={20} className={styles.external} />} onPress={openCommunity} />
            <ListRow title="About Deborah" onPress={() => push('M-7.6')} />
          </div>
        </div>
      </div>
    </div>
  );
}
