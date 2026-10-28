/** My Health · Attachments entry (design 2026-10-27): lab reports and images open M-9.12. */
import { useShallow } from 'zustand/react/shallow';
import { seedAttachments } from '@shared/data';
import { selectProfileLabs, useAppStore } from '@shared/store';
import { Icon } from '@web/ui';
import { useNav } from '@web/navigation';
import styles from './AttachmentsCard.module.css';

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

export function AttachmentsCard() {
  const { open } = useNav();
  const profileId = useAppStore((s) => s.activeProfileId);
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const go = (tab: 'labs' | 'images') => open('M-9.12', { profileId, tab });

  return (
    <section className={styles.root} aria-labelledby="hub-attachments">
      <h3 id="hub-attachments" className={styles.title}>Attachments</h3>
      <div className={styles.list}>
        <button type="button" className={styles.row} onClick={() => go('labs')}>
          <span className={styles.well}><Icon name="labs" size={18} /></span>
          <span className={styles.text}>
            <span className={styles.label}>Lab reports</span>
            <span className={styles.meta}>{labs.length ? plural(labs.length, 'report') : 'None yet'}</span>
          </span>
          <Icon name="chevron" size={16} className={styles.chevron} />
        </button>
        <button type="button" className={styles.row} onClick={() => go('images')}>
          <span className={styles.well}><Icon name="image" size={18} /></span>
          <span className={styles.text}>
            <span className={styles.label}>Images</span>
            <span className={styles.meta}>{plural(seedAttachments.length, 'image')}</span>
          </span>
          <Icon name="chevron" size={16} className={styles.chevron} />
        </button>
      </div>
    </section>
  );
}
