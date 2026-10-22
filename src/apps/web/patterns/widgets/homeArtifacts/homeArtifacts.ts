/**
 * Home artifact kit — solid tone + floral art map (locked visual language).
 * Intent keys must match the action; never cycle random art.
 */

export type HomeTone = 'mint' | 'sky' | 'rose' | 'lilac' | 'linen' | 'gold' | 'hero';

export type HomeArtifactId =
  | 'consulting-bloom'
  | 'botanical'
  | 'resting-petal'
  | 'night-bloom'
  | 'leaf-flower'
  | 'flask-bloom'
  | 'health-bloom'
  | 'twin-bloom'
  | 'check-bloom'
  /** Painted floral PNGs (transparent background). */
  | 'purple-leaves'
  | 'blue-bloom'
  | 'pink-bloom'
  | 'purple-spike-bloom'
  | 'violet-bloom'
  | 'dest-health-art'
  | 'dest-family-art';

export interface HomeArtifactSpec {
  tone: HomeTone;
  artifact: HomeArtifactId;
}

const BASE = '/images/home/artifacts';
const PNG = new Set<HomeArtifactId>([
  'purple-leaves',
  'blue-bloom',
  'pink-bloom',
  'purple-spike-bloom',
  'violet-bloom',
  'dest-health-art',
  'dest-family-art',
]);

export function artifactSrc(id: HomeArtifactId): string {
  return `${BASE}/${id}.${PNG.has(id) ? 'png' : 'svg'}`;
}

/** Resolve tone + artifact from a Home step / prompt key (optional title for deferred intake rows). */
export function artifactForIntent(key: string, title?: string): HomeArtifactSpec {
  const k = key.toLowerCase();
  const t = (title ?? '').toLowerCase();
  if (k === 'lifestyle' || (t.includes('sleep') && t.includes('food'))) {
    return { tone: 'rose', artifact: 'pink-bloom' };
  }
  if (k === 'tired' || k.includes('tired')) return { tone: 'rose', artifact: 'pink-bloom' };
  if (k === 'sleep' || k.includes('sleep') || t.includes('movement') || t.includes('stress')) {
    return { tone: 'rose', artifact: 'pink-bloom' };
  }
  if (k === 'supplements' || k.includes('supplement')) return { tone: 'mint', artifact: 'leaf-flower' };
  if (k === 'labs' || k.includes('lab') || k.includes('upload')) return { tone: 'sky', artifact: 'blue-bloom' };
  if (k === 'checkin' || k.includes('check')) return { tone: 'lilac', artifact: 'blue-bloom' };
  if (k === 'meds' || k.includes('medic')) return { tone: 'linen', artifact: 'pink-bloom' };
  if (k.startsWith('q:') || k.includes('chat') || k === 'continue') return { tone: 'hero', artifact: 'violet-bloom' };
  if (k === 'profile' || k === 'start' || k.includes('intake')) return { tone: 'rose', artifact: 'pink-bloom' };
  if (k === 'health') return { tone: 'mint', artifact: 'dest-health-art' };
  if (k === 'family') return { tone: 'rose', artifact: 'dest-family-art' };
  return { tone: 'linen', artifact: 'botanical' };
}
