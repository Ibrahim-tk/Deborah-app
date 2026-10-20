/** M-7.2 — populated hub: focus · plan · check-in · history and notes · health profile · for you · library link. */
import { scripts } from '@shared/data';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { ListRow } from '@mobile/ui';
import { CheckInCard, ContentCard, FocusCard, PlanProgressCard, QuickLinks } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import { useForYou } from '@mobile/hooks/useForYou';
import { useHubData } from '@mobile/screens/myhealth/useHubData';
import { HealthDetails } from './HealthDetails';
import styles from './Hub.module.css';
import { useAccountGate } from '@mobile/hooks/useAccountGate';

type Segment = 'consultations' | 'notes';

export function HubPopulated() {
  const { push, openAsk } = useNav();
  const gate = useAccountGate();
  const { profileId, focus, plan, checkIn, upcoming, counts } = useHubData();
  const forYou = useForYou().slice(0, 3);

  const openFocus = () => {
    if (!focus) return;
    const s = useAppStore.getState();
    s.setConversation(focus.id, { archived: false });
    s.setActiveConversation(profileId, focus.id);
    openAsk();
  };

  return (
    <>
      {focus && (
        <FocusCard
          topic={focus.topic ?? 'Your last consultation'}
          dateLabel={formatShortDate(focus.countedAt ?? focus.startedAt)}
          summary={focus.summary}
          placeholder={scripts[focus.scriptId ?? '']?.status !== 'approved'}
          onPress={openFocus}
        />
      )}
      {plan && (
        <PlanProgressCard
          day={plan.day}
          habitsDone={plan.done}
          habitsTotal={plan.total}
          onPress={() => (plan.day > 90 ? openAsk({ mode: 'checkin' }) : gate('journey', () => push('M-7.3')))}
        />
      )}
      <CheckInCard state={checkIn} upcoming={upcoming} onCheckIn={() => openAsk({ mode: 'checkin' })} onReminders={() => push('M-10.4')} />
      <QuickLinks<Segment>
        links={[
          { key: 'consultations', label: 'History', icon: 'chat', count: counts.consultations },
          { key: 'notes', label: 'Visit Notes', icon: 'note', count: counts.notes },
        ]}
        onSelect={(segment) => push('M-9.1', { segment })}
      />
      {/* Design request 2026-10-20: the health profile lives here; labs and documents have their own tab. */}
      <HealthDetails />
      <section className={styles.section} aria-labelledby="hub-for-you">
        <h2 id="hub-for-you" className={styles.heading}>For you from Deborah</h2>
        <div className={styles.list}>
          {forYou.map(({ item, reason }) => (
            <ContentCard key={item.id} item={item} reason={reason} onPress={() => push('M-7.4', { itemId: item.id })} />
          ))}
        </div>
        <div className={styles.rowGroup}>
          <ListRow title="Browse all of Deborah’s library" onPress={() => push('M-7.5')} />
        </div>
      </section>
    </>
  );
}
