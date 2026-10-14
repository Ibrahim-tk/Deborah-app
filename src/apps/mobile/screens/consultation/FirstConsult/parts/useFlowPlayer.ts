/**
 * Plays a scripted flow (types/flow.ts) as a chat transcript: Deborah "types" before each message,
 * questions wait for a tap, the thinking step runs for its duration, and answers branch via the engine.
 */
import { useEffect, useRef, useState } from 'react';
import { nextNodeId, personalise, type FlowValue } from '@shared/engine';
import type { Flow, FlowNode, FlowOption } from '@shared/types/flow';

export type Entry =
  | { id: string; kind: 'bot'; nodeId: string; text: string; node: FlowNode; answered?: boolean }
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'thinking'; steps: string[]; durationMs: number }
  | { id: string; kind: 'answer'; nodeId: string; node: FlowNode; answered?: boolean }
  | { id: string; kind: 'end'; route?: string };

let seq = 0;
const uid = () => `f${++seq}`;

/** Fills `{token}` from the profile context and from earlier answers (their labels, as she tapped them). */
const fill = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);

export function useFlowPlayer(flow: Flow, name: string, ctx?: { tokens: Record<string, string>; vars: Record<string, FlowValue> }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState(false);
  const [extraPrep, setExtraPrep] = useState<string[]>([]);
  const vars = useRef<Record<string, FlowValue>>({ ...ctx?.vars });
  const labels = useRef<Record<string, string>>({});
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const push = (e: Entry) => setEntries((xs) => [...xs, e]);
  const say = (s?: string) => fill(personalise(flow, s, name), { ...ctx?.tokens, ...labels.current });
  const typingMs = flow.uiDefaults.typingIndicatorMs;

  function go(id: string | undefined): void {
    const node = id ? flow.nodes[id] : undefined;
    if (!id || !node) return;
    // Never re-ask: a question the profile already answers is passed over without a word.
    if (node.skipIfKnown && vars.current[node.skipIfKnown] !== undefined) return go(nextNodeId(node, vars.current));
    switch (node.type) {
      case 'user_message':
        push({ id: uid(), kind: 'user', text: say(node.user) });
        return go(node.next);
      case 'loading': {
        const w = node.widget!;
        push({ id: uid(), kind: 'thinking', steps: w.steps?.map((x) => say(x)) ?? [say(node.bot)], durationMs: w.durationMs ?? 2500 });
        return later(() => {
          setEntries((xs) => xs.filter((x) => x.kind !== 'thinking'));
          go(node.next);
        }, w.durationMs ?? 2500);
      }
      case 'end':
        return push({ id: uid(), kind: 'end', route: node.route });
      default:
        // The full 7-section answer renders at once; conversational answers are a short Deborah reply.
        if (node.type === 'answer' && node.layout === 'progressive') return push({ id: uid(), kind: 'answer', nodeId: id, node });
        setTyping(true);
        later(() => {
          setTyping(false);
          push({ id: uid(), kind: 'bot', nodeId: id, text: say(node.bot), node });
          if (node.sideEffect?.appendToVisitPrep) setExtraPrep((xs) => [...xs, say(node.sideEffect!.appendToVisitPrep)]);
          // Waits for a tap when the node has choices; otherwise moves on by itself.
          // A safety note does not stop the consult (design direction 2026-10-14): the human path stays in the
          // thread, and Deborah carries on to her full answer. OPEN: confirm with Deborah's safety review.
          if (node.type === 'safety') return later(() => go(node.next ?? (flow.nodes.thinking ? 'thinking' : undefined)), 1400);
          const waits = node.type === 'question' || node.type === 'emergency' || Boolean(node.widget?.options?.length);
          if (!waits) later(() => go(nextNodeId(node, vars.current)), 500);
        }, typingMs);
    }
  }

  // Start on a timer: React dev runs this effect twice (mount → cleanup → mount), and the cleanup cancels
  // the first run's timer, so the script starts exactly once whether its first line is hers or Deborah's.
  useEffect(() => {
    later(() => go(flow.startNode), 0);
    const t = timers.current;
    return () => t.forEach(window.clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const echo = (entryId: string, picked: FlowOption[]) => {
    setEntries((xs) => xs.map((x) => (x.id === entryId ? { ...x, answered: true } : x)));
    push({ id: uid(), kind: 'user', text: picked.map((p) => say(p.label)).join(', ') });
  };

  /** An off-script Deborah line (typing first), e.g. before the consent card. Resolves once it shows. */
  const aside = (text: string) =>
    new Promise<void>((done) => {
      setTyping(true);
      later(() => {
        setTyping(false);
        push({ id: uid(), kind: 'bot', nodeId: 'aside', text, node: { type: 'message' }, answered: true });
        later(done, 400);
      }, typingMs);
    });

  /** A tap on a choice: echo it as her message (unless already echoed), save it, and follow the script. */
  const respond = (entryId: string, node: FlowNode, picked: FlowOption[], echoed = false) => {
    if (!echoed) echo(entryId, picked);
    if (node.saveAs) {
      const values = picked.map((p) => p.value).filter((v) => v !== undefined);
      vars.current[node.saveAs] = node.widget?.multi ? (values as string[]) : (values[0] as FlowValue);
      // Words she tapped become `{saveAs}` in later lines: pills in lower case ("night sweats and brain fog"),
      // a scale as its number, a slot as written. A skip leaves the profile's fallback wording.
      const type = node.widget?.type;
      const words = picked.map((p) => (type === 'scale_check' ? String(p.value) : type === 'pill_select' ? p.label.toLowerCase() : p.label));
      if (values.length) labels.current[node.saveAs] = words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words.at(-1)}` : words[0];
    }
    const single = picked.length === 1 ? picked[0] : undefined;
    go(single?.next ?? nextNodeId(node, vars.current));
  };

  return { entries, typing, extraPrep, respond, echo, aside, go, say };
}
