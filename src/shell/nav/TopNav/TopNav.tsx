/** @shell TopNav — fixed 56 px bar: brand · platform tabs · auto demo · journeys · state menu · reset · toggles. */
import { FlowVersionSwitch } from '../FlowVersionSwitch/FlowVersionSwitch';
import { PlatformTabs } from '../PlatformTabs';
import { StateMenu } from '../StateMenu';
import { ResetButton } from '../ResetButton';
import { DevToggles } from '../DevToggles';
import { AutoDemo } from '../AutoDemo';
import { JourneyRunner } from '../JourneyRunner';
import styles from './TopNav.module.css';

const VERSION = __APP_VERSION__.split('.').slice(0, 2).join('.');

export function TopNav() {
  return (
    <header className={styles.root}>
      <span className={styles.brand}>
        <span aria-hidden="true">◆</span> Oracle Clinician · internal v{VERSION}
      </span>
      <nav className={styles.center} aria-label="Prototype">
        <FlowVersionSwitch />
        <PlatformTabs />
      </nav>
      <div className={styles.actions}>
        <AutoDemo />
        <JourneyRunner />
        <StateMenu />
        <ResetButton />
        <DevToggles />
      </div>
    </header>
  );
}
