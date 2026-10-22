/**
 * @app WebApp — desktop twin of MobileApp. Same flows/story via copied navigator + screens.
 * Mobile is locked; this tree is isolated under @web. Composer look stays the mobile twin.
 */
import { useEffect, type CSSProperties } from 'react';
import { CLIENT_NAV_EVENT, type ClientNavAction } from '@shared/utils/clientNavEvent';
import { Navigator } from './navigation/Navigator';
import { useNavStore } from './navigation/nav.store';
import { GlassFilters } from './ui';
import './styles/mobile.tokens.css';
import './styles/mobile.refresh.css';
import './styles/mobile.base.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles/mobile.skin.deborah.css';
import './styles/web.tokens.css';
import './styles/web.base.css';
import styles from './WebApp.module.css';

export default function WebApp() {
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
    <div
      className={`web-root phone-root ${styles.root}`}
      style={{ '--type-scale': textSize } as CSSProperties}
    >
      <GlassFilters />
      <Navigator />
    </div>
  );
}
