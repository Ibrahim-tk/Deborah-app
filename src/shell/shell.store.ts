/**
 * Shell store — platform chrome state, separate from the app store (docs/03-prototype-shell.md §4).
 * In memory only (no storage). Reset never clears toggles. `screen` and `toast` are transient.
 */
import { create } from 'zustand';
import { DEFAULT_SCENARIO_ID } from '@shared/scenarios';

export type DeviceScale = 'fit' | '100' | '75';
export type NetworkSpeed = 'normal' | 'slow' | 'instant';
export type ShellTheme = 'light' | 'dark';
/** Design variation for Splash, Consent and Home backgrounds (1 = original). */
export type DesignVariant = 1 | 2 | 3 | 4;

export interface DevToggles {
  highlightPlaceholders: boolean;
  network: NetworkSpeed;
  reducedMotion: boolean;
  showTapTargets: boolean;
  showIds: boolean;
  /** Plan C-20: the decision nodes the active conversation took, beside the phone. */
  showJourney: boolean;
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
  /** TEMPORARY colour experiment: Original or Fig (mobile.theme.fig.css). */
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;
  /** Sticky screen-story note beside the phone (remembered in this browser). */
  showNotes: boolean;
  theme: ShellTheme;
  variant: DesignVariant;
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
  setVariant: (variant: DesignVariant) => void;
  setWebFullBleed: (on: boolean) => void;
  setLastWebPath: (path: string) => void;
  setToggle: <K extends keyof DevToggles>(key: K, value: DevToggles[K]) => void;
  setScreen: (screen: ScreenInfo | null) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export type ColorTheme = 'original' | 'fig';
const COLOR_THEME_KEY = 'oc.color-theme';
/** Applies the theme to <html> (the fig CSS is scoped to [data-color-theme='fig']). */
function applyColorTheme(t: ColorTheme) {
  if (t === 'fig') document.documentElement.dataset.colorTheme = 'fig';
  else delete document.documentElement.dataset.colorTheme;
}
function readColorTheme(): ColorTheme {
  let t: ColorTheme = 'original';
  try {
    if (localStorage.getItem(COLOR_THEME_KEY) === 'fig') t = 'fig';
  } catch {
    // Storage unavailable: start on the original theme.
  }
  applyColorTheme(t);
  return t;
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
  colorTheme: readColorTheme(),
  showNotes: readShowNotes(),
  theme: 'light',
  variant: 1,
  webFullBleed: false,
  lastWebPath: '/internal/web',
  toggles: {
    highlightPlaceholders: false,
    network: 'normal',
    reducedMotion: false,
    showTapTargets: false,
    showIds: false,
    showJourney: false,
  },
  screen: null,
  toast: null,

  setScenario: (scenarioId) => set({ scenarioId }),
  setScale: (scale) => set({ scale }),
  setSimKeyboard: (simKeyboard) => set({ simKeyboard }),
  setShowCaption: (showCaption) => set({ showCaption }),
  setColorTheme: (colorTheme) => {
    applyColorTheme(colorTheme);
    try {
      localStorage.setItem(COLOR_THEME_KEY, colorTheme);
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
    set({ colorTheme });
  },
  setShowNotes: (showNotes) => {
    try {
      localStorage.setItem(NOTES_KEY, showNotes ? '1' : '0');
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
    set({ showNotes });
  },
  setTheme: (theme) => set({ theme }),
  setVariant: (variant) => set({ variant }),
  setWebFullBleed: (webFullBleed) => set({ webFullBleed }),
  setLastWebPath: (lastWebPath) => set({ lastWebPath }),
  setToggle: (key, value) => set((s) => ({ toggles: { ...s.toggles, [key]: value } })),
  setScreen: (screen) => set({ screen }),
  showToast: (message) => set({ toast: { id: Date.now(), message } }),
  clearToast: () => set({ toast: null }),
}));
