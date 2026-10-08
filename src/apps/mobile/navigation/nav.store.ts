/**
 * Mobile navigator state (docs/04-navigation.md §2): pre-auth stack, per-tab stacks, and
 * sheet/modal layers in z-order. In memory only (no storage).
 */
import { create } from 'zustand';
import { useAppStore } from '@shared/store';
import type { ScenarioStart } from '@shared/types/scenario';
import { uid } from '@shared/utils';
import { meta, TAB_ROOTS } from './registry';
import type { Layer, NavAction, Params, Route, TabId } from './types';

const route = (id: string, params?: Params): Route => ({ key: uid('r'), id, params });

/** Chat lives one level above Home (M-2.0) so Back returns to the landing screen. */
const CHAT = 'M-2.1';
const askChat = (params?: Params): Route[] => [route(TAB_ROOTS.ask), route(CHAT, params)];

const freshTabs = (): Record<TabId, Route[]> => ({
  ask: [route(TAB_ROOTS.ask)],
  health: [route(TAB_ROOTS.health)],
  account: [route(TAB_ROOTS.account)],
});

interface NavState {
  root: 'preauth' | 'main';
  preauth: Route[];
  tabs: Record<TabId, Route[]>;
  activeTab: TabId;
  layers: Layer[];
  lastAction: NavAction;
  /** Scenario load counter last applied (see AppState.scenario.loadNonce). */
  appliedNonce: number;
  /** Transient: hides the tab bar while the composer has focus. */
  chromeHidden: boolean;
  /** Transient: the side drawer that replaced the tab bar (design direction 2026-10-08). */
  sidebarOpen: boolean;

