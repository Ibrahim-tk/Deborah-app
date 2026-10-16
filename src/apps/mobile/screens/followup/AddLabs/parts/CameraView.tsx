/**
 * Simulated camera (full screen): live lab-report preview, frame guide, white shutter →
 * captured freeze → Retake / Use photo. Prototype only — no device camera.
 */
import { useEffect, useState } from 'react';
import { useDevice } from '@shell/device';
import { Button, Icon, Overlay } from '@mobile/ui';
import { meta } from '@mobile/navigation';
import styles from './CameraView.module.css';

const PREVIEW = '/images/labs/camera-preview.jpg';

export function CameraView({
  onCancel,
  onUse,
  onLibrary,
}: {
  onCancel: () => void;
  onUse: () => void;
  /** Opens the photo library / file picker (ChatGPT-style gallery control). */
  onLibrary?: () => void;
}) {
  const { setScreen } = useDevice();
  const [captured, setCaptured] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  // Light status bar over the dark viewfinder; back to the sheet's own style on close.
  useEffect(() => {
    const title = meta('M-5.3')?.title ?? 'Add lab results';
    setScreen({ id: 'M-5.3', title: `${title} · camera`, statusBarStyle: 'light' });
    return () => setScreen({ id: 'M-5.3', title, statusBarStyle: 'dark' });
  }, [setScreen]);

  return (
    <Overlay>
      <div className={styles.root} role="dialog" aria-modal="true" aria-label="Camera">
        {/* Simulated live feed — full bleed behind the chrome. */}
        <div className={styles.feed} data-frozen={captured || undefined} aria-hidden>
          <img src={PREVIEW} alt="" className={styles.feedImg} draggable={false} />
        </div>

        <div className={styles.chrome}>
          <div className={styles.top}>
            <button type="button" className={styles.textButton} onClick={onCancel}>
              Cancel
            </button>
            {!captured && (
              <button
                type="button"
                className={styles.glassBtn}
                data-active={flashOn || undefined}
                aria-label={flashOn ? 'Flash on' : 'Flash off'}
                aria-pressed={flashOn}
                onClick={() => setFlashOn((v) => !v)}
              >
                <Icon name={flashOn ? 'flash' : 'flashOff'} size={22} />
              </button>
            )}
          </div>

          <div className={styles.viewfinder}>
            <div className={styles.frame} data-captured={captured || undefined}>
              {!captured && <p className={styles.hint}>Fit the whole report inside the frame</p>}
            </div>
          </div>

          <div className={styles.bottom}>
            {captured ? (
              <div className={styles.review}>
                <button type="button" className={styles.textButton} onClick={() => setCaptured(false)}>
                  Retake
                </button>
                <Button onClick={onUse}>Use photo</Button>
              </div>
            ) : (
              <div className={styles.controls}>
                <span className={styles.sideSlot} aria-hidden />
                <button
                  type="button"
                  className={styles.shutter}
                  aria-label="Take photo"
                  onClick={() => setCaptured(true)}
                />
                {onLibrary ? (
                  <button
                    type="button"
                    className={styles.glassBtn}
                    aria-label="Choose from library"
                    onClick={onLibrary}
                  >
                    <Icon name="image" size={22} />
                  </button>
                ) : (
                  <span className={styles.sideSlot} aria-hidden />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}
