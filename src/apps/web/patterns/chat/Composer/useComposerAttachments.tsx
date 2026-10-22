/**
 * Composer attachments (design 2026-10-21): the + menu's Camera / Upload no longer leave the chat — no lab
 * processing: take the photo (or pick a file) and it goes straight into the composer. A photo
 * (simulated camera) or a picked file lands as a thumbnail tile in the composer with a small ×, and is cleared
 * on send. Prototype: files are never uploaded; images preview from a local object URL.
 * OPEN: "Should a sent attachment start the lab-reading flow (M-5.3) or stay a plain chat attachment?"
 *       Default: plain attachment, mentioned in the sent text.
 */
import { useRef, useState, type ChangeEvent } from 'react';
import { CaptureCamera } from '@web/patterns/widgets';
import type { ComposerAttachment } from './Composer';

const CAMERA_PHOTO = '/images/labs/camera-preview.jpg';
let seq = 0;

/** `screenId` / `screenTitle`: the chat screen the camera opens over (restores its status bar on close). */
export function useComposerAttachments(screenId: string, screenTitle: string) {
  const [items, setItems] = useState<ComposerAttachment[]>([]);
  const [camera, setCamera] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const add = (a: Omit<ComposerAttachment, 'id'>) => setItems((xs) => [...xs, { ...a, id: `att-${++seq}` }]);
  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
  const clear = () => setItems([]);
  const attach = (source: 'camera' | 'upload') => (source === 'camera' ? setCamera(true) : file.current?.click());

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    for (const f of Array.from(e.target.files ?? [])) {
      add({ name: f.name, image: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined });
    }
    e.target.value = '';
  };

  const overlay = (
    <>
      <input ref={file} type="file" accept="image/*,application/pdf" multiple hidden onChange={onFile} />
      {camera && (
        <CaptureCamera
          screenId={screenId}
          screenTitle={screenTitle}
          hint="Fit what you want to share inside the frame"
          onCancel={() => setCamera(false)}
          onUse={() => { add({ name: 'Photo', image: CAMERA_PHOTO }); setCamera(false); }}
        />
      )}
    </>
  );

  return { items, attach, remove, clear, overlay };
}
