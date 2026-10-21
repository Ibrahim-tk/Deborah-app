/**
 * @app MobileApp — entry for the phone app: <Navigator/> inside `phone-root`, which scopes the
 * mobile semantic tokens. --type-scale follows settings.textSize (docs/12-design-system.md §1).
 */
import { useEffect, type CSSProperties } from 'react';
import { CLIENT_NAV_EVENT, type ClientNavAction } from '@shared/utils/clientNavEvent';
import { Navigator } from './navigation/Navigator';
import { useNavStore } from './navigation/nav.store';
import { GlassFilters } from './ui';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
// EXPLORATION skin (deborah-design-system.md): remove these three lines to go back.
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';
// TEMPORARY colour experiment (off unless <html data-color-theme="fig">).
import './styles/mobile.theme.fig.css';

export default function MobileApp() {
  // Text size setting removed (design 2026-10-21): always the default scale, even if an old value is stored.
  const textSize = 1;

  useEffect(() => {
    const onNav = (e: Event) => {
      const action = (e as CustomEvent<{ action: ClientNavAction }>).detail?.action;
      if (action === 'home') useNavStore.getState().goHome();
      if (action === 'chat') useNavStore.getState().openAsk({ focus: true });
    };
    window.addEventListener(CLIENT_NAV_EVENT, onNav);
    return () => window.removeEventListener(CLIENT_NAV_EVENT, onNav);
  }, []);

  return (
    <div className="phone-root" style={{ '--type-scale': textSize } as CSSProperties}>
      {/* iOS liquid-glass SVG filters used by the nav-bar buttons (filter: url(#btn-glass)). */}
      <GlassFilters />
      <Navigator />
    </div>
  );
}
