/**
 * @pattern CaptureCamera — simulated full-screen camera: live document preview, frame guide,
 *          white shutter → captured freeze → Retake / Use photo. Prototype only — no device camera.
 * @usedBy  M-5.3 (Add lab results), M-11.3 (Upload a document)
 * @spec    docs/ux/F05-followup-labs.md#m-53--add-your-lab-results, docs/ux/F11-documents.md#m-113--upload-a-document
 * @xref    web: — (mobile only)
 */
import { useEffect, useState } from 'react';
import { useDevice } from '@shell/device';
import { Button, Icon, Overlay } from '@mobile/ui';
import styles from './CaptureCamera.module.css';

const PREVIEW = '/images/labs/camera-preview.jpg';

export function CaptureCamera({
  screenId,
  screenTitle,
  hint = 'Fit the whole report inside the frame',
  onCancel,
  onUse,
}: {
  /** Screen the camera opens over; restores its title and status bar on close. */
  screenId: string;
  /** That screen's title (the registry's), shown in the device chrome. */
  screenTitle: string;
  hint?: string;
  onCancel: () => void;
  onUse: () => void;
  /** Opens the photo library / file picker (ChatGPT-style gallery control). */
  /** Unused since the shutter-only bar (design 2026-10-21); kept so callers compile. */
  onLibrary?: () => void;
}) {
  const { setScreen } = useDevice();
  const [captured, setCaptured] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  // Light status bar over the dark viewfinder; back to the sheet's own style on close.
  useEffect(() => {
    const title = screenTitle;
    setScreen({ id: screenId, title: `${title} · camera`, statusBarStyle: 'light' });
    return () => setScreen({ id: screenId, title, statusBarStyle: 'dark' });
  }, [setScreen, screenId, screenTitle]);

  return (
    <Overlay>
      <div className={styles.root} role="dialog" aria-modal="true" aria-label="Camera">
        {/* Simulated live feed — edge to edge from the top, rounded above a black control bar (design 2026-10-21). */}
        <div className={styles.feed} data-frozen={captured || undefined} aria-hidden>
          <img src={PREVIEW} alt="" className={styles.feedImg} draggable={false} />
        </div>

        <div className={styles.chrome}>
          <div className={styles.top}>
            {/* iOS-native round glass close (xmark) floating over the feed (design 2026-10-21). */}
            <button type="button" className={`${styles.glassBtn} ${styles.close}`} aria-label="Close camera" onClick={onCancel}>
              <Icon name="close" size={20} strokeWidth={2} />
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
              {!captured && <p className={styles.hint}>{hint}</p>}
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
              // Shutter only, centred high in the black bar (design 2026-10-21, iOS camera reference).
              <button type="button" className={styles.shutter} aria-label="Take photo" onClick={() => setCaptured(true)} />
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}
