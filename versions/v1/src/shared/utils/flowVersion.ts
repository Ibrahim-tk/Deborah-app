/** Full-document version switches isolate stores, timers and version-specific styles. */
export type FlowVersion = 'v1' | 'v2';
export const flowVersionFrom = (search: string): FlowVersion => new URLSearchParams(search).get('flow') === 'v2' ? 'v2' : 'v1';
export function flowVersionHref(pathname: string, search: string, hash: string, version: FlowVersion): string {
  const params = new URLSearchParams(search);
  params.set('flow', version);
  return `${pathname}?${params.toString()}${hash}`;
}
