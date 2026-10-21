/**
 * @pattern Composer — card composer: optional top banner, auto-growing text area (1–5 lines), + menu (Camera · Upload) and
 *          Symptoms (opens SymptomPicker) inside the + menu, mic beside send → Stop while
 *          generating, counter from 1,800, send disabled above 2,000. Simulated voice recording
 *          shows ✕ (cancel) · live wave · timer · Stop (to field) · Send.
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (Layout 6) · DESIGN.md › Composer
 * @xref    web: apps/web/patterns/chat/Composer — not built
 */
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { EdgeLight, Icon, IconButton, Menu, TextArea } from '@mobile/ui';
import styles from './Composer.module.css';

export const COUNTER_FROM = 1800;
export const MAX_CHARS = 2000;

/** Simulated speech while dictating (design 2026-10-20): [flat ms, talking ms, …], then it loops. */
const SPEECH_PATTERN = [3000, 2500, 2000, 2500, 4000];

export type AttachSource = 'camera' | 'upload';
const ATTACH_ITEMS = [
  { id: 'camera', label: 'Camera', icon: 'camera' as const },
  { id: 'upload', label: 'Upload', icon: 'upload' as const },
];
/* Symptoms moved from the toolbar into the + menu (design 2026-10-21) so the row is just + · mic · send. */
const SYMPTOMS_ITEM = { id: 'symptoms', label: 'Symptoms', icon: 'health' as const };

