/**
 * @app MobileApp — entry for the phone app: <Navigator/> inside `phone-root`, which scopes the
 * mobile semantic tokens. --type-scale follows settings.textSize (docs/12-design-system.md §1).
 */
import { useEffect, type CSSProperties } from 'react';
import { useAppStore } from '@shared/store';
import { CLIENT_NAV_EVENT, type ClientNavAction } from '@shared/utils/clientNavEvent';
import { Navigator } from './navigation/Navigator';
import { useNavStore } from './navigation/nav.store';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
// EXPLORATION skin (deborah-design-system.md): remove these three lines to go back.
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';

export default function MobileApp() {
  const textSize = useAppStore((s) => s.settings.textSize);

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
      <Navigator />
    </div>
  );
}
