/**
 * @app DesignSystemApp (web) — the desktop design system page (/design-system/web) inside `web-root phone-root`,
 * so every token and component renders with exactly the stylesheet stack WebApp loads. A design tool, not a product flow.
 */
import { Suspense, type CSSProperties } from 'react';
import { DesignSystemScreen } from './navigation';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';
import './styles/web.tokens.css';
import './styles/web.base.css';

export default function DesignSystemApp() {
  return (
    <div className="web-root phone-root" style={{ '--type-scale': 1 } as CSSProperties}>
      <Suspense fallback={null}>
        <DesignSystemScreen />
      </Suspense>
    </div>
  );
}
