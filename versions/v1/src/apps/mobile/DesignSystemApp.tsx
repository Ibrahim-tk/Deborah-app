/**
 * @app DesignSystemApp — the design system page (/design-system) inside `phone-root`, so every token and
 * component renders with exactly the stylesheet stack MobileApp loads. A design tool, not part of the product flow.
 */
import { Suspense, type CSSProperties } from 'react';
import { useAppStore } from '@flow-v1/shared/store';
import { DesignSystemScreen } from './navigation';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';

export default function DesignSystemApp() {
  const textSize = useAppStore((s) => s.settings.textSize);
  return (
    <div className="phone-root" style={{ '--type-scale': textSize } as CSSProperties}>
      <Suspense fallback={null}>
        <DesignSystemScreen />
      </Suspense>
    </div>
  );
}
