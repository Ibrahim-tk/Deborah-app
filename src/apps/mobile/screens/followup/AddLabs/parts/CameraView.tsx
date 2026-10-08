/**
 * Simulated camera (full screen): dark viewfinder, frame guide, shutter → captured thumbnail →
 * Retake / Use photo. Imitates the system camera, so it uses system styling. No camera access.
 */
import { useEffect, useState } from 'react';
import { useDevice } from '@shell/device';
import { Button, Overlay } from '@mobile/ui';
import { meta } from '@mobile/navigation';
import styles from './CameraView.module.css';

export function CameraView({ onCancel, onUse }: { onCancel: () => void; onUse: () => void }) {
  const { setScreen } = useDevice();
  const [captured, setCaptured] = useState(false);

  // Light status bar over the black viewfinder; back to the sheet's own style on close.
  useEffect(() => {
    const title = meta('M-5.3')?.title ?? 'Add lab results';
    setScreen({ id: 'M-5.3', title: `${title} · camera`, statusBarStyle: 'light' });
    return () => setScreen({ id: 'M-5.3', title, statusBarStyle: 'dark' });
  }, [setScreen]);

  return (
    <Overlay>
      <div className={styles.root} role="dialog" aria-modal="true" aria-label="Camera">
        <div className={styles.top}>
          <button type="button" className={styles.textButton} onClick={onCancel}>Cancel</button>
        </div>
        <div className={styles.viewfinder}>
          <div className={styles.frame} data-captured={captured || undefined}>
            {captured ? (
              <div className={styles.paper} aria-label="Captured lab report">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className={styles.line} data-short={i % 3 === 2 || undefined} />
                ))}
              </div>
            ) : (
              <p className={styles.hint}>Fit the whole report inside the frame</p>
            )}
          </div>
        </div>
        <div className={styles.bottom}>
          {captured ? (
            <div className={styles.review}>
              <button type="button" className={styles.textButton} onClick={() => setCaptured(false)}>Retake</button>
              <Button onClick={onUse}>Use photo</Button>
            </div>
          ) : (
            <button type="button" className={styles.shutter} aria-label="Take photo" onClick={() => setCaptured(true)} />
          )}
        </div>
      </div>
    </Overlay>
  );
}