/** A photo or file waiting in the composer (shown as a thumbnail tile with ×). */
export interface ComposerAttachment {
  id: string;
  name: string;
  /** Preview URL for images; files without one show a document icon. */
  image?: string;
}

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Sends the draft; voice "send" passes the dictated text directly. */
  onSend: (text?: string) => void;
  onStop: () => void;
  /** + menu: Camera or Upload. */
  onAttach: (source: AttachSource) => void;
  onFocusChange: (focused: boolean) => void;
  generating: boolean;
  /** When set, the composer is locked and this note is shown (e.g. emergency). */
  lockedNote?: string;
  placeholder: string;
  /** Canned dictation inserted when recording stops. */
  voiceSample: string;
  /** Lets the screen focus the text area (e.g. "Keep talking with Deborah"). */
  inputRef?: RefObject<HTMLTextAreaElement>;
  /** Inline strip docked to the top of the composer card (e.g. the TrialCounter banner). */
  banner?: ReactNode;
  /** Answer options docked above the text field (intake quiz questions); typing is "Other". */
  options?: ReactNode;
  /** Quiet footnote under the card (educational disclaimer). */
  disclaimer?: string;
  /** Toolbar "Symptoms" button; the screen opens the SymptomPicker sheet. */
  onSymptoms?: () => void;
  /** Picked symptoms shown as small selected pills above the text (not typed into it). */
  tokens?: string[];
  onRemoveToken?: (token: string) => void;
  /** Photos / files added from the + menu, shown as tiles above the text. */
  attachments?: ComposerAttachment[];
  onRemoveAttachment?: (id: string) => void;
  /** Lets the screen hide suggestions while dictating. */
  onRecordingChange?: (recording: boolean) => void;
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  onAttach,
  onSymptoms,
  tokens = [],
  onRemoveToken,
  attachments = [],
  onRemoveAttachment,
  onFocusChange,
  generating,
  lockedNote,
  placeholder,
  voiceSample,
  inputRef,
  banner,
  options,
  disclaimer,
  onRecordingChange,
}: ComposerProps) {
  const [recordingSince, setRecordingSince] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const recording = recordingSince !== null;
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const area = inputRef ?? ownRef;
  const length = value.length;
  const canSend = (value.trim().length > 0 || tokens.length > 0 || attachments.length > 0) && length <= MAX_CHARS && !generating && !lockedNote;

  useEffect(() => onRecordingChange?.(recording), [recording, onRecordingChange]);

  // Flat while "silent", moving while "talking", following SPEECH_PATTERN in a loop.
  const [talking, setTalking] = useState(false);
  useEffect(() => {
    if (!recording) return;
    let step = 0;
    let id = 0;
    const next = () => {
      setTalking(step % 2 === 1);
      id = window.setTimeout(() => {
        step = (step + 1) % SPEECH_PATTERN.length;
        next();
      }, SPEECH_PATTERN[step]);
    };
    next();
    return () => {
      window.clearTimeout(id);
      setTalking(false);
    };
  }, [recording]);

  const startRecording = () => {
    setRecordingSince(Date.now());
  };

  const dictated = () => (value ? `${value} ${voiceSample}` : voiceSample);

  const cancelRecording = () => setRecordingSince(null);

  // Stop: drop the dictation into the field so it can be reviewed before sending.
  const stopRecording = () => {
    setRecordingSince(null);
    onChange(dictated());
    area.current?.focus();
  };

  const sendRecording = () => {
    setRecordingSince(null);
    onChange('');
    onSend(dictated());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  if (recording) {
    return (
      <div className={styles.wrap}>
        {/* Same element slots as the typing view (locked note · bar › glow), so React keeps the one EdgeLight
            and it freezes in place instead of restarting. */}
        {null}
        <div className={styles.bar}>
          <EdgeLight className={styles.edgeLight} gather />
          <div className={styles.root}>
            {banner && <div className={styles.banner}>{banner}</div>}
            {/* Same two rows as typing, so nothing moves: wave + timer where the text sits; ✕ · Stop · Send at
                the exact size and place of + · mic · send. */}
            <div className={styles.recordingField} role="group" aria-label="Voice message">
              {/* User-requested exception to the DESIGN.md "no wave animation" rule (2026-10-08). */}
              {/* Full-width level bars, faded at both ends (no timer, design 2026-10-20). */}
              <span className={styles.wave} data-talking={talking || undefined} aria-hidden>
                {Array.from({ length: 56 }, (_, i) => (
                  <span key={i} style={{ animationDelay: `${(i * 97) % 900}ms` }} />
                ))}
              </span>
              <span className={styles.srOnly} role="status">Recording</span>
            </div>
            <div className={styles.toolbar}>
              <IconButton icon="close" size="sm" label="Cancel recording" onClick={cancelRecording} />
              <div className={styles.end}>
                <IconButton icon="stop" size="sm" label="Stop recording" onClick={stopRecording} />
                <div className={styles.send} data-ready>
                  <IconButton icon="send" size="sm" label="Send voice message" onClick={sendRecording} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {lockedNote && <p className={styles.locked}>{lockedNote}</p>}
      <div
        className={styles.bar}
        data-locked={Boolean(lockedNote) || undefined}
        // Pressing a composer button must not blur the text area: the blur would restore the
        // tab bar and shift the composer before the click lands (and iOS keeps the keyboard up).
        onMouseDown={(e) => {
          if (e.target !== area.current) e.preventDefault();
        }}
      >
        {/* Glow behind the white card only — not drawn on the composer rim. */}
        {/* Glow always runs; while typing it gathers at the bottom (design 2026-10-20). */}
        <EdgeLight className={styles.edgeLight} gather={focused} />
        <div className={styles.root}>
          {banner && <div className={styles.banner}>{banner}</div>}
          {options}
          {attachments.length > 0 && (
            <ul className={styles.attachments} aria-label="Attachments">
              {attachments.map((a) => (
                <li key={a.id} className={styles.attachment} data-file={!a.image || undefined}>
                  {a.image ? <img src={a.image} alt={a.name} className={styles.attachmentImg} /> : <Icon name="file" size={24} />}
                  <button type="button" className={styles.attachmentRemove} aria-label={`Remove ${a.name}`} onClick={() => onRemoveAttachment?.(a.id)}>
                    <Icon name="close" size={12} strokeWidth={2.25} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {tokens.length > 0 && (
            <ul className={styles.tokens} aria-label="Added symptoms">
              {tokens.map((t) => (
                <li key={t} className={styles.token}>
                  {t}
                  <button type="button" className={styles.tokenRemove} aria-label={`Remove ${t}`} onClick={() => onRemoveToken?.(t)}>
                    <Icon name="close" size={11} strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.field}>
            <TextArea
              ref={area}
              label="Message Deborah"
              value={value}
              placeholder={placeholder}
              disabled={generating || Boolean(lockedNote)}
              maxRows={5}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => {
                setFocused(true);
                onFocusChange(true);
              }}
              onBlur={() => {
                setFocused(false);
                onFocusChange(false);
              }}
            />
            {length >= COUNTER_FROM && (
              <span className={styles.counter} data-over={length > MAX_CHARS || undefined}>
                {length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            )}
          </div>
          <div className={styles.toolbar}>
            <Menu
              items={onSymptoms ? [...ATTACH_ITEMS, SYMPTOMS_ITEM] : ATTACH_ITEMS}
              onSelect={(id) => (id === SYMPTOMS_ITEM.id ? onSymptoms?.() : onAttach(id as AttachSource))}
              disabled={Boolean(lockedNote) || generating}
              trigger={<IconButton icon="plus" size="sm" label="Add attachment" disabled={Boolean(lockedNote) || generating} />}
            />
            <div className={styles.end}>
              {!generating && (
                <IconButton icon="mic" size="sm" label="Dictate" onClick={startRecording} disabled={Boolean(lockedNote)} />
              )}
              <div className={styles.send} data-ready={canSend || generating || undefined}>
                {generating ? (
                  <IconButton icon="stop" size="sm" label="Stop" onClick={onStop} />
                ) : (
                  <IconButton icon="send" size="sm" label="Send" onClick={() => onSend()} disabled={!canSend} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
    </div>
  );
}
