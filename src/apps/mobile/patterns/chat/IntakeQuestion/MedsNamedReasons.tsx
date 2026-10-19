/** Chat intake: same NamedReasonList sheet flow as Health Basics medications / supplements. */
import { useState } from 'react';
import { NamedReasonList, type NamedReason } from '@mobile/patterns/widgets';
import { Button } from '@mobile/ui';
import styles from './IntakeQuestion.module.css';

export function MedsNamedReasons({
  label,
  addLabel,
  active,
  answered,
  onSubmit,
  onNone,
}: {
  label: string;
  addLabel: string;
  active: boolean;
  answered?: string[];
  onSubmit: (entries: NamedReason[]) => void;
  onNone: () => void;
}) {
  const locked = !active || Boolean(answered?.length);
  const [entries, setEntries] = useState<NamedReason[]>([]);
  const tiles = entries.filter((e) => e.name.trim());

  if (locked && answered?.includes('none')) {
    return <p className={styles.step}>None</p>;
  }

  return (
    <div className={styles.root}>
      <NamedReasonList
        key={answered?.join('|') ?? 'meds-open'}
        label={label}
        entries={tiles}
        addLabel={addLabel}
        noneSelected={answered?.includes('none')}
        onChange={(next) => {
          if (!locked) setEntries(next);
        }}
        onNone={() => {
          if (!locked) {
            setEntries([]);
            onNone();
          }
        }}
      />
      {tiles.length > 0 && !locked && (
        <Button fullWidth className={styles.medsDone} onClick={() => onSubmit(tiles)}>
          Continue
        </Button>
      )}
    </div>
  );
}
