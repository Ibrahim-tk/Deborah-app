/** M-7.2 — populated hub: focus · plan · check-in · health profile · for you · library link. */
import { scripts } from '@shared/data';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { ActionTile } from '@mobile/ui';
import { CheckInCard, ContentCard, FocusCard, PlanProgressCard } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import { useForYou } from '@mobile/hooks/useForYou';
import { useHubData } from '@mobile/screens/myhealth/useHubData';
import { HealthDetails } from './HealthDetails';
import styles from './Hub.module.css';
import { useAccountGate } from '@mobile/hooks/useAccountGate';

export function HubPopulated() {
  const { push, openAsk } = useNav();
  const gate = useAccountGate();
  const { profileId, focus, plan, checkIn, upcoming } = useHubData();
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
      {/* History and Visit Notes live on My Notes (M-9.1), not here (design 2026-10-20). */}
      {/* Design request 2026-10-20: the health profile lives here; labs and documents have their own tab. */}
      <HealthDetails />
      <section className={styles.section} aria-labelledby="hub-for-you">
        <h2 id="hub-for-you" className={styles.heading}>For you from Deborah</h2>
        <div className={styles.list}>
          {forYou.map(({ item, reason }) => (
            <ContentCard key={item.id} item={item} reason={reason} onPress={() => push('M-7.4', { itemId: item.id })} />
          ))}
        </div>
        <ActionTile icon="book" title="Browse Deborah’s library" meta="Articles, videos and lessons" onClick={() => push('M-7.5')} />
      </section>
    </>
  );
}
