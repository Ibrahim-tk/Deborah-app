/**
 * loadScenario(id): reset store → deep-merge seed state onto defaults → expand script refs →
 * set the navigator start → set simulatedNow (docs/05-state-and-scenarios.md §4).
 * Invalid or not-yet-built scenarios return an error instead of breaking the app.
 */
import { replayScript } from '../engine/replay';
import { scripts } from '../data';
import { SEEDS } from '../scenarios';
import type { Conversation, Plan90 } from '../types/domain';
import { uid } from '../utils/ids';
import { interpolate } from '../utils/text';
import type { ScenarioSeed } from '../types/scenario';
import { addDays } from '../utils/dates';
import { createDefaults } from './defaults';
import { useAppStore } from './index';
import type { AppData } from './types';

export type LoadResult = { ok: true } | { ok: false; error: string };

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => typeof v === 'object' && v !== null && !Array.isArray(v);

function deepMerge<T>(base: T, patch: Plain): T {
  const out: Plain = { ...(base as Plain) };
  for (const [k, v] of Object.entries(patch)) out[k] = isPlain(v) && isPlain(out[k]) ? deepMerge(out[k], v) : v;
  return out as T;
}

/** Shift every timestamp in a replayed conversation back by `days`. */
function backdate(c: Conversation, now: string, days: number): Conversation {
  const at = addDays(now, -days);
  return {
    ...c,
    startedAt: at,
    countedAt: c.countedAt ? at : undefined,
    messages: c.messages.map((m) => ({ ...m, createdAt: at })),
  };
}

function expandConversations(seed: ScenarioSeed, data: AppData): AppData['conversations'] {
  const byId: Record<string, Conversation> = {};
  const activeByProfile: Record<string, string | undefined> = {};
  for (const [id, cs] of Object.entries(seed.conversations ?? {})) {
    const profile = data.profiles.byId[cs.profileId];
    const match = /^@script:([\w-]+)#(intake-1|ready|answered)$/.exec(cs.messages);
    if (!profile || !match) throw new Error(`Bad conversation seed ${id}`);
    const [, scriptId, checkpoint] = match;
    // Lab-informed scripts replay with the profile's confirmed seed labs (S08).
    const labs = Object.values(data.labs.reportsById).find((r) => r.profileId === cs.profileId && r.confirmed);
    let conv = replayScript(scriptId, checkpoint as 'intake-1' | 'ready' | 'answered', { conversationId: id, profile, now: seed.now, labs });
    if (cs.daysAgo) conv = backdate(conv, seed.now, cs.daysAgo);
    byId[id] = { ...conv, archived: !cs.active };
    if (cs.active) activeByProfile[cs.profileId] = id;
  }
  return { byId, activeByProfile };
}

/**
 * A replayed answer skips the bridge's createPlanFromAnswer, so derive the 90-day plan the way
 * live play would: from each profile's first answered consultation (unless the seed has one).
 */
function derivePlans(data: AppData): AppData['plan90'] {
  const plan90 = { ...data.plan90 };
  const firsts = Object.values(data.conversations.byId)
    .filter((c) => c.countedAt)
    .sort((a, b) => (a.countedAt ?? '').localeCompare(b.countedAt ?? ''));
  for (const c of firsts) {
    const profile = data.profiles.byId[c.profileId];
    const answer = scripts[c.scriptId ?? '']?.answer;
    if (plan90[c.profileId] || !profile || !answer) continue;
    const product = c.messages.find((m) => m.kind === 'answer')?.answer?.product;
    const plan: Plan90 = {
      profileId: c.profileId,
      startDate: c.countedAt!,
      goal: interpolate(answer.goal, { name: profile.name }),
      habits: answer.habitsForPlan.map((text) => ({ id: uid('h'), text: interpolate(text, { name: profile.name }), doneDates: [] })),
      productId: product?.productId,
      status: scripts[c.scriptId ?? '']?.status,
    };
    plan90[c.profileId] = plan;
  }
  return plan90;
}

export function loadScenario(id: string): LoadResult {
  const seed = SEEDS[id];
  if (!seed) return { ok: false, error: `Scenario ${id} isn't available yet` };
  try {
    const prev = useAppStore.getState();
    let data = deepMerge(createDefaults(seed.now), seed.state);
    data = { ...data, conversations: expandConversations(seed, data) };
    data = {
      ...data,
      plan90: derivePlans(data),
      simulatedNow: new Date(seed.now).toISOString(),
      clockAnchor: Date.now(),
      scenario: { id, start: seed.start, loadNonce: prev.scenario.loadNonce + 1 },
      // Dev flags belong to the shell session, not the scenario.
      dev: prev.dev,
    };
    // setState merges, so optional fields the seed omits (consentAcceptedAt, accountId…) would
    // otherwise leak in from the previous state. Clear every non-action key the seed doesn't set.
    const stale = Object.fromEntries(
      Object.entries(prev)
        .filter(([k, v]) => typeof v !== 'function' && !(k in data))
        .map(([k]) => [k, undefined]),
    );
    useAppStore.setState({ ...stale, ...data });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
