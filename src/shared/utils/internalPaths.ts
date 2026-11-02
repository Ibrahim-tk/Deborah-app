/** Prototype tools live under `/internal`. Legacy bare paths redirect here.
 * `/web` is the client desktop app (not a legacy redirect). */

const INTERNAL_PREFIX = '/internal';

const LEGACY_EXACT = new Set(['/mobile', '/wid']);

export function isLegacyPrototypePath(pathname: string): boolean {
  return LEGACY_EXACT.has(pathname);
}

/** Map `/mobile` → `/internal/mobile`. `/web` stays client-facing. */
export function toInternalPath(pathname: string): string {
  if (pathname.startsWith(`${INTERNAL_PREFIX}/`) || pathname === INTERNAL_PREFIX) return pathname;
  if (isLegacyPrototypePath(pathname)) return `${INTERNAL_PREFIX}${pathname}`;
  return pathname;
}

export function legacyRedirectTarget(pathname: string, search: string, hash: string): string {
  return `${toInternalPath(pathname)}${search}${hash}`;
}

export const INTERNAL_MOBILE = `${INTERNAL_PREFIX}/mobile`;
export const INTERNAL_WEB = `${INTERNAL_PREFIX}/web`;
export const INTERNAL_WID = `${INTERNAL_PREFIX}/wid`;
export const INTERNAL_DESIGN_SYSTEM = `${INTERNAL_PREFIX}/design-system`;
export const INTERNAL_DESIGN_SYSTEM_WEB = `${INTERNAL_PREFIX}/design-system/web`;

/** Client-side route change from inside an app (apps don't use the router): BrowserRouter follows popstate. */
export function goInternal(path: string) {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
/** Design-system path for the current surface: /internal/… keeps the nav, the bare path has none. */
export function designPath(page: 'design-system' | 'design-system/web' | 'design-md'): string {
  const internal = window.location.pathname.startsWith(`${INTERNAL_PREFIX}/`);
  return internal ? `${INTERNAL_PREFIX}/${page}` : `/${page}`;
}
export const INTERNAL_DESIGN_MD = `${INTERNAL_PREFIX}/design-md`;
export const INTERNAL_HOME = `${INTERNAL_PREFIX}/home`;
export const INTERNAL_EMAIL = `${INTERNAL_PREFIX}/email`;
export const INTERNAL_ADMIN = `${INTERNAL_PREFIX}/admin`;
