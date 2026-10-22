/** Desktop master–detail breakpoint (L-master-detail). */
import { useEffect, useState } from 'react';

const QUERY = '(min-width: 960px)';

export function useWideSplit(query = QUERY): boolean {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return wide;
}
