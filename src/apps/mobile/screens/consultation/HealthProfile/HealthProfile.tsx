/**
 * @screen  M-2.10 · Build your health profile
 * @flow    F02 intake V2 — Step D on its own, from Home, for people who'd rather not chat
 * @presentation modal
 * @states  consent (once; can't be skipped) · card · saved · to review (n) · from your conversations
 * @figma   — not in wireframes yet
 * @spec    intake V2 brief §7 (design direction 2026-10-12) — OPEN: not in docs/ux yet
 * @xref    web: W-2.10 — not built
 */
import { pendingFacts } from '@shared/engine';
import { selectActiveConversation, selectActiveProfile, useAppStore } from '@shared/store';
import { formatShortDate, nowFrom } from '@shared/utils';
import { Aura, Button, Header, IconButton, ListRow } from '@mobile/ui';
import { ProfileCard, regionFromLocale } from '@mobile/patterns/intake';
import { FullChoicePillsGrid } from '@mobile/patterns/widgets';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav } from '@mobile/navigation';
import styles from './HealthProfile.module.css';

const PRONOUN_OPTIONS = [
  { id: 'he/him', label: 'He/Him' },
  { id: 'she/her', label: 'She/Her' },
  { id: 'they/them', label: 'They/Them' },
  { id: 'he/they', label: 'He/They' },
  { id: 'she/they', label: 'She/They' },
  { id: 'any', label: 'Any pronouns' },
];

export default function HealthProfile() {
  const { dismissModal, presentSheet, push } = useNav();
  const toast = useToast();
  const profile = useAppStore(selectActiveProfile);
  const consented = useAppStore((s) => Boolean(s.healthConsentAt));
  // DN-13 · DN-14: facts still waiting for Confirm, and what was confirmed from conversations.
  const conversation = useAppStore(selectActiveConversation);
  const toReview = pendingFacts(conversation).length;
  const now = nowFrom(useAppStore.getState());
  if (!profile) return null;
  const pronouns = profile.intake.pronouns;
  const completeDone = Boolean(
    profile.intake.familyHistory || profile.intake.lifestyleSleep || profile.intake.otherMedical,
  );

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
        {conversation && toReview > 0 && (
          <ListRow title="To review" subtitle="Noted in your conversation, not saved yet" value={String(toReview)} onPress={() => presentSheet('M-2.13', { conversationId: conversation.id })} />
        )}
        <ListRow
          title={completeDone ? 'Update Intake' : 'Complete Intake'}
          subtitle={completeDone ? 'Edit family history and lifestyle' : 'Finish family history and lifestyle'}
          onPress={() => {
            dismissModal();
            push('M-2.14');
          }}
        />
        {!consented ? (
          <div className={styles.consent}>
            <p className={styles.text}>To save health details I need your OK to process them. You can change this in Privacy at any time.</p>
            <Button fullWidth onClick={allow}>Allow and continue</Button>
          </div>
        ) : (
          <>
            <section className={styles.facts} aria-labelledby="preferred-pronouns" data-placeholder>
              <h2 id="preferred-pronouns" className={styles.heading}>Preferred pronouns</h2>
              <FullChoicePillsGrid
                label="What are your preferred pronouns?"
                options={PRONOUN_OPTIONS}
                selected={pronouns && PRONOUN_OPTIONS.some((o) => o.id === pronouns) ? pronouns : undefined}
                onPick={(id) => {
                  useAppStore.getState().updateIntake(profile.id, { pronouns: id });
                  const care = { ...(profile.health?.careContext?.value ?? {}), pronouns: id };
                  useAppStore.getState().setHealth(profile.id, {
                    careContext: { value: care, source: 'manual', updatedAt: now.toISOString() },
                  });
                }}
              />
            </section>
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
          </>
        )}
        {(profile.confirmedFacts?.length ?? 0) > 0 && (
          <section className={styles.facts} aria-labelledby="from-chats">
            <h2 id="from-chats" className={styles.heading}>From your conversations</h2>
            {profile.confirmedFacts!.map((f) => (
              <ListRow key={f.key} title={f.label} subtitle={`${f.value} · Confirmed in conversation, ${formatShortDate(f.confirmedAt)}`} trailing={null} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
