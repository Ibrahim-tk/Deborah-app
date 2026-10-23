/**
 * @screen  M-11.3 · Upload a document (M-11.4 result is its last step)
 * @flow    F11 Documents and reports
 * @presentation push (DerivedPage)
 * @states  method · rejected file (format / size / empty) · camera · type · details (future-date error)
 *          · uploading · reading · result (Ask Deborah? Yes / Not now) · stop confirm
 * @figma   — (NOT IN WIREFRAMES; Miro "Documents and Reports" 2026-10-19)
 * @spec    docs/ux/F11-documents.md#m-113--upload-a-document
 * @xref    web: W-11.3 (apps/web/screens/documents/UploadDocument) — not built
 *
 * Prototype: the real picker reports name, type and size; the file itself is never read or sent.
 */
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import type { DocumentType } from '@shared/types/domain';
import { dayKey, isFutureDocumentDate, nowFrom, validateDocument } from '@shared/utils';
import { Button, useAlert } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { CaptureCamera } from '@web/patterns/widgets';
import { useToast } from '@web/hooks/toast.store';
import { meta, useNav, useScreenParams } from '@web/navigation';
import { MethodStep, type RejectedFile } from './parts/MethodStep';
import { TypeStep } from './parts/TypeStep';
import { DetailsStep } from './parts/DetailsStep';
import { ProcessingStep } from './parts/ProcessingStep';
import { ResultStep } from './parts/ResultStep';
import { defaultTitle, saveDocument, type DocumentDetails, type PickedDocument } from './parts/saveDocument';
import { REJECT_COPY, useSimulatedUpload } from './parts/useSimulatedUpload';
import styles from './UploadDocument.module.css';

type Step = 'method' | 'type' | 'details' | 'uploading' | 'reading' | 'result';
const TITLES: Record<Step, string> = {
  method: 'Upload a document', type: 'What is it?', details: 'Add details',
  uploading: 'Uploading', reading: 'Reading your document', result: 'Document saved',
};