  push: (id: string, params?: Params) => void;
  pop: () => void;
  popToRoot: () => void;
  replace: (id: string, params?: Params, transition?: 'replace' | 'fade') => void;
  switchTab: (tab: TabId) => void;
  presentSheet: (id: string, params?: Params, opts?: { detent?: 'medium' | 'large' }) => void;
  dismissSheet: () => void;
  presentModal: (id: string, params?: Params) => void;
  dismissModal: () => void;
  resetTo: (root: 'preauth' | 'main', id: string, params?: Params) => void;
  applyStart: (start: ScenarioStart, nonce: number) => void;
  /** `followup:<profileId>` · `booking:<id>` · `content:<id>` (docs/04-navigation.md §6). */
  openDeepLink: (link: string) => void;
  /** Close every layer and show the Ask tab's Conversation (M-4.5 Continue, M-5.4 send). */
  returnToConversation: () => void;
  /** Replace a mounted route's params without a transition (e.g. consume a one-shot `mode`). */
  setRouteParams: (key: string, params: Params | undefined) => void;
  setChromeHidden: (hidden: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  /**
   * Switch the active profile: Ask resets to that profile's Conversation and My Health to its
   * root; the current tab stays (docs/04-navigation.md §2). Layers close.
   */
  switchProfile: (profileId: string) => void;
  /**
   * Close layers and show the Ask tab with a fresh Conversation route carrying `params`
   * (`prefill`, `focus`, `mode: 'checkin'`) — M-7.1, M-7.3, M-7.4, M-9.2.
   */
  openAsk: (params?: Params) => void;
  /** Back to Home (M-2.0) from any section root: Ask tab, popped to its root, layers closed. */
  goHome: () => void;
}

const topModalIndex = (layers: Layer[]) => {
  for (let i = layers.length - 1; i >= 0; i--) if (layers[i].kind === 'modal') return i;
  return -1;
};

export const useNavStore = create<NavState>()((set, get) => {
  /** Update whichever stack is in front: top modal's stack, else pre-auth or the active tab. */
  const updateFront = (fn: (routes: Route[]) => Route[], action: NavAction) => {
    const s = get();
    const top = s.layers[s.layers.length - 1];
    if (top?.kind === 'modal') {
      set({
        layers: [...s.layers.slice(0, -1), { ...top, routes: fn(top.routes) }],
        lastAction: action,
      });
    } else if (s.root === 'preauth') {
      set({ preauth: fn(s.preauth), lastAction: action });
    } else {
      set({ tabs: { ...s.tabs, [s.activeTab]: fn(s.tabs[s.activeTab]) }, lastAction: action });
    }
  };

  return {
    root: 'preauth',
    preauth: [route('M-1.1')],
    tabs: freshTabs(),
    activeTab: 'ask',
    layers: [],
    lastAction: 'reset',
    appliedNonce: 0,
    chromeHidden: false,
    sidebarOpen: false,

    push: (id, params) => updateFront((r) => [...r, route(id, params)], 'push'),
    pop: () => {
      const top = get().layers[get().layers.length - 1];
      if (top?.kind === 'modal' && top.routes.length <= 1) return get().dismissModal();
      updateFront((r) => (r.length > 1 ? r.slice(0, -1) : r), 'pop');
    },
    popToRoot: () => updateFront((r) => r.slice(0, 1), 'pop'),
    replace: (id, params, transition = 'replace') =>
      updateFront(
        (r) => [...r.slice(0, -1), route(id, params)],
        transition === 'fade' ? 'fade' : 'replace',
      ),
    switchTab: (tab) => {
      const s = get();
      // Tapping the active tab pops it to its root (iOS).
      if (s.activeTab === tab)
        set({ tabs: { ...s.tabs, [tab]: s.tabs[tab].slice(0, 1) }, lastAction: 'pop' });
      else set({ activeTab: tab, lastAction: 'tab' });
    },
    presentSheet: (id, params, opts) => {
      const m = meta(id);
      const detent = opts?.detent ?? m?.detent ?? 'medium';
      const layer: Layer = {
        kind: 'sheet',
        key: uid('l'),
        route: route(id, params),
        detent,
        dismissible: m?.dismissible ?? true,
      };
      set((s) => ({ layers: [...s.layers, layer] }));
    },
    dismissSheet: () =>
      set((s) => {
        const i = s.layers.map((l) => l.kind).lastIndexOf('sheet');
        return i < 0 ? {} : { layers: s.layers.filter((_, j) => j !== i) };
      }),
    presentModal: (id, params) =>
      set((s) => ({
        layers: [...s.layers, { kind: 'modal', key: uid('l'), routes: [route(id, params)] }],
      })),
    dismissModal: () =>
      set((s) => {
        const i = topModalIndex(s.layers);
        // Dismissing a modal also removes any sheet stacked on top of it.
        return i < 0 ? {} : { layers: s.layers.slice(0, i) };
      }),
    resetTo: (root, id, params) =>
      set(() =>
        root === 'preauth'
          ? { root, preauth: [route(id, params)], layers: [], lastAction: 'fade' }
          : {
              root,
              tabs: { ...freshTabs(), ask: id === CHAT ? askChat(params) : [route(id, params)] },
              activeTab: 'ask',
              layers: [],
              lastAction: 'fade',
            },
      ),
    applyStart: (start, nonce) => {
      if (start.kind === 'lockScreen') {
        // The shell draws the lock screen from session.isLocked; the app waits behind it.
        set({
          root: 'main',
          tabs: freshTabs(),
          activeTab: 'ask',
          layers: [],
          lastAction: 'reset',
          appliedNonce: nonce,
        });
        return;
      }
      let stack = start.stack.map((id) => route(id));
      // Scenarios that start in a chat still get Home underneath it.
      if (start.root !== 'preauth' && (start.tab ?? 'ask') === 'ask' && stack[0]?.id === CHAT)
        stack = [route(TAB_ROOTS.ask), ...stack];
      const layers: Layer[] = [];
      if (start.modal) layers.push({ kind: 'modal', key: uid('l'), routes: [route(start.modal)] });
      if (start.sheet) {
        const m = meta(start.sheet);
        layers.push({
          kind: 'sheet',
          key: uid('l'),
          route: route(start.sheet),
          detent: m?.detent ?? 'medium',
          dismissible: m?.dismissible ?? true,
        });
      }
      if (start.root === 'preauth')
        set({ root: 'preauth', preauth: stack, layers, lastAction: 'reset', appliedNonce: nonce });
      else {
        const tab = start.tab ?? 'ask';
        set({
          root: 'main',
          tabs: { ...freshTabs(), [tab]: stack },
          activeTab: tab,
          layers,
          lastAction: 'reset',
          appliedNonce: nonce,
        });
      }
    },
    openDeepLink: (link) => {
      const [kind, id] = link.split(':');
      const s = get();
      if (kind === 'followup') {
        const app = useAppStore.getState();
        // The link selects its profile; switching profile resets Ask and My Health (04 §2).
        if (id && app.profiles.byId[id]) app.switchProfile(id);
        set({
          root: 'main',
          activeTab: 'ask',
          tabs: {
            ...s.tabs,
            ask: askChat({ mode: 'checkin' }),
            health: [route(TAB_ROOTS.health)],
          },
          layers: [],
          lastAction: 'reset',
        });
      } else if (kind === 'booking' || kind === 'content') {
        const target =
          kind === 'booking'
            ? route('M-8.4', { bookingId: id, mode: 'read' })
            : route('M-7.4', { itemId: id });
        set({
          root: 'main',
          activeTab: 'health',
          tabs: { ...s.tabs, health: [route(TAB_ROOTS.health), target] },
          layers: [],
          lastAction: 'reset',
        });
      }
    },
    returnToConversation: () =>
      set((s) => ({
        layers: [],
        activeTab: 'ask',
        tabs: { ...s.tabs, ask: s.tabs.ask[1]?.id === CHAT ? s.tabs.ask.slice(0, 2) : askChat() },
        lastAction: s.activeTab === 'ask' && s.tabs.ask.length > 2 ? 'pop' : 'tab',
      })),
    setRouteParams: (key, params) =>
      set((s) => {
        const fix = (routes: Route[]) => routes.map((r) => (r.key === key ? { ...r, params } : r));
        return {
          preauth: fix(s.preauth),
          tabs: { ask: fix(s.tabs.ask), health: fix(s.tabs.health), account: fix(s.tabs.account) },
          layers: s.layers.map((l) =>
            l.kind === 'modal'
              ? { ...l, routes: fix(l.routes) }
              : { ...l, route: fix([l.route])[0] },
          ),
        };
      }),
    setChromeHidden: (chromeHidden) => set({ chromeHidden }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    switchProfile: (profileId) => {
      useAppStore.getState().switchProfile(profileId);
      set((s) => ({
        tabs: { ...s.tabs, ask: [route(TAB_ROOTS.ask)], health: [route(TAB_ROOTS.health)] },
        layers: [],
        lastAction: 'reset',
      }));
    },
    goHome: () =>
      set((s) => ({
        root: 'main',
        activeTab: 'ask',
        tabs: { ...s.tabs, ask: [s.tabs.ask[0] ?? route(TAB_ROOTS.ask)] },
        layers: [],
        lastAction: 'pop',
      })),
    openAsk: (params) =>
      set((s) => {
        // From Home itself: keep the mounted Home and push the chat on top of it.
        const fromHome = s.root === 'main' && s.activeTab === 'ask' && s.layers.length === 0 && s.tabs.ask.length === 1;
        return {
          root: 'main',
          activeTab: 'ask',
          tabs: { ...s.tabs, ask: fromHome ? [s.tabs.ask[0], route(CHAT, params)] : askChat(params) },
          layers: [],
          lastAction: fromHome ? 'push' : 'tab',
        };
      }),
  };
});

export { topModalIndex };
