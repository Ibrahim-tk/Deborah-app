/**
 * @screen  LAB · Simple Home (route /internal/home) — not a product screen
 * @flow    — design exploration: orb · welcome · 3 actions · suggestions · composer
 * @states  default
 * @xref    web: — not built
 *
 * Layout inspired by a command-center home; skinned with Oracle tokens and existing ui/patterns only.
 */
import { suggestionsData } from '@shared/data';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { DeborahBlob, Divider, Icon, ListRow, type IconName } from '@mobile/ui';
import { ChatLauncher, SuggestionList } from '@mobile/patterns/chat';
import { useToast } from '@mobile/hooks/toast.store';
import { ToastHost } from '@mobile/navigation/Navigator/ToastHost';
import styles from './SimpleHome.module.css';

const ACTIONS: { id: string; icon: IconName; title: string; subtitle: string }[] = [
  {
    id: 'intake',
    icon: 'health',
    title: 'Complete your health profile',
    subtitle: 'A few questions so the Oracle can guide you better.',
  },
  {
    id: 'checkin',
    icon: 'chat',
    title: 'Check in with the Oracle',
    subtitle: 'Share how the last week has felt.',
  },
  {
    id: 'labs',
    icon: 'labs',
    title: 'Upload recent labs',
    subtitle: 'She’ll read them alongside your symptoms.',
  },
];

function greetingLine(name: string): string {
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${hello}, ${name}`;
}

export default function SimpleHome() {
  const toast = useToast();
  const profile = useAppStore(selectActiveProfile);
  const name = profile?.name?.trim() || 'there';
  const suggestions = suggestionsData.default.slice(0, 4);

  return (
    <div className={styles.root} data-xref="LAB · Simple Home">
      <div className={styles.scroll}>
        <header className={styles.hero}>
          <DeborahBlob size={96} label="Oracle" />
          <h1 className={styles.title}>{greetingLine(name)}</h1>
          <p className={styles.body}>
            Here’s a quiet look at what needs your attention. Start with the items below, or ask the Oracle anything.
          </p>
        </header>

        <section className={styles.actions} aria-label="Things to do">
          <div className={styles.actionList}>
            {ACTIONS.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <Divider />}
                <ListRow
                  leading={
                    <span className={styles.actionIcon} aria-hidden>
                      <Icon name={a.icon} size={18} />
                    </span>
                  }
                  title={a.title}
                  subtitle={a.subtitle}
                  trailing="chevron"
                  onPress={() => toast(a.title)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.suggestions} aria-label="Suggestions">
          <SuggestionList
            compact
            suggestions={suggestions}
            onSelect={(s) => toast(s.text)}
          />
        </section>
      </div>

      <div className={styles.dock}>
        <ChatLauncher
          glow
          placeholder="Ask Oracle anything…"
          onOpen={() => toast('Opens Ask Oracle (lab)')}
        />
      </div>
      <ToastHost lifted={false} overComposer={false} />
    </div>
  );
}
