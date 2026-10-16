/** Full-document version switches isolate stores, timers and version-specific styles. */
export type FlowVersion = 'v1' | 'v2';
/** Default is Version 2 (same live `src` as client `/`). Only explicit `flow=v1` mounts the frozen snapshot. */
export const flowVersionFrom = (search: string): FlowVersion =>
  new URLSearchParams(search).get('flow') === 'v1' ? 'v1' : 'v2';
export function flowVersionHref(pathname: string, search: string, hash: string, version: FlowVersion): string {
  const params = new URLSearchParams(search);
  params.set('flow', version);
  return `${pathname}?${params.toString()}${hash}`;
}
