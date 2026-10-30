/**
 * @ui Combobox — searchable dropdown anchored to a trigger (e.g. PhoneField's country code). Search sits
 * at the top of the popup; the list filters as you type. Adapter: MUI Base UI `Combobox` (unstyled; our
 * tokens) — imported only here (CLAUDE.md rule 7). Portals into the phone's overlay host.
 */
import type { ReactElement, ReactNode } from 'react';
import { Combobox as Base } from '@base-ui/react/combobox';
import { Icon } from '../Icon';
import { OVERLAY_HOST_ID } from '../Overlay';
import styles from './Combobox.module.css';

export interface ComboboxProps<T> {
  items: T[];
  value: T | null;
  onValueChange: (value: T) => void;
  /** Text used for search filtering and screen readers. */
  itemToString: (item: T) => string;
  itemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** The control that opens the popup (rendered as the Base UI trigger). */
  trigger: ReactElement;
  searchPlaceholder?: string;
  /** Show the search input at the top of the popup. */
  searchable?: boolean;
  emptyText?: string;
  label: string;
  /** Pre-filtered results for large lists (e.g. world cities): turns off built-in filtering. */
  filteredItems?: T[];
  onSearch?: (query: string) => void;
  /** Popup as wide as the trigger, aligned to its start (full-width form fields). */
  matchTrigger?: boolean;
}

export function Combobox<T>({ items, value, onValueChange, itemToString, itemKey, renderItem, trigger, searchPlaceholder = 'Search', searchable = true, emptyText = 'No results', label, filteredItems, onSearch, matchTrigger }: ComboboxProps<T>) {
  return (
    <Base.Root
      items={items}
      value={value}
      onValueChange={(v) => v !== null && onValueChange(v as T)}
      itemToStringLabel={itemToString}
      isItemEqualToValue={(a, b) => itemKey(a as T) === itemKey(b as T)}
      {...(onSearch && { filter: null, filteredItems, onInputValueChange: (q: string) => onSearch(q) })}
    >
      <Base.Trigger render={trigger} aria-label={label} />
      <Base.Portal container={document.getElementById(OVERLAY_HOST_ID)}>
        <Base.Positioner side="bottom" align={matchTrigger ? 'start' : 'end'} sideOffset={8} className={matchTrigger ? `${styles.positioner} ${styles.matchTrigger}` : styles.positioner}>
          <Base.Popup className={styles.popup} aria-label={label}>
            {searchable && (
              <label className={styles.search}>
                <Icon name="search" size={18} />
                <Base.Input className={styles.input} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
              </label>
            )}
            <Base.Empty className={styles.empty}>{emptyText}</Base.Empty>
            <Base.List className={styles.list}>
              {(item: T) => (
                <Base.Item key={itemKey(item)} value={item} className={styles.item}>
                  {renderItem(item)}
                  <Base.ItemIndicator className={styles.check}>
                    <Icon name="check" size={18} />
                  </Base.ItemIndicator>
                </Base.Item>
              )}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
