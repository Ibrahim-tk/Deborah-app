/**
 * @pattern Composer — card composer: optional top banner, auto-growing text area (1–5 lines), attach, mic, send → Stop while
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
import { Icon, IconButton, TextArea } from '@mobile/ui';
import styles from './Composer.module.css';

export const COUNTER_FROM = 1800;
export const MAX_CHARS = 2000;

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Sends the draft; voice "send" passes the dictated text directly. */
  onSend: (text?: string) => void;
  onStop: () => void;
  onAttach: () => void;
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
  /** Quiet footnote under the card (educational disclaimer). */
  disclaimer?: string;
  /** Lets the screen hide suggestions while dictating. */
  onRecordingChange?: (recording: boolean) => void;
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  onAttach,
  onFocusChange,
  generating,
  lockedNote,
  placeholder,
  voiceSample,
  inputRef,
  banner,
  disclaimer,
  onRecordingChange,
}: ComposerProps) {
  const [recordingSince, setRecordingSince] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const recording = recordingSince !== null;
  const seconds = recording ? Math.max(0, Math.floor((now - recordingSince) / 1000)) : 0;
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const area = inputRef ?? ownRef;
  const length = value.length;
  const canSend = value.trim().length > 0 && length <= MAX_CHARS && !generating && !lockedNote;

  useEffect(() => onRecordingChange?.(recording), [recording, onRecordingChange]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [recording]);

  const startRecording = () => {
    setNow(Date.now());
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
    const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    return (
      <div className={styles.wrap}>
        <div className={styles.bar}>
          <div className={styles.root}>
            {banner && <div className={styles.banner}>{banner}</div>}
            <div className={styles.recordingRow} role="group" aria-label="Voice message">
              <IconButton icon="close" label="Cancel recording" onClick={cancelRecording} />
              {/* User-requested exception to the DESIGN.md "no wave animation" rule (2026-10-08). */}
              <span className={styles.wave} aria-hidden>
                {Array.from({ length: 24 }, (_, i) => (
                  <span key={i} style={{ animationDelay: `${(i * 97) % 900}ms` }} />
                ))}
              </span>
              <span className={styles.timer} role="timer" aria-label={`Recording, ${time}`}>
                {time}
              </span>
              <button
                type="button"
                className={styles.stopRec}
                onClick={stopRecording}
                aria-label="Stop recording"
              >
                <Icon name="stop" size={18} />
              </button>
              <button
                type="button"
                className={styles.sendRec}
                onClick={sendRecording}
                aria-label="Send voice message"
              >
                <Icon name="send" size={18} />
              </button>
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
        <div className={styles.root}>
          {banner && <div className={styles.banner}>{banner}</div>}
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
              onFocus={() => onFocusChange(true)}
              onBlur={() => onFocusChange(false)}
            />
            {length >= COUNTER_FROM && (
              <span className={styles.counter} data-over={length > MAX_CHARS || undefined}>
                {length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            )}
          </div>
          <div className={styles.toolbar}>
            <IconButton
              icon="plus"
              size="sm"
              label="Attach lab results"
              onClick={onAttach}
              disabled={Boolean(lockedNote) || generating}
            />
            {!generating && (
              <IconButton
                icon="mic"
                size="sm"
                label="Dictate"
                onClick={startRecording}
                disabled={Boolean(lockedNote)}
              />
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
      {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
    </div>
  );
}