export default function UploadDocument() {
  const params = useScreenParams<{ profileId: string }>();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  // Another profile's upload (Profile details) can't be discussed in the active profile's chat.
  const canAsk = profileId === activeProfileId;
  const { pop, openAsk } = useNav();
  const alert = useAlert();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  // Select the clock fields, not a Date: a new Date per read would re-render forever.
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const now = nowFrom(clock);
  const [step, setStep] = useState<Step>('method');
  const [camera, setCamera] = useState(false);
  const [rejected, setRejected] = useState<RejectedFile>();
  const [file, setFile] = useState<PickedDocument>();
  const [details, setDetails] = useState<DocumentDetails>({ type: 'other', title: '', date: '', description: '' });
  const [type, setType] = useState<DocumentType>();
  const [dateError, setDateError] = useState<string>();
  const [savedId, setSavedId] = useState<string>();
  // The simulation pauses while "Stop uploading?" is open, so nothing saves behind the alert.
  const [paused, setPaused] = useState(false);
  const saved = useAppStore((s) => (savedId ? s.documents.byId[savedId] : undefined));

  // Each step change moves focus to the step, so screen readers hear where they are.
  const stepRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    stepRef.current?.focus();
  }, [step]);

  const processing = step === 'uploading' || step === 'reading';

  const progress = useSimulatedUpload(processing && !paused ? step : null, (phase) => {
    if (phase === 'uploading') return setStep('reading');
    if (!file || !type) return;
    const id = saveDocument(profileId, file, { ...details, type });
    // The next chat offers it once unless the user says Yes now (docs/ux/F11-documents.md › Deborah handoff).
    useAppStore.getState().setDocumentChatPrompt(id);
    setSavedId(id);
    setStep('result');
  });

  const accept = (picked: PickedDocument) => {
    setRejected(undefined);
    setFile(picked);
    setStep('type');
  };

  const onFile = (f: File) => {
    const check = validateDocument({ name: f.name, type: f.type, size: f.size });
    if (!check.ok) return setRejected({ fileName: f.name, message: REJECT_COPY[check.reason](check.sizeMb) });
    accept({ source: 'file', fileName: f.name, sizeBytes: f.size, format: check.format });
  };

  const upload = () => {
    if (isFutureDocumentDate(details.date ? `${details.date}T00:00:00` : undefined, now)) {
      return setDateError('The date can’t be in the future.');
    }
    setDateError(undefined);
    setStep('uploading');
  };

  const stop = async () => {
    setPaused(true);
    const choice = await alert({
      title: 'Stop uploading?',
      message: 'This document won’t be saved.',
      buttons: [{ label: 'Keep uploading', style: 'cancel' }, { label: 'Stop', style: 'destructive' }],
    });
    if (choice === 1) return pop();
    // OPEN: Keep uploading restarts the current phase from 0 (simulated; no partial upload to resume).
    setPaused(false);
  };

  const finish = (ask: boolean) => {
    if (!savedId) return;
    pop();
    if (ask) {
      useAppStore.getState().setDocumentChatPrompt(undefined);
      // OPEN: Phase 4 consumes `documentId` to attach the document in M-2.1.
      openAsk({ documentId: savedId });
    } else toast('Document saved');
  };

  const back = step === 'type' ? () => setStep('method') : step === 'details' ? () => setStep('type') : undefined;
  const onPageBack = () => {
    if (processing) void stop();
    else if (back) back();
    else pop();
  };
  const footer =
    step === 'details' ? (
      <div className={styles.actions}>
        <Button fullWidth leadingIcon="upload" onClick={upload}>Upload</Button>
        <Button fullWidth variant="ghost" onClick={back}>Back</Button>
      </div>
    ) : step === 'type' ? (
      <div className={styles.actions}>
        <Button fullWidth disabled={!type} onClick={() => setStep('details')}>Continue</Button>
        <Button fullWidth variant="ghost" onClick={back}>Back</Button>
      </div>
    ) : step === 'result' && canAsk ? (
      <div className={styles.actions}>
        <Button fullWidth leadingIcon="deborah" onClick={() => finish(true)}>Yes, ask Deborah</Button>
        <Button fullWidth variant="ghost" onClick={() => finish(false)}>Not now</Button>
      </div>
    ) : step === 'result' ? (
      <Button fullWidth onClick={() => finish(false)}>Done</Button>
    ) : undefined;

  return (
    <div className={styles.root} data-xref="M-11.3 · Upload a document">
      <DerivedPage title={TITLES[step]} composerPlaceholder="Ask Deborah about this document…" onBack={onPageBack}>
        <div ref={stepRef} tabIndex={-1} aria-label={TITLES[step]} className={styles.step}>
        {step === 'method' && <MethodStep rejected={rejected} onCamera={() => setCamera(true)} onPick={() => input.current?.click()} />}
        {step === 'type' && file && <TypeStep file={file} value={type} onSelect={setType} />}
        {step === 'details' && type && (
          <DetailsStep
            details={details}
            placeholderTitle={defaultTitle(type, details.date, now)}
            maxDate={dayKey(now)}
            dateError={dateError}
            onChange={(p) => { setDetails((d) => ({ ...d, ...p })); if ('date' in p) setDateError(undefined); }}
          />
        )}
        {processing && file && <ProcessingStep file={file} phase={step} progress={progress} onStop={stop} />}
        {step === 'result' && saved && <ResultStep title={saved.title} extraction={saved.extraction} askDeborah={canAsk} />}
        {footer}
        </div>
      </DerivedPage>

      <input
        ref={input}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.txt,application/pdf,image/jpeg,image/png,text/plain"
        aria-label="Choose a file to upload"
        className={styles.hiddenInput}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />

      {camera && (
        <CaptureCamera
          screenId="M-11.3"
          screenTitle={meta('M-11.3')?.title ?? 'Upload a document'}
          hint="Fit the whole document inside the frame"
          onCancel={() => setCamera(false)}
          onLibrary={() => { setCamera(false); window.setTimeout(() => input.current?.click(), 160); }}
          onUse={() => {
            setCamera(false);
            accept({ source: 'camera', fileName: `Photo ${dayKey(now)}.jpg`, sizeBytes: 2_400_000, format: 'jpg' });
          }}
        />
      )}
    </div>
  );
}
