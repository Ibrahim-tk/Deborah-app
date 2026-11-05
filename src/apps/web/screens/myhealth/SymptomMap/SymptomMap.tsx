/**
 * @screen  M-7.9 · Symptoms map
 * @flow    F07 My Health hub
 * @states  blank (UI pending)
 * @figma   —
 * @spec    Design request 2026-11-04 (OPEN: add to docs/ux/F07)
 * @xref    mobile: M-7.9 (apps/mobile/screens/myhealth/SymptomMap)
 */
import { resolveSymptomMap } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { Header } from '@web/ui';
import { useNav, useRoute } from '@web/navigation';
import styles from './SymptomMap.module.css';

export default function SymptomMap() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const profile = useAppStore(selectActiveProfile);
  // OPEN: UI pending — data wiring ready for the hypothalamic map.
  void (profile ? resolveSymptomMap(profile) : undefined);

  return (
    <div className={styles.root} data-xref="M-7.9 · Symptoms map">
      <Header title="Symptoms map" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body} />
    </div>
  );
}
