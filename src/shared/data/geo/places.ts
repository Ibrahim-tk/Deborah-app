/**
 * Cities for the City field (story 1.5 › About You). Adapter: `country-state-city` is imported only here
 * (CLAUDE.md rule 7) and loaded lazily, so its ~150k cities stay out of the main bundle.
 * Only US, UK and Australian cities are offered, A–Z, with the full address ("Pomona, California, USA").
 * Matches elsewhere in the world are reported as "region not available".
 */
export interface Place {
  id: string;
  city: string;
  state?: string;
  countryCode: string;
  country: string;
  label: string;
}

/** Supported regions → short country name in the label. */
const SUPPORTED: Record<string, string> = { US: 'USA', GB: 'UK', AU: 'Australia' };

export interface PlaceIndex {
  /** Supported cities, sorted A–Z by label. */
  places: Place[];
  /** Lower-cased names of cities outside the supported regions (for the "not available" message). */
  elsewhere: string[];
}

let cache: Promise<PlaceIndex> | null = null;

export function loadPlaces(): Promise<PlaceIndex> {
  cache ??= import('country-state-city').then(({ City, State }) => {
    const states = new Map(State.getAllStates().map((s) => [`${s.countryCode}-${s.isoCode}`, s.name]));
    const places: Place[] = [];
    const elsewhere: string[] = [];
    City.getAllCities().forEach((c, i) => {
      const country = SUPPORTED[c.countryCode];
      if (!country) return void elsewhere.push(c.name.toLowerCase());
      const state = states.get(`${c.countryCode}-${c.stateCode}`);
      const label = [c.name, state, country].filter(Boolean).join(', ');
      places.push({ id: `${c.countryCode}-${c.stateCode}-${c.name}-${i}`, city: c.name, state, countryCode: c.countryCode, country, label });
    });
    places.sort((a, b) => a.label.localeCompare(b.label));
    return { places, elsewhere };
  });
  return cache;
}

/** Empty query: the first cities A–Z. Otherwise names starting with the query first, then labels containing it. */
export function searchPlaces(index: PlaceIndex, query: string, limit = 50): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.places.slice(0, limit);
  const starts: Place[] = [];
  const contains: Place[] = [];
  for (const p of index.places) {
    if (p.city.toLowerCase().startsWith(q)) starts.push(p);
    else if (contains.length < limit && p.label.toLowerCase().includes(q)) contains.push(p);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

/** True when the query matches a city only outside the supported regions. */
export function isOutsideRegions(index: PlaceIndex, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q.length >= 2 && index.elsewhere.some((n) => n.startsWith(q));
}
