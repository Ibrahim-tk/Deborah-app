/**
 * @ui Menu — small floating dropdown of actions anchored to a trigger (e.g. the composer's +).
 * Adapter: MUI Base UI `Menu` (unstyled; our tokens). Base UI is imported only here (CLAUDE.md rule 7).
 * Portals into the phone's overlay host so it is never clipped by the screen.
 */
import type { ReactElement } from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Icon, type IconName } from '../Icon';
import { OVERLAY_HOST_ID } from '../Overlay';
import styles from './Menu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
}

export interface MenuProps {
  /** The button that opens the menu (rendered as the Base UI trigger). */
  trigger: ReactElement;
  items: MenuItem[];
  onSelect: (id: string) => void;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
}

export function Menu({ trigger, items, onSelect, side = 'top', align = 'start', disabled }: MenuProps) {
  return (
    <BaseMenu.Root disabled={disabled}>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal container={document.getElementById(OVERLAY_HOST_ID)}>
        <BaseMenu.Positioner side={side} align={align} sideOffset={8} className={styles.positioner}>
          <BaseMenu.Popup className={styles.popup}>
            {items.map((item) => (
              <BaseMenu.Item key={item.id} className={styles.item} onClick={() => onSelect(item.id)}>
                {item.icon && <Icon name={item.icon} size={20} />}
                <span>{item.label}</span>
              </BaseMenu.Item>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
