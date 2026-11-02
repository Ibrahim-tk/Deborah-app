/**
 * @app DesignMdApp — the DESIGN.md viewer (/design-md) inside `phone-root`, so every token and
 * component renders with exactly the stylesheet stack MobileApp loads. A design tool, not part of the product flow.
 */
import { Suspense, type CSSProperties } from 'react';
import { useAppStore } from '@shared/store';
import { DesignMdScreen } from './navigation';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';
// TEMPORARY colour experiment (off unless <html data-color-theme="fig">).
import './styles/mobile.theme.fig.css';

export default function DesignMdApp() {
  const textSize = useAppStore((s) => s.settings.textSize);
  return (
    <div className="phone-root" style={{ '--type-scale': textSize } as CSSProperties}>
      <Suspense fallback={null}>
        <DesignMdScreen />
      </Suspense>
    </div>
  );
}
