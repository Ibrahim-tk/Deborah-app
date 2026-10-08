/**
 * Shell store — platform chrome state, separate from the app store (docs/03-prototype-shell.md §4).
 * In memory only (no storage). Reset never clears toggles. `screen` and `toast` are transient.
 */
import { create } from 'zustand';
import { DEFAULT_SCENARIO_ID } from '@shared/scenarios';

export type DeviceScale = 'fit' | '100' | '75';
export type NetworkSpeed = 'normal' | 'slow' | 'instant';
export type ShellTheme = 'light' | 'dark';

export interface DevToggles {
  highlightPlaceholders: boolean;
  network: NetworkSpeed;
  reducedMotion: boolean;
  showTapTargets: boolean;
  showIds: boolean;
}

/** What the top-most visible screen reports through useDevice().setScreen(). */
export interface ScreenInfo {
  id: string;
  title: string;
  statusBarStyle: 'dark' | 'light';
}

interface ShellState {
  scenarioId: string;
  scale: DeviceScale;
  simKeyboard: boolean;
  showCaption: boolean;
  /** Sticky screen-story note beside the phone (remembered in this browser). */
  showNotes: boolean;
  theme: ShellTheme;
  webFullBleed: boolean;
  lastWebPath: string;
  toggles: DevToggles;
  screen: ScreenInfo | null;
  toast: { id: number; message: string } | null;

  setScenario: (id: string) => void;
  setScale: (scale: DeviceScale) => void;
  setSimKeyboard: (on: boolean) => void;
  setShowCaption: (on: boolean) => void;
  setShowNotes: (on: boolean) => void;
  setTheme: (theme: ShellTheme) => void;
  setWebFullBleed: (on: boolean) => void;
  setLastWebPath: (path: string) => void;
  setToggle: <K extends keyof DevToggles>(key: K, value: DevToggles[K]) => void;
  setScreen: (screen: ScreenInfo | null) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

const NOTES_KEY = 'oc.show-notes';
function readShowNotes(): boolean {
  try {
    return localStorage.getItem(NOTES_KEY) !== '0';
  } catch {
    return true;
  }
}

export const useShellStore = create<ShellState>()((set) => ({
  scenarioId: DEFAULT_SCENARIO_ID,
  scale: 'fit',
  simKeyboard: false,
  showCaption: true,
  showNotes: readShowNotes(),
  theme: 'light',
  webFullBleed: false,
  lastWebPath: '/web',
  toggles: {
    highlightPlaceholders: false,
    network: 'normal',
    reducedMotion: false,
    showTapTargets: false,
    showIds: false,
  },
  screen: null,
  toast: null,

  setScenario: (scenarioId) => set({ scenarioId }),
  setScale: (scale) => set({ scale }),
  setSimKeyboard: (simKeyboard) => set({ simKeyboard }),
  setShowCaption: (showCaption) => set({ showCaption }),
  setShowNotes: (showNotes) => {
    try {
      localStorage.setItem(NOTES_KEY, showNotes ? '1' : '0');
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
    set({ showNotes });
  },
  setTheme: (theme) => set({ theme }),
  setWebFullBleed: (webFullBleed) => set({ webFullBleed }),
  setLastWebPath: (lastWebPath) => set({ lastWebPath }),
  setToggle: (key, value) => set((s) => ({ toggles: { ...s.toggles, [key]: value } })),
  setScreen: (screen) => set({ screen }),
  showToast: (message) => set({ toast: { id: Date.now(), message } }),
  clearToast: () => set({ toast: null }),
}));
