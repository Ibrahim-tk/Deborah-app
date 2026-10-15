/**
 * Pure helpers for scripted flows (types/flow.ts): resolve the next node from an answer, and personalise
 * the script's sample name. The UI layer owns timing and rendering.
 */
import type { Flow, FlowNode } from '../types/flow';
import type { Profile } from '../types/domain';
import { journeyFor } from './journey';

export type FlowValue = string | boolean | string[] | undefined;

/** Evaluates the small condition language the flow JSON uses: `x.includes('v')`, `x.length == 0`, `x == true`, joined by `||`. */
function holds(condition: string, vars: Record<string, FlowValue>): boolean {
  return condition.split('||').some((part) => {
    const c = part.trim();
    let m = c.match(/^(\w+)\.includes\('([^']+)'\)$/);
    if (m) return Array.isArray(vars[m[1]]) && (vars[m[1]] as string[]).includes(m[2]);
    m = c.match(/^(\w+)\.length\s*==\s*(\d+)$/);
    if (m) return Array.isArray(vars[m[1]]) && (vars[m[1]] as string[]).length === Number(m[2]);
    m = c.match(/^(\w+)\s*==\s*(true|false)$/);
    if (m) return vars[m[1]] === (m[2] === 'true');
    return false;
  });
}

/** Where the flow goes after this node, given the variables collected so far. */
export function nextNodeId(node: FlowNode, vars: Record<string, FlowValue>): string | undefined {
  if (node.branches) {
    for (const b of node.branches) {
      if ('else' in b) return b.next;
      if (holds(b.if, vars)) return b.next;
    }
  }
  return node.next;
}

/** The script is written for a sample person; swap in the real first name. */
export function personalise(flow: Flow, text: string | undefined, name: string): string {
  if (!text) return '';
  const sample = flow.carriedFromIntake.firstName;
  return name ? text.split(sample).join(name) : text;
}

/**
 * Plan C-19: the scripted first consultation (M-2.12, firstConsult.json) is written for a postmenopausal
 * adult talking about sleep; it plays only when the profile already says so. Everyone else — every new user,
 * since Basic details no longer asks the stage — starts in the live conversation (M-2.1) with its journeys.
 */
export function firstConsultFor(profile: Profile | undefined, now: Date): 'first' | null {
  return profile && journeyFor(profile, now) === 'female-post' ? 'first' : null;
}
