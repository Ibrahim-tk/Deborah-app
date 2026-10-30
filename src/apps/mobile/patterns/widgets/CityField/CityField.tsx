/**
 * @pattern CityField — one searchable City field for the whole world (story 1.5 › About You). Replaces separate
 *     country / state / city inputs. US, UK and Australian cities only, A–Z, one line each
 *     ("Pomona, California, USA"); a city elsewhere shows "Region not available".
 * @xref web: apps/web/patterns/widgets/CityField
 */
import { useEffect, useState } from 'react';
import { isOutsideRegions, loadPlaces, searchPlaces, type Place, type PlaceIndex } from '@shared/data/geo/places';
import { Combobox, Icon } from '@mobile/ui';
import styles from './CityField.module.css';

export type { Place };

export interface CityFieldProps {
  label?: string;
  value: Place | null;
  onChange: (place: Place) => void;
  error?: string;
}

export function CityField({ label = 'City', value, onChange, error }: CityFieldProps) {
  const [index, setIndex] = useState<PlaceIndex | null>(null);
  const [query, setQuery] = useState('');
  // Lazy: the city list loads the first time this field shows up.
  useEffect(() => { let live = true; loadPlaces().then((p) => { if (live) setIndex(p); }); return () => { live = false; }; }, []);
  const results = index ? searchPlaces(index, query) : [];
  const empty = !index
    ? 'Loading cities…'
    : isOutsideRegions(index, query)
      ? 'Region not available. Your Oracle is available in the US, UK and Australia.'
      : 'No matching cities.';

  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>
      <Combobox<Place>
        label={label}
        items={value ? [value, ...results.filter((r) => r.id !== value.id)] : results}
        filteredItems={results}
        onSearch={setQuery}
        matchTrigger
        value={value}
        onValueChange={onChange}
        itemKey={(p) => p.id}
        itemToString={(p) => p.label}
        searchPlaceholder="Search any city"
        emptyText={empty}
        renderItem={(p) => (
          <span className={styles.row}>
            {p.city}<span className={styles.where}>{p.label.slice(p.city.length)}</span>
          </span>
        )}
        trigger={
          <button type="button" className={styles.trigger} data-invalid={error ? '' : undefined}>
            <span className={value ? styles.value : `${styles.value} ${styles.placeholder}`}>{value ? value.label : 'Search your city'}</span>
            <span className={styles.icon}><Icon name="search" size={20} /></span>
          </button>
        }
      />
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
}
