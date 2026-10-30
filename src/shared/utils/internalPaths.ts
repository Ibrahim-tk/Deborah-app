/** Prototype tools live under `/internal`. Legacy bare paths redirect here.
 * `/web` is the client desktop app (not a legacy redirect). */

const INTERNAL_PREFIX = '/internal';

const LEGACY_EXACT = new Set(['/mobile', '/wid', '/design-system']);

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
export const INTERNAL_HOME = `${INTERNAL_PREFIX}/home`;
export const INTERNAL_EMAIL = `${INTERNAL_PREFIX}/email`;
