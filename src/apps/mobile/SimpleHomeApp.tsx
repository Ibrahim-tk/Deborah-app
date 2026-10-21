/**
 * @app SimpleHomeApp — layout lab at /internal/home inside phone-root (same token stack as MobileApp).
 */
import { Suspense, type CSSProperties } from 'react';
import { useAppStore } from '@shared/store';
import { SimpleHomeScreen } from './navigation';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';
import './styles/mobile.theme.fig.css';

export default function SimpleHomeApp() {
  const textSize = useAppStore((s) => s.settings.textSize);
  return (
    <div className="phone-root" style={{ '--type-scale': textSize } as CSSProperties}>
      <Suspense fallback={null}>
        <SimpleHomeScreen />
      </Suspense>
    </div>
  );
}
