/** @ui Menu — Base UI Menu: any ref-forwarding element as trigger, items with optional icon, destructive tone. */
import type { ReactElement } from 'react';
import { Menu as Base } from '@base-ui/react/menu';
import { Icon, type IconName } from '../Icon';
import { overlayRef } from '../Overlay';
import styles from './Menu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  destructive?: boolean;
}

export interface MenuProps {
  trigger: ReactElement;
  items: MenuItem[];
  onSelect: (id: string) => void;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
}

export function Menu({ trigger, items, onSelect, side = 'bottom', align = 'start' }: MenuProps) {
  return (
    <Base.Root>
      <Base.Trigger render={trigger} />
      <Base.Portal container={overlayRef}>
        <Base.Positioner side={side} align={align} sideOffset={6} className={styles.positioner}>
          <Base.Popup className={styles.popup}>
            {items.map((it) => (
              <Base.Item key={it.id} className={styles.item} data-destructive={it.destructive || undefined} onClick={() => onSelect(it.id)}>
                {it.icon && <Icon name={it.icon} size={18} />}
                <span>{it.label}</span>
              </Base.Item>
            ))}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
