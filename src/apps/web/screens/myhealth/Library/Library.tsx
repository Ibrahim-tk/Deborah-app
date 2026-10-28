/**
 * @screen  M-7.5 · Deborah's library
 * @flow    F07 My Health hub
 * @states  default (For you) · filtered (All / New / topic) · search with results · no results · leave-app alert (community)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-75--deborahs-library
 * @xref    web: W-7.5 (apps/web/screens/myhealth/Library) — not built
 */
import { useState } from 'react';
import { Icon, ListRow, Segmented, useAlert, type IconName } from '@web/ui';
import { ContentCard, EmptyState } from '@web/patterns/health';
import { DerivedPage } from '@web/patterns/shell';
import { useToast } from '@web/hooks/toast.store';
import { useNav } from '@web/navigation';
import { TopicSelect } from './parts/TopicSelect';
import { TOPIC_ALL, useLibraryResults, type LibraryTab } from './parts/useLibraryResults';
import styles from './Library.module.css';

const TABS: { value: LibraryTab; label: string; icon: IconName }[] = [
  { value: 'forYou', label: 'For you', icon: 'health' },
  { value: 'all', label: 'All', icon: 'book' },
  { value: 'new', label: 'New', icon: 'flash' },
];

export default function Library() {
  const { push, openAsk } = useNav();
  const alert = useAlert();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<LibraryTab>('forYou');
  const [topic, setTopic] = useState(TOPIC_ALL);
  const results = useLibraryResults(tab, topic, query);

  const openCommunity = async () => {
    const choice = await alert({
      title: 'Leave the app to open Facebook?',
      message: 'The Oracle’s community group opens in Facebook.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Open' }],
    });
    if (choice === 1) toast('Opening Facebook (demo)');
  };

  return (
    <DerivedPage
      title="The Oracle’s library"
      tabs={<Segmented label="Show" options={TABS} value={tab} onChange={setTab} />}
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search the Oracle’s library"
      searchPlaceholder="Sleep, hot flashes, cycles…"
      composerPlaceholder="Ask Oracle about a topic…"
    >
      <div className={styles.stack} data-xref="M-7.5 · the Oracle’s library">
        <TopicSelect value={topic} onChange={setTopic} />

        <section className={styles.list} aria-live="polite" aria-label="Library items">
          {results.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nothing found."
              text="Try ‘sleep’ or ask the Oracle directly."
              actionLabel="Ask Oracle"
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
          <ListRow title="About the Oracle" onPress={() => push('M-7.6')} />
        </div>
      </div>
    </DerivedPage>
  );
}
