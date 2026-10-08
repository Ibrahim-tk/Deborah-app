/** @shell DevToggles — review aids kept in the shell store; Reset never clears them (docs/03 §4). */
import { useShellStore, type NetworkSpeed, type ShellTheme } from '../../shell.store';
import { Popover } from '../Popover';
import { MenuCheck, MenuChoice, MenuSection } from '../MenuParts';

const SPEEDS: { value: NetworkSpeed; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow ×3' },
  { value: 'instant', label: 'Instant' },
];

const THEMES: { value: ShellTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function DevToggles() {
  const toggles = useShellStore((s) => s.toggles);
  const setToggle = useShellStore((s) => s.setToggle);
  const theme = useShellStore((s) => s.theme);
  const setTheme = useShellStore((s) => s.setTheme);
  const showNotes = useShellStore((s) => s.showNotes);
  const setShowNotes = useShellStore((s) => s.setShowNotes);
  const webFullBleed = useShellStore((s) => s.webFullBleed);
  const setWebFullBleed = useShellStore((s) => s.setWebFullBleed);

  return (
    <Popover trigger={<><span aria-hidden="true">⚙</span> Toggles</>}>
      {() => (
        <>
          <MenuSection title="Review">
            <MenuCheck label="Show screen notes" checked={showNotes} onChange={setShowNotes} />
            <MenuCheck label="Highlight placeholder content" checked={toggles.highlightPlaceholders} onChange={(v) => setToggle('highlightPlaceholders', v)} />
            <MenuCheck label="Show tap targets" checked={toggles.showTapTargets} onChange={(v) => setToggle('showTapTargets', v)} />
            <MenuCheck label="Show IDs on hover" checked={toggles.showIds} onChange={(v) => setToggle('showIds', v)} />
            <MenuCheck label="Reduced motion" checked={toggles.reducedMotion} onChange={(v) => setToggle('reducedMotion', v)} />
            <MenuChoice label="Network" value={toggles.network} options={SPEEDS} onChange={(v) => setToggle('network', v)} />
          </MenuSection>
          <MenuSection title="Stage">
            <MenuChoice label="Theme" value={theme} options={THEMES} onChange={setTheme} />
            <MenuCheck label="Web: full-bleed (no browser frame)" checked={webFullBleed} onChange={setWebFullBleed} />
          </MenuSection>
        </>
      )}
    </Popover>
  );
}
