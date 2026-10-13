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

export function useFlowPlayer(flow: Flow, name: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState(false);
  const [extraPrep, setExtraPrep] = useState<string[]>([]);
  const vars = useRef<Record<string, FlowValue>>({});
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const push = (e: Entry) => setEntries((xs) => [...xs, e]);
  const say = (s?: string) => personalise(flow, s, name);
  const typingMs = flow.uiDefaults.typingIndicatorMs;

  function go(id: string | undefined): void {
    const node = id ? flow.nodes[id] : undefined;
    if (!id || !node) return;
    switch (node.type) {
      case 'user_message':
        push({ id: uid(), kind: 'user', text: say(node.user) });
        return go(node.next);
      case 'loading': {
        const w = node.widget!;
        push({ id: uid(), kind: 'thinking', steps: w.steps ?? [say(node.bot)], durationMs: w.durationMs ?? 2500 });
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
          if (node.sideEffect?.appendToVisitPrep) setExtraPrep((xs) => [...xs, node.sideEffect!.appendToVisitPrep!]);
          // Waits for a tap when the node has choices; otherwise moves on by itself.
          const waits = node.type === 'question' || node.type === 'safety' || Boolean(node.widget?.options?.length);
          if (!waits) later(() => go(nextNodeId(node, vars.current)), 500);
        }, typingMs);
    }
  }

  useEffect(() => {
    go(flow.startNode);
    const t = timers.current;
    return () => t.forEach(window.clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** A tap on a choice: echo it as her message, save it, and follow the script. */
  const respond = (entryId: string, node: FlowNode, picked: FlowOption[]) => {
    setEntries((xs) => xs.map((x) => (x.id === entryId ? { ...x, answered: true } : x)));
    push({ id: uid(), kind: 'user', text: picked.map((p) => say(p.label)).join(', ') });
    if (node.saveAs) {
      const values = picked.map((p) => p.value).filter((v) => v !== undefined);
      vars.current[node.saveAs] = node.widget?.multi ? (values as string[]) : (values[0] as FlowValue);
    }
    const single = picked.length === 1 ? picked[0] : undefined;
    go(single?.next ?? nextNodeId(node, vars.current));
  };

  return { entries, typing, extraPrep, respond, go };
}
