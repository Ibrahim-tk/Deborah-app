/** Home view model for the three Figma states (191:3398): which state, and what each card says. */
import { useShallow } from 'zustand/react/shallow';
import { productList } from '@shared/data';
import { selectPlan90, useAppStore } from '@shared/store';
import type { Message } from '@shared/types/domain';
import { daysBetween, dayKey, formatShortDate, nowFrom } from '@shared/utils';
import { useHubData } from '@mobile/screens/myhealth/useHubData';
import type { Recommendation } from './HomeKit';
import { useHomeData } from './useHomeData';

export type HomeState = 'new' | 'returning' | 'established';

// OPEN: "when does Home switch to the few-weeks-in layout?" — documented default: day 14 of the plan.
const ESTABLISHED_FROM_DAY = 14;

const relative = (days: number) => (days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`);
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** The last question Deborah asked in a chat that stopped partway. */
function lastQuestion(messages: Message[]): string | undefined {
  const text = [...messages].reverse().find((m) => m.role === 'deborah' && m.text)?.text ?? '';
  return text.match(/[^.!?]*\?/g)?.at(-1)?.trim() || undefined;
}

export function useHomeView() {
  const d = useHomeData();
  const hub = useHubData();
  const plan = useAppStore(selectPlan90);
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const now = nowFrom(clock);
  const today = dayKey(now);

  const last = d.midIntake ? d.active : d.history[0];
  const when = last ? relative(daysBetween(last.startedAt, now)) : undefined;
  const topic = sentenceCase(hub.focus?.topic ?? last?.topic ?? 'Your last conversation');

  const state: HomeState = d.isNew ? 'new' : hub.plan && hub.plan.day >= ESTABLISHED_FROM_DAY && !d.midIntake ? 'established' : 'returning';

  const habits = (plan?.habits ?? []).map((h) => ({ id: h.id, text: h.text, done: h.doneDates.includes(today) }));
  const nextHabit = habits.find((h) => !h.done)?.text;

  const n = d.reports.length;
  const latest = [...d.reports].sort((a, b) => (b.collectedAt ?? '').localeCompare(a.collectedAt ?? ''))[0];
  const latestLabel = latest ? latest.labName ?? (latest.collectedAt ? `Labs from ${formatShortDate(latest.collectedAt)}` : 'Lab report') : '';
  const reportsMeta = n === 0 ? undefined : d.reportsNew ? `New · ${latestLabel}` : `${n} report${n === 1 ? '' : 's'} · Latest: ${latestLabel}`;

  // Personalised only, each with a reason. OPEN: reason copy is placeholder.
  const recommendations: Recommendation[] = [];
  if (d.product) recommendations.push({ product: d.product, reason: `Because you mentioned ${lowerFirst(topic)}` });
  const planProduct = productList.find((p) => p.id === plan?.productId && p.id !== d.product?.id);
  if (planProduct) recommendations.push({ product: planProduct, reason: 'Part of your My Healing Plan' });

  return {
    ...d,
    state,
    when,
    topic,
    pendingQuestion: d.midIntake && d.active ? lastQuestion(d.active.messages) : undefined,
    planDay: hub.plan?.day,
    checkInDue: hub.checkIn.kind === 'due',
    habits,
    nextHabit: nextHabit ? lowerFirst(nextHabit) : undefined,
    reportsMeta,
    recommendations,
    today,
  };
}
