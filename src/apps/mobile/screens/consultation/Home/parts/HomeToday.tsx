/**
 * Home "For you today": tonal "note" cards (kicker header over a hairline, title, meta + dark
 * round action) in a swipeable row, cycling lilac · linen · rose so neighbours stay distinct. Each card shows only when it
 * has something real to say:
 * 1. Continue your last consultation (patient memory: the main reason to come back)
 * 2. Next check-in — only when one is due (the follow-up loop)
 * 3. 90-day plan progress — only when Deborah has approved the plan content
 * 4. For you from Deborah — one piece matched to her last consultation
 */
import type { CSSProperties } from 'react';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Icon } from '@mobile/ui';
import { useForYou } from '@mobile/hooks/useForYou';
import { useHubData } from '@mobile/screens/myhealth/useHubData';
import { useNav, useNavStore } from '@mobile/navigation';
import styles from './HomeToday.module.css';

interface TodayCard {
  key: string;
  kicker: string;
  title: string;
  meta: string;
  onPress: () => void;
  /** 0–1: thin progress line (plan only). */
  progress?: number;
}

const TONES = ['lilac', 'linen', 'rose'] as const;

export function HomeToday() {
  const { push } = useNav();
  const openAsk = useNavStore((s) => s.openAsk);
  const { profileId, focus, plan, checkIn } = useHubData();
  // Plan progress is gated on Deborah's approval of the plan content (OPEN: feature sign-off).
  const planApproved = useAppStore((s) => s.plan90[s.activeProfileId]?.status === 'approved');
  const matched = useForYou().find((f) => f.reason);

  const cards: TodayCard[] = [];
  if (focus)
    cards.push({
      key: 'continue',
      kicker: 'Continue',
      title: focus.topic ? focus.topic.charAt(0).toUpperCase() + focus.topic.slice(1) : 'Your last consultation',
      meta: formatShortDate(focus.countedAt ?? focus.startedAt),
      onPress: () => {
        const s = useAppStore.getState();
        s.setConversation(focus.id, { archived: false });
        s.setActiveConversation(profileId, focus.id);
        openAsk();
      },
    });
  if (checkIn.kind === 'due')
    cards.push({ key: 'checkin', kicker: 'Check-in due', title: 'How are things going?', meta: 'Tell Deborah today', onPress: () => openAsk({ mode: 'checkin' }) });
  if (plan && planApproved)
    cards.push({
      key: 'plan',
      kicker: plan.day > 90 ? 'Plan complete' : `Day ${plan.day} of 90`,
      title: 'Your 90-day plan',
      meta: `${plan.done} of ${plan.total} habits this week`,
      progress: Math.min(1, plan.day / 90),
      onPress: () => (plan.day > 90 ? openAsk({ mode: 'checkin' }) : push('M-7.3')),
    });
  if (matched)
    cards.push({
      key: 'foryou',
      kicker: 'For you',
      title: matched.item.title,
      meta: `${matched.item.type === 'video' ? 'Video' : matched.item.type === 'lesson' ? 'Lesson' : 'Article'} · ${matched.item.durationMin} min`,
      onPress: () => push('M-7.4', { itemId: matched.item.id }),
    });
  if (cards.length === 0) return null;

  return (
    <section className={styles.root} aria-label="For you today">
      <h2 className={styles.label}>For you today</h2>
      <ul className={styles.row}>
        {cards.map((c, i) => (
          <li key={c.key}>
            <button type="button" className={`${styles.card} ${styles[TONES[i % TONES.length]]}`} onClick={c.onPress}>
              <span className={styles.kicker}>{c.kicker}</span>
              <span className={styles.title}>{c.title}</span>
              {c.progress !== undefined && (
                <span className={styles.track} aria-hidden>
                  <span className={styles.fill} style={{ '--p': c.progress } as CSSProperties} />
                </span>
              )}
              <span className={styles.foot}>
                <span className={styles.meta}>{c.meta}</span>
                <span className={styles.go} aria-hidden>
                  <Icon name="chevron" size={18} />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
