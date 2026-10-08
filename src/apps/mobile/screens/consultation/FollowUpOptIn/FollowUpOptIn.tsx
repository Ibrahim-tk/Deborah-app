/**
 * @screen  M-2.8 · Follow-up opt-in
 * @flow    F02 Core consultation
 * @states  default (2 weeks selected) · system permission alert
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
 * @spec    docs/ux/F02-consultation.md#m-28--follow-up-opt-in
 * @xref    web: W-2.8 (apps/web/screens/consultation/FollowUpOptIn) — not built
 */
import { useState } from 'react';
import { FOLLOW_UP_BODY, FOLLOW_UP_TITLE, selectAnsweredCount, useAppStore } from '@shared/store';
import { addDays, nowFrom, uid } from '@shared/utils';
import { Button, OptionList, OptionRow, Sheet, useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav } from '@mobile/navigation';
import styles from './FollowUpOptIn.module.css';

// OPEN: "default interval tied to 90-day framing?" — documented default is 2 weeks.
const INTERVALS = [
  { days: 7, label: 'In 1 week', phrase: 'in 1 week' },
  { days: 14, label: 'In 2 weeks', phrase: 'in 2 weeks' },
  { days: 30, label: 'In 1 month', phrase: 'in 1 month' },
];

export default function FollowUpOptIn() {
  const { dismissSheet } = useNav();
  const alert = useAlert();
  const toast = useToast();
  const [days, setDays] = useState(14);

  const yes = async () => {
    // The custom prompt always precedes the system alert.
    const choice = await alert({
      title: '“Your Oracle Clinician” Would Like to Send You Notifications',
      message: 'Notifications may include alerts, sounds and icon badges.',
      buttons: [{ label: 'Don’t Allow', style: 'cancel' }, { label: 'Allow' }],
    });
    const s = useAppStore.getState();
    if (choice === 1) {
      s.setPermission('granted');
      s.setFollowUp(s.activeProfileId, true, days);
      // Lock-screen text stays generic: no symptoms, conditions or products.
      s.scheduleNotification({
        id: uid('n'),
        title: FOLLOW_UP_TITLE,
        body: FOLLOW_UP_BODY,
        deepLink: `followup:${s.activeProfileId}`,
        deliverAt: addDays(nowFrom(s).toISOString(), days),
        delivered: false,
        read: false,
      });
      toast(`I’ll check in ${INTERVALS.find((i) => i.days === days)?.phrase}`);
    } else {
      s.setPermission('denied');
      toast('You can turn reminders on in Account');
    }
    dismissSheet();
  };

  const notNow = () => {
    // Don't ask again for 3 consultations.
    const s = useAppStore.getState();
    s.snoozeFollowUp(selectAnsweredCount(s) + 3);
    dismissSheet();
  };

  return (
    <div data-xref="M-2.8 · Follow-up opt-in">
      <Sheet
        title="Want me to check in with you?"
        footer={
          <>
            <Button fullWidth onClick={yes}>Yes, remind me</Button>
            <Button variant="ghost" fullWidth onClick={notNow}>Not now</Button>
          </>
        }
      >
        <div className={styles.body}>
          <p className={styles.text}>I’ll remind you to tell me how you’re doing, so we can build on today.</p>
          <OptionList label="When should I check in?">
            {INTERVALS.map((i) => (
              <OptionRow key={i.days} selected={i.days === days} onSelect={() => setDays(i.days)}>
                {i.label}
              </OptionRow>
            ))}
          </OptionList>
        </div>
      </Sheet>
    </div>
  );
}
