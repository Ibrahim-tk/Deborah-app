/**
 * @screen  M-5.3 · Add your lab results
 * @flow    F05 Follow-up & return with labs
 * @states  choose · camera (viewfinder → captured) · processing ("Reading your report…")
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547
 * @spec    docs/ux/F05-followup-labs.md#m-53--add-your-lab-results
 * @xref    web: W-5.3 (apps/web/screens/followup/AddLabs) — not built
 *
 * Prototype: camera or file upload only (image / PDF). No manual entry, no trust/padlock line.
 */
import { useEffect, useRef, useState } from 'react';
import { Icon, OptionList, OptionRow, ProgressBar, ProgressStatus, Sheet } from '@mobile/ui';
import { simBetween } from '@mobile/hooks/simTiming';
import { CaptureCamera } from '@mobile/patterns/widgets';
import { meta, useNav, useScreenParams } from '@mobile/navigation';
import styles from './AddLabs.module.css';

type Source = 'photo' | 'pdf';

export default function AddLabs() {
  const { dismissSheet, presentModal } = useNav();
  const fileInput = useRef<HTMLInputElement>(null);
  // Composer + menu: Camera opens the viewfinder straight away; Upload opens the file picker.
  const { source: start0 } = useScreenParams<{ source?: 'camera' | 'upload' }>();
  const [camera, setCamera] = useState(start0 === 'camera');
  const [processing, setProcessing] = useState<{ source: Source; fileName: string } | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulated extraction: 1.5–2.5 s, then the confirm screen with the sample-a values.
  // Only depend on `processing` — nav helpers from useNav() are new refs each render and would
  // clear the timer before M-5.4 opens (labs journey idle on “Reading your report…”).
  useEffect(() => {
    if (!processing) return;
    const total = simBetween(1500, 2500);
    const started = Date.now();
    const { source, fileName } = processing;
    const tick = window.setInterval(() => setProgress(Math.min(1, (Date.now() - started) / Math.max(total, 1))), 80);
    const done = window.setTimeout(() => {
      dismissSheet();
      presentModal('M-5.4', { source, fileName });
    }, total);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot per processing payload
  }, [processing]);

  useEffect(() => {
    if (start0 === 'upload') fileInput.current?.click();
  }, [start0]);

  const start = (source: Source, fileName: string) => {
    setProgress(0);
    setProcessing({ source, fileName });
  };

  return (
    <div data-xref="M-5.3 · Add lab results">
      <Sheet title="Add your lab results">
        {processing ? (
          <div className={styles.processing}>
            <p className={styles.file}>
              <Icon name={processing.source === 'pdf' ? 'pdf' : 'camera'} size={22} /> {processing.fileName}
            </p>
            <ProgressBar value={progress} label="Reading your report" />
            <ProgressStatus label="Reading your report…" />
          </div>
        ) : (
          <div className={styles.body}>
            <OptionList label="How would you like to add them?">
              <OptionRow leadingIcon="camera" chevron onSelect={() => setCamera(true)}>
                Camera
              </OptionRow>
              <OptionRow leadingIcon="upload" chevron onSelect={() => fileInput.current?.click()}>
                Upload
              </OptionRow>
            </OptionList>
          </div>
        )}
      </Sheet>

      {/* Real picker; the file is never read — only its name is shown (prototype, no upload). */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*,application/pdf"
        className={styles.hiddenInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) start(file.type.startsWith('image/') ? 'photo' : 'pdf', file.name);
          e.target.value = '';
        }}
      />

      {camera && (
        <CaptureCamera
          screenId="M-5.3"
          screenTitle={meta('M-5.3')?.title ?? 'Add lab results'}
          onCancel={() => setCamera(false)}
          onLibrary={() => {
            setCamera(false);
            // Let the overlay dismiss, then open the system picker.
            window.setTimeout(() => fileInput.current?.click(), 160);
          }}
          onUse={() => {
            setCamera(false);
            start('photo', 'Photo of your lab report');
          }}
        />
      )}
    </div>
  );
}
