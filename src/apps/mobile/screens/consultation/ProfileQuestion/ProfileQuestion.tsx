/**
 * @screen  M-2.11 · Profile question (deferred field)
 * @flow    F02 intake V2 §4 — from Home "Complete your profile"; one question at a time, one tap each
 * @presentation sheet
 * @states  question n of m · full date of birth (date field)
 * @figma   — not in wireframes yet
 * @spec    intake V2 brief §4 (design direction 2026-10-12) — OPEN: not in docs/ux yet
 * @xref    web: W-2.11 — not built
 */
import { useState } from 'react';
import { selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Button, ChoiceGroup, Input, Sheet } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { DEFERRED, type DeferredTopic } from './questions';
import styles from './ProfileQuestion.module.css';

export default function ProfileQuestion() {
  const { topic = 'lifestyle' } = useScreenParams<{ topic: DeferredTopic }>();
  const { dismissSheet } = useNav();
  const toast = useToast();
  const profile = useAppStore(selectActiveProfile);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dob, setDob] = useState('');
  const def = DEFERRED[topic];
  if (!profile) return null;

  const save = (values: Record<string, string>) => {
    const s = useAppStore.getState();
    const updatedAt = nowFrom(s).toISOString();
    if (topic === 'fullDob') s.setHealth(profile.id, { fullDob: { value: dob, source: 'manual', updatedAt } });
    else if (topic === 'genderIdentity') s.setHealth(profile.id, { genderIdentity: { value: values.gender, source: 'manual', updatedAt } });
    else s.setHealth(profile.id, { [topic]: { value: { ...profile.health?.[topic]?.value, ...values }, source: 'manual', updatedAt } });
    dismissSheet();
    toast('Added to your profile');
  };

  const q = def.questions[i];
  const pick = (choice: string) => {
    const next = { ...answers, [q.key]: choice };
    setAnswers(next);
    if (i + 1 < def.questions.length) setI(i + 1);
    else save(next);
  };

  return (
    <div data-xref="M-2.11 · Profile question">
      <Sheet title={def.title}>
        <div className={styles.body}>
          {topic === 'fullDob' ? (
            <>
              <Input label="Date of birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              <Button fullWidth disabled={!dob} onClick={() => save({})}>Save</Button>
            </>
          ) : (
            <>
              {def.questions.length > 1 && <p className={styles.step}>{i + 1} of {def.questions.length}</p>}
              <p className={styles.prompt}>{q.prompt}</p>
              <ChoiceGroup label={q.prompt} choices={q.choices.map((c) => ({ value: c, label: c }))} onChange={pick} />
              <Button variant="link" onClick={() => (i + 1 < def.questions.length ? setI(i + 1) : save(answers))}>Skip</Button>
            </>
          )}
        </div>
      </Sheet>
    </div>
  );
}
