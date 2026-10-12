/**
 * @screen  M-2.9 · Scan a label
 * @flow    F02 intake V2 Step E (from the camera button on a ProfileCard list row)
 * @presentation sheet (large)
 * @states  camera (pick what's in frame — simulated) · reading (OCR → extraction) · results (removable entries) · PDF upload (account gate)
 * @figma   — not in wireframes yet
 * @spec    intake V2 brief §3 Step E (design direction 2026-10-12) — OPEN: not in docs/ux yet
 * @xref    web: W-2.9 — not built
 */
import { useState } from 'react';
import { scanSampleData, type ScanSample } from '@shared/data';
import { extractProfile } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { simMs } from '@shared/bridge';
import { nowFrom } from '@shared/utils';
import { Button, IconButton, OptionRow, Sheet } from '@mobile/ui';
import { ThinkingIndicator } from '@mobile/patterns/chat';
import { useToast } from '@mobile/hooks/toast.store';
import { useAccountGate } from '@mobile/hooks/useAccountGate';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './ScanLabel.module.css';

type Field = 'medications' | 'allergies' | 'conditions';

/** OCR text → entry names via the mock extractor (lab impressions become conditions). */
function entriesFrom(sample: ScanSample): string[] {
  const x = extractProfile(sample.ocr, new Date());
  if (sample.field === 'conditions') return x.conditions.map((c) => c.name);
  return [...x.medications, ...x.supplements].map((m) => [m.name, m.dose].filter(Boolean).join(' '));
}

export default function ScanLabel() {
  const { field = 'medications' } = useScreenParams<{ field: Field }>();
  const { dismissSheet } = useNav();
  const toast = useToast();
  const gate = useAccountGate();
  const profile = useAppStore(selectActiveProfile);
  const [state, setState] = useState<'camera' | 'reading' | 'results'>('camera');
  const [found, setFound] = useState<{ field: Field; names: string[] }>({ field, names: [] });

  const scan = async (sample: ScanSample) => {
    setState('reading');
    await new Promise((r) => window.setTimeout(r, simMs(1500)));
    setFound({ field: sample.field, names: entriesFrom(sample) });
    setState('results');
  };

  const save = () => {
    const s = useAppStore.getState();
    if (!profile) return;
    const existing = (profile.health?.[found.field]?.value ?? []) as { name?: string; substance?: string }[];
    const names = new Set(existing.map((e) => e.name ?? e.substance));
    const added = found.names.filter((n) => !names.has(n)).map((n) => (found.field === 'allergies' ? { substance: n } : { name: n }));
    s.setHealth(profile.id, { [found.field]: { value: [...existing, ...added], source: 'scan', updatedAt: nowFrom(s).toISOString() } });
    dismissSheet();
    toast(`Added ${added.length} from your scan`);
  };

  return (
    <div data-xref="M-2.9 · Scan a label">
      <Sheet title="Scan a label" detent="large">
        <div className={styles.body}>
          {state === 'camera' && (
            <>
              {/* Simulated camera: no device camera in the prototype. */}
              <div className={styles.viewfinder} role="img" aria-label="Camera viewfinder (simulated)">
                <span className={styles.frame} aria-hidden />
                <p className={styles.hint}>Point at a pill bottle, supplement label or lab report</p>
              </div>
              <p className={styles.label}>What’s in frame? (simulated)</p>
              <div className={styles.list}>
                {scanSampleData.map((s) => (
                  <OptionRow key={s.id} leadingIcon="camera" chevron onSelect={() => scan(s)}>{s.label}</OptionRow>
                ))}
              </div>
              <Button variant="secondary" fullWidth leadingIcon="upload" onClick={() => gate('documents', () => toast('PDF upload is simulated in the prototype'))}>
                Upload a PDF instead
              </Button>
            </>
          )}
          {state === 'reading' && <ThinkingIndicator label="Reading the label…" />}
          {state === 'results' && (
            <>
              <p className={styles.label}>I found these. Remove anything that’s wrong.</p>
              {found.names.length ? (
                <ul className={styles.entries}>
                  {found.names.map((n) => (
                    <li key={n} className={styles.entry}>
                      <span>{n}</span>
                      <IconButton icon="close" size="sm" label={`Remove ${n}`} onClick={() => setFound((f) => ({ ...f, names: f.names.filter((x) => x !== n) }))} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.hint}>Nothing left to add.</p>
              )}
              <Button fullWidth disabled={!found.names.length} onClick={save}>Add to my profile</Button>
              <Button variant="link" onClick={() => setState('camera')}>Scan again</Button>
            </>
          )}
        </div>
      </Sheet>
    </div>
  );
}
