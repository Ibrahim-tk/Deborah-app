/**
 * @app MobileApp — entry for the phone app: <Navigator/> inside `phone-root`, which scopes the
 * mobile semantic tokens. --type-scale follows settings.textSize (docs/12-design-system.md §1).
 */
import type { CSSProperties } from 'react';
import { useAppStore } from '@shared/store';
import { Navigator } from './navigation/Navigator';
import './styles/mobile.tokens.css';
import './styles/mobile.base.css';

export default function MobileApp() {
  const textSize = useAppStore((s) => s.settings.textSize);
  return (
    <div className="phone-root" style={{ '--type-scale': textSize } as CSSProperties}>
      <Navigator />
    </div>
  );
}
