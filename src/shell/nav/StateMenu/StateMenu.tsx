/**
 * @shell StateMenu — Scenarios · Simulate events · Device (docs/03-prototype-shell.md §2).
 * Deliberately has no list of screens: screens are reached by using the app.
 */
import { useLocation } from 'react-router-dom';
import { isLoadable, SCENARIOS, SCENARIO_GROUPS } from '@shared/scenarios';
import { useAppStore } from '@shared/store';
import { useShellStore, type DeviceScale } from '../../shell.store';
import { useScenario } from '../../useScenario';
import { Popover } from '../Popover';
import { MenuCheck, MenuChoice, MenuItem, MenuSection } from '../MenuParts';
import styles from './StateMenu.module.css';

const SCALES: { value: DeviceScale; label: string }[] = [
  { value: 'fit', label: 'Fit' },
  { value: '100', label: '100%' },
  { value: '75', label: '75%' },
];

export function StateMenu() {
  const isWeb = useLocation().pathname.startsWith('/web');
  const { scenario, select } = useScenario();
  const scale = useShellStore((s) => s.scale);
  const setScale = useShellStore((s) => s.setScale);
  const simKeyboard = useShellStore((s) => s.simKeyboard);
  const setSimKeyboard = useShellStore((s) => s.setSimKeyboard);
  const showCaption = useShellStore((s) => s.showCaption);
  const setShowCaption = useShellStore((s) => s.setShowCaption);
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
      <span className={styles.muted}>State:</span> {isWeb ? '—' : (scenario?.label ?? 'None')} <span aria-hidden="true">▾</span>
    </>
  );

  return (
    <Popover trigger={trigger} width="lg">
      {(close) =>
        isWeb ? (
          <p className={styles.empty}>No web scenarios yet.</p>
        ) : (
          <>
            <MenuSection title="Scenarios">
              {SCENARIO_GROUPS.map((group) => (
                <div key={group} className={styles.group}>
                  <span className={styles.groupLabel}>{group}</span>
                  {SCENARIOS.filter((s) => s.group === group).map((s) => (
                    <MenuItem
                      key={s.id}
                      label={`${s.id} · ${s.label}`}
                      description={isLoadable(s.id) ? `${s.description} Starts at ${s.startsAt}.` : `Available from phase ${s.phase}.`}
                      disabled={!isLoadable(s.id)}
                      active={s.id === scenario?.id}
                      onSelect={() => {
                        select(s.id);
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
                description="Delivers the reminder for the next booking with Deborah now."
                onSelect={() => {
                  if (!deliverBookingReminderNow()) showToast('No booking yet — book Deborah first');
                  close();
                }}
              />
            </MenuSection>
            <MenuSection title="Device">
              <MenuChoice label="Scale" value={scale} options={SCALES} onChange={setScale} />
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
