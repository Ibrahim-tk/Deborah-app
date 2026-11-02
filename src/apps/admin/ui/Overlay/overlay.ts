/** Floating Base UI parts (menus, selects, dialogs, tooltips) portal here: inside the admin root, so they
 *  inherit our tokens (which live on `.web-root`, not on <body>). AdminApp attaches the host element.
 *  A ref, not a lookup, so portals that mount before the host exists still resolve it. */
export const overlayRef: { current: HTMLElement | null } = { current: null };
export const attachOverlay = (el: HTMLDivElement | null) => {
  overlayRef.current = el;
};
