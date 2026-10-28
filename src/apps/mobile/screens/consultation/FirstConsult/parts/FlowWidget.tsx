/**
 * The on-the-fly widgets (patterns/widgets) as scripted-flow answers (docs/ux/F02c): each one answers its
 * node with a single FlowOption, echoed as her message. `options` on the node become quiet "not now" links.
 */
import type { FlowOption, FlowWidget as Widget } from '@shared/types/flow';
import { Button } from '@mobile/ui';
import { ConfirmCard, MoodScale, ReminderCard, ScaleCheck, SlotPicker } from '@mobile/patterns/widgets';
import styles from '../FirstConsult.module.css';

const TYPES = ['mood_scale', 'scale_check', 'upload_card', 'slot_picker', 'confirm_card', 'reminder_card'];
const WEEKDAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
const TIMES = [['9:00 am', '11:30 am', '3:00 pm'], ['10:00 am', '2:00 pm'], [], [], ['9:30 am', '1:00 pm', '4:30 pm'], ['11:00 am'], ['10:30 am', '3:30 pm']];
// OPEN: openings are placeholder; booking is simulated (no calendar, no payment).
const DAYS = Array.from({ length: 14 }, (_, i) => ({ value: `${WEEKDAYS[i % 7]} ${16 + i}`, label: `${WEEKDAYS[i % 7]} ${16 + i}`, times: TIMES[i % 7] }));

export interface FlowWidgetProps {
  widget: Widget;
  active: boolean;
  say: (s?: string) => string;
  onPick: (picked: FlowOption[]) => void;
}

export function FlowWidget({ widget: w, active, say, onPick }: FlowWidgetProps) {
  const answer = (label: string, value: string | boolean = label) => onPick([{ label, value }]);
  const body = (() => {
    switch (w.type) {
      case 'mood_scale':
        return <MoodScale title={w.title ?? 'Today'} onPick={(m) => answer(m)} />;
      case 'scale_check':
        return <ScaleCheck title={w.title ?? ''} low={w.low ?? 'Not at all'} high={w.high ?? 'Completely'} words={w.steps} onDone={(v, word) => answer(word, String(v))} />;
      case 'upload_card':
        return null; // Oct 27: no uploads in the app
      case 'slot_picker':
        return <SlotPicker title={w.title ?? ''} meta={w.meta} days={DAYS} onPick={(day, time) => answer(`${day}, ${time}`)} />;
      case 'confirm_card':
        return <ConfirmCard eyebrow="Confirm booking" icon="calendar" title={w.title ?? ''} value={w.value} detail={say(w.detail)} confirmedText={w.label ?? 'Confirmed'} onConfirm={() => answer('Confirm booking', true)} onCancel={() => onPick([{ label: 'Cancel', next: 'offer_checkin' }])} />;
      case 'reminder_card':
        return <ReminderCard what={w.title ?? ''} when={w.detail ?? ''} onChange={(on) => on && answer('Yes, check in with me', true)} />;
      default:
        return null;
    }
  })();
  return (
    <div className={styles.widget} data-done={!active || undefined} {...(!active ? { inert: '' } : {})}>
      {body}
      {active && w.options?.map((o) => (
        <Button key={o.label} variant="ghost" fullWidth onClick={() => onPick([o])}>{o.label}</Button>
      ))}
    </div>
  );
}

FlowWidget.handles = (type: string) => TYPES.includes(type);
