/**
 * @shell StateMenu — Screens · Simulate events · Device (docs/03-prototype-shell.md §2).
 * Internal surface: a grouped list of every signed-in screen by name (designer request 2026-10-19),
 * then every app state (scenario) by name — no descriptions.
 */
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { isLoadable, SCENARIOS, SCENARIO_GROUPS } from '@shared/scenarios';
import { useAppStore } from '@shared/store';
import { useShellStore, type DeviceScale } from '../../shell.store';
import { useScenario } from '../../useScenario';
import { Popover } from '../Popover';
import { MenuCheck, MenuChoice, MenuItem, MenuSection } from '../MenuParts';
import { SCREEN_GROUPS, openScreen } from './screens';
import styles from './StateMenu.module.css';

const SCALES: { value: DeviceScale; label: string }[] = [
  { value: 'fit', label: 'Fit' },
  { value: '100', label: '100%' },
  { value: '75', label: '75%' },
];

export function StateMenu() {
  const isWeb = useLocation().pathname.startsWith('/web');
  const { scenario, select } = useScenario();
  const [screen, setScreen] = useState<string>();
  const scale = useShellStore((s) => s.scale);
  const setScale = useShellStore((s) => s.setScale);
  const simKeyboard = useShellStore((s) => s.simKeyboard);
  const setSimKeyboard = useShellStore((s) => s.setSimKeyboard);
  const showCaption = useShellStore((s) => s.showCaption);
  const setShowCaption = useShellStore((s) => s.setShowCaption);
  const colorTheme = useShellStore((s) => s.colorTheme);
  const setColorTheme = useShellStore((s) => s.setColorTheme);
  const showToast = useShellStore((s) => s.showToast);
  const advanceClock = useAppStore((s) => s.advanceClock);
  const setDev = useAppStore((s) => s.setDev);
  const failNext = useAppStore((s) => s.dev.failNext);
  const isLocked = useAppStore((s) => s.isLocked);
  const setLocked = useAppStore((s) => s.setLocked);
  const deliverFollowUpNow = useAppStore((s) => s.deliverFollowUpNow);
  const deliverBookingReminderNow = useAppStore((s) => s.deliverBookingReminderNow);

  const trigger = (
    <>
      <span className={styles.muted}>Screen:</span> {isWeb ? '—' : (screen ?? 'Choose')} <span aria-hidden="true">▾</span>
    </>
  );

  return (
    <Popover trigger={trigger} width="lg">
      {(close) =>
        isWeb ? (
          <p className={styles.empty}>No web scenarios yet.</p>
        ) : (
          <>
            <MenuSection title="Screens">
              {SCREEN_GROUPS.map((group) => (
                <div key={group.title} className={styles.group}>
                  <span className={styles.groupLabel}>{group.title}</span>
                  {group.screens.map((e) => (
                    <MenuItem
                      key={`${e.id}-${e.name}`}
                      label={e.name}
                      active={e.name === screen}
                      onSelect={() => {
                        openScreen(e, select);
                        setScreen(e.name);
                        close();
                      }}
                    />
                  ))}
                </div>
              ))}
            </MenuSection>
            <MenuSection title="States">
              {SCENARIO_GROUPS.map((group) => (
                <div key={group} className={styles.group}>
                  <span className={styles.groupLabel}>{group}</span>
                  {SCENARIOS.filter((s) => s.group === group && isLoadable(s.id)).map((s) => (
                    <MenuItem
                      key={s.id}
                      label={s.label}
                      active={!screen && s.id === scenario?.id}
                      onSelect={() => {
                        select(s.id);
                        setScreen(undefined);
                        close();
                      }}
                    />
                  ))}
                </div>
              ))}
            </MenuSection>
            <MenuSection title="Simulate events">
              <MenuItem
                label="Deliver follow-up notification"
                description={isLocked ? 'Appears as a card on the lock screen.' : 'Appears as a banner at the top of the phone.'}
                onSelect={() => {
                  deliverFollowUpNow();
                  close();
                }}
              />
              <MenuItem
                label={isLocked ? 'Unlock phone' : 'Lock phone'}
                description={isLocked ? 'Back to the last screen; unread notifications arrive as a banner.' : 'Shows the lock screen with any unread notifications.'}
                onSelect={() => {
                  setLocked(!isLocked);
                  close();
                }}
              />
              <MenuItem
                label="Fast-forward 2 weeks"
                description="Advances the simulated clock and delivers anything due."
                onSelect={() => {
                  advanceClock(14);
                  showToast('Clock moved forward 2 weeks');
                  close();
                }}
              />
              <MenuItem
                label="Fail next AI response"
                description={failNext ? 'Armed: the next answer will show the error state.' : 'The next answer shows the error state.'}
                active={failNext}
                onSelect={() => {
                  setDev({ failNext: !failNext });
                  showToast(failNext ? 'Next response will succeed' : 'Next AI response will fail');
                  close();
                }}
              />
              <MenuItem
                label="Booking reminder"
                description="Delivers the reminder for the next booking with the Oracle now."
                onSelect={() => {
                  if (!deliverBookingReminderNow()) showToast('No booking yet — book a consultation first');
                  close();
                }}
              />
            </MenuSection>
            <MenuSection title="Device">
              <MenuChoice label="Scale" value={scale} options={SCALES} onChange={setScale} />
              {/* TEMPORARY colour experiment (mobile.theme.fig.css). */}
              <MenuChoice
                label="Color theme"
                value={colorTheme}
                options={[{ value: 'original', label: 'Original' }, { value: 'fig', label: 'Fig' }]}
                onChange={setColorTheme}
              />
              <MenuCheck label="Simulated keyboard" checked={simKeyboard} onChange={setSimKeyboard} />
              <MenuCheck label="Show screen caption" checked={showCaption} onChange={setShowCaption} />
              {/* Appearance (Light / Dark) is omitted: DESIGN.md has no dark mode in v1. */}
            </MenuSection>
          </>
        )
      }
    </Popover>
  );
}
