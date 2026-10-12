/**
 * Intake V2 state machine (in-chat, frictionless). Fastest method first: import from Apple Health,
 * infer from what she says, confirm, one-tap widgets, defer the rest. Progress lives on the profile
 * (`intakeV2`), so a half-finished intake resumes exactly where it stopped.
 * Steps: consent → (connecting → confirm) | (about → reading → confirm) → done.
 */
import { useCallback } from 'react';
import { FLAGS } from '@shared/flags';
import { extractionPatch, extractProfile, healthKitPatch } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import type { HealthProfile, IntakeProgress } from '@shared/types/health';
import { simMs } from '@shared/bridge';
import { nowFrom } from '@shared/utils';
import { useAlert } from '@mobile/ui';
import { regionFromLocale } from '@mobile/patterns/intake';

export const ABOUT_PLACEHOLDER = 'e.g. I’m 34, take vitamin D, allergic to penicillin…';
export const ABOUT_VOICE_SAMPLE = 'I’m 47, I take levothyroxine and magnesium every day, I’m allergic to penicillin, and I have hypothyroidism.';

export function useIntakeFlow() {
  const profile = useAppStore(selectActiveProfile);
  const alert = useAlert();
  const progress: IntakeProgress = profile?.intakeV2 ?? { step: 'consent' };
  // Self profile only; family members keep the per-consultation questions.
  const enabled = FLAGS.intakeV2 && profile?.relationship === 'self' && !progress.closedAt;

  const id = profile?.id;
  const stamp = () => nowFrom(useAppStore.getState()).toISOString();
  const go = useCallback((patch: Partial<IntakeProgress>) => id && useAppStore.getState().setIntakeProgress(id, patch), [id]);
  const patchHealth = useCallback((patch: Partial<HealthProfile>) => id && useAppStore.getState().setHealth(id, patch), [id]);

  /** Either choice records explicit consent to process health data. Country comes from the device. */
  const consent = () => {
    const s = useAppStore.getState();
    s.acceptHealthConsent();
    if (id && !s.profiles.byId[id]?.health?.country) patchHealth({ country: { value: regionFromLocale(), source: 'inferred', updatedAt: stamp() } });
  };

  const connect = async () => {
    consent();
    go({ choice: 'import', step: 'connecting' });
    const allowed = await alert({
      title: '“Your Oracle Clinician” Would Like to Access Health Data',
      message: 'Read: date of birth, biological sex, height, weight, and clinical records (medications, allergies, conditions).',
      buttons: [{ label: 'Don’t Allow', style: 'cancel' }, { label: 'Allow' }],
    });
    if (allowed !== 1) return go({ choice: 'manual', step: 'about' });
    await new Promise((r) => window.setTimeout(r, simMs(1200)));
    patchHealth(healthKitPatch(stamp()));
    go({ step: 'confirm' });
  };

  const manual = () => {
    consent();
    go({ choice: 'manual', step: 'about' });
  };

  const submitAbout = async (text: string) => {
    go({ aboutText: text, step: 'reading' });
    await new Promise((r) => window.setTimeout(r, simMs(1400)));
    const now = new Date(stamp());
    patchHealth(extractionPatch(extractProfile(text, now), now.toISOString()));
    go({ step: 'confirm' });
  };

  return {
    enabled,
    profile,
    progress,
    connect,
    manual,
    submitAbout,
    skipAbout: () => go({ aboutSkipped: true, step: 'confirm' }),
    patchHealth,
    confirm: () => go({ step: 'done', completedAt: stamp() }),
    /** Not now on the card: required rows come back at the point of need (engine safety gates). */
    later: () => go({ step: 'done' }),
    close: () => go({ closedAt: stamp() }),
  };
}

export type IntakeFlowApi = ReturnType<typeof useIntakeFlow>;
