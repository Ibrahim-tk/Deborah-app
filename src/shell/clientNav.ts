/**
 * Client top-nav → phone app bridge. Shell dispatches; MobileApp listens.
 * Keeps the shell → mobile-nav import boundary intact (same idea as fastSignup).
 */
import { CLIENT_NAV_EVENT, type ClientNavAction } from '@shared/utils/clientNavEvent';

export type { ClientNavAction };
export { CLIENT_NAV_EVENT };

export function requestClientNav(action: ClientNavAction) {
  window.dispatchEvent(new CustomEvent(CLIENT_NAV_EVENT, { detail: { action } }));
}
