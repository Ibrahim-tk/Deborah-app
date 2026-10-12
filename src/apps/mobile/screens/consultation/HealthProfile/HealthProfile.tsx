/**
 * @screen  M-2.10 · Build your health profile
 * @flow    F02 intake V2 — Step D on its own, from Home, for people who'd rather not chat
 * @presentation modal
 * @states  consent (once; can't be skipped) · card · saved
 * @figma   — not in wireframes yet
 * @spec    intake V2 brief §7 (design direction 2026-10-12) — OPEN: not in docs/ux yet
 * @xref    web: W-2.10 — not built
 */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Aura, Button, Header, IconButton } from '@mobile/ui';
import { ProfileCard, regionFromLocale } from '@mobile/patterns/intake';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav } from '@mobile/navigation';
import styles from './HealthProfile.module.css';

export default function HealthProfile() {
  const { dismissModal, presentSheet } = useNav();
  const toast = useToast();
  const profile = useAppStore(selectActiveProfile);
  const consented = useAppStore((s) => Boolean(s.healthConsentAt));
  const now = nowFrom(useAppStore.getState());
  if (!profile) return null;

  const allow = () => {
    const s = useAppStore.getState();
    s.acceptHealthConsent();
    if (!profile.health?.country) s.setHealth(profile.id, { country: { value: regionFromLocale(), source: 'inferred', updatedAt: now.toISOString() } });
    s.setIntakeProgress(profile.id, { choice: 'manual', step: 'confirm' });
  };

  return (
    <div className={styles.root} data-xref="M-2.10 · Build your health profile">
      <Aura />
      <Header transparent title="" right={<IconButton icon="close" label="Close" onClick={dismissModal} />} />
      <div className={styles.body}>
        <h1 className={styles.title}>Your health profile</h1>
        <p className={styles.sub}>Under a minute. Deborah uses it to keep suggestions safe for you.</p>
        {!consented ? (
          <div className={styles.consent}>
            <p className={styles.text}>To save health details I need your OK to process them. You can change this in Privacy at any time.</p>
            <Button fullWidth onClick={allow}>Allow and continue</Button>
          </div>
        ) : (
          <ProfileCard
            health={profile.health}
            now={now}
            completed={Boolean(profile.intakeV2?.completedAt)}
            onPatch={(patch) => useAppStore.getState().setHealth(profile.id, patch)}
            onScan={(field) => presentSheet('M-2.9', { field })}
            onConfirm={() => {
              useAppStore.getState().setIntakeProgress(profile.id, { step: 'done', completedAt: now.toISOString() });
              toast('Health profile saved');
              dismissModal();
            }}
          />
        )}
      </div>
    </div>
  );
}
