/**
 * @screen  (any planned ID) · Planned placeholder
 * @flow    —
 * @states  default
 * @spec    docs/11-build-plan.md — the registry entry names the phase that builds this screen
 * @xref    web: — not applicable
 *
 * Keeps every link reachable with a way back while later phases fill in real screens.
 */
import { Button, Header, IconButton, Sheet } from '@mobile/ui';
import { meta, useNav, useRoute } from '@mobile/navigation';
import styles from './Planned.module.css';

export default function Planned() {
  const { route, container, canGoBack, previousTitle } = useRoute();
  const { pop, dismissModal, dismissSheet } = useNav();
  const m = meta(route.id);
  const body = (
    <div className={styles.body}>
      <p className={styles.id}>{route.id}</p>
      <h2 className={styles.title}>{m?.title}</h2>
      <p className={styles.text}>This screen arrives in phase {m?.planned}. Its spec is ready in {m?.spec}.</p>
    </div>
  );

  if (container === 'sheet') {
    return (
      <Sheet footer={<Button variant="secondary" fullWidth onClick={dismissSheet}>Close</Button>}>
        {body}
      </Sheet>
    );
  }
  return (
    <div className={styles.root} data-xref={`${route.id} · ${m?.title} (planned)`}>
      <Header
        title={m?.title}
        onBack={container === 'stack' && canGoBack ? pop : undefined}
        backLabel={previousTitle}
        right={container === 'modal' ? <IconButton icon="close" label="Close" onClick={dismissModal} /> : undefined}
      />
      {body}
    </div>
  );
}
