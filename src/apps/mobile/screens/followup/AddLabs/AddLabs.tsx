/**
 * @screen  M-5.3 · Add your lab results
 * @flow    F05 Follow-up & return with labs
 * @states  choose · camera (viewfinder → captured) · processing ("Reading your report…")
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-547
 * @spec    docs/ux/F05-followup-labs.md#m-53--add-your-lab-results
 * @xref    web: W-5.3 (apps/web/screens/followup/AddLabs) — not built
 */
import { useEffect, useRef, useState } from 'react';
import { Icon, OptionList, OptionRow, ProgressBar, ProgressStatus, Sheet } from '@mobile/ui';
import { simBetween } from '@mobile/hooks/simTiming';
import { useNav } from '@mobile/navigation';
import { CameraView } from './parts/CameraView';
import styles from './AddLabs.module.css';

type Source = 'photo' | 'pdf';

export default function AddLabs() {
  const { dismissSheet, presentModal } = useNav();
  const fileInput = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState(false);
  const [processing, setProcessing] = useState<{ source: Source; fileName: string } | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulated extraction: 1.5–2.5 s, then the confirm screen with the sample-a values.
  useEffect(() => {
    if (!processing) return;
    const total = simBetween(1500, 2500);
    const started = Date.now();
    const tick = window.setInterval(() => setProgress(Math.min(1, (Date.now() - started) / Math.max(total, 1))), 80);
    const done = window.setTimeout(() => {
      dismissSheet();
      presentModal('M-5.4', { source: processing.source, fileName: processing.fileName });
    }, total);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [processing, dismissSheet, presentModal]);

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
              <OptionRow leadingIcon="camera" chevron onSelect={() => setCamera(true)}>Take a photo of the report</OptionRow>
              <OptionRow leadingIcon="pdf" chevron onSelect={() => fileInput.current?.click()}>Upload a PDF</OptionRow>
              <OptionRow
                leadingIcon="edit"
                chevron
                onSelect={() => {
                  dismissSheet();
                  presentModal('M-5.4', { source: 'manual' });
                }}
              >
                Enter values manually
              </OptionRow>
            </OptionList>
            <p className={styles.trust}>
              <Icon name="lock" size={18} /> Your results are encrypted and only used for your consultations.
            </p>
          </div>
        )}
      </Sheet>

      {/* Real picker; the file is never read — only its name is shown (prototype, no upload). */}
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,image/*"
        className={styles.hiddenInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) start(file.type.startsWith('image/') ? 'photo' : 'pdf', file.name);
          e.target.value = '';
        }}
      />

      {camera && (
        <CameraView
          onCancel={() => setCamera(false)}
          onUse={() => {
            setCamera(false);
            start('photo', 'Photo of your lab report');
          }}
        />
      )}
    </div>
  );
}
