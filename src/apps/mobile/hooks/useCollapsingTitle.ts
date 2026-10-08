/** Large-title tab roots: the title folds into the bar once the content scrolls (DESIGN.md › Navigation). */
import { useCallback, useState, type UIEvent } from 'react';

const THRESHOLD = 12;

export function useCollapsingTitle() {
  const [collapsed, setCollapsed] = useState(false);
  const onScroll = useCallback((e: UIEvent<HTMLElement>) => setCollapsed(e.currentTarget.scrollTop > THRESHOLD), []);
  return { collapsed, onScroll };
}
