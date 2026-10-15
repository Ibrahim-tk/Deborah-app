/** Switch the entire flow, not just the skin. Version 2 starts as an identical editable copy. */
import { useLocation } from 'react-router-dom';
import { flowVersionFrom, flowVersionHref } from '@shared/utils/flowVersion';
import styles from './FlowVersionSwitch.module.css';

export function FlowVersionSwitch() {
  const { pathname, search, hash } = useLocation();
  const selected = flowVersionFrom(search);
  return (
    <div className={styles.root} role="group" aria-label="Flow version">
      {(['v1', 'v2'] as const).map((version) => (
        <button key={version} type="button" className={styles.button} aria-pressed={selected === version}
          title={`Open Version ${version === 'v1' ? '1 (saved flow)' : '2 (editable copy)'} — reloads this scenario`}
          onClick={() => { if (selected !== version) window.location.assign(flowVersionHref(pathname, search, hash, version)); }}>
          Version {version === 'v1' ? '1' : '2'}
        </button>
      ))}
    </div>
  );
}
