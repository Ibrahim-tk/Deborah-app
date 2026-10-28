/**
 * Intake V2 transcript inside M-2.1 (empty conversation): disclaimer → consent + import →
 * "tell me about yourself" → profile card → hand-off. Rendered from saved progress, so it
 * resumes exactly where it stopped. Deborah's lines are placeholder copy.
 */
import { handOffSuggestions } from '@shared/engine';
import { nowFrom } from '@shared/utils';
import { useAppStore } from '@shared/store';
import { Button, OptionRow } from '@web/ui';
import { CareDisclaimer, MessageBubble, ThinkingIndicator } from '@web/patterns/chat';
import { ProfileCard } from '@web/patterns/intake';
import type { IntakeFlowApi } from './useIntakeFlow';
import styles from './IntakeFlow.module.css';

const DISCLAIMER = 'The Oracle is here to guide you, not replace your doctor. In an emergency, contact local emergency services.';

export interface IntakeFlowProps {
  flow: IntakeFlowApi;
  onScan: (field: 'medications' | 'allergies' | 'conditions') => void;
  onPick: (text: string) => void;
}

export function IntakeFlow({ flow, onScan, onPick }: IntakeFlowProps) {
  const { progress: p, profile } = flow;
  const disclaimerSeen = useAppStore((s) => Boolean(s.disclaimerSeenAt));
  const now = nowFrom(useAppStore.getState());
  const name = profile?.name ?? '';
  const past = (step: string) => ['consent', 'connecting', 'about', 'reading', 'confirm', 'done'].indexOf(p.step) > ['consent', 'connecting', 'about', 'reading', 'confirm', 'done'].indexOf(step);

  return (
    <div className={styles.root}>
      {/* Step A: once, dismissible. */}
      {!disclaimerSeen && <CareDisclaimer text={DISCLAIMER} onDismiss={() => useAppStore.getState().dismissDisclaimer()} />}

      {/* Step B: consent + import (can't be skipped). */}
      <MessageBubble role="deborah" turnStart text={`Hi ${name}. To personalise things, I’d like to use some health details. Want me to pull the basics from Apple Health? It’s faster.`}>
      </MessageBubble>
      {p.step === 'consent' ? (
        <div className={styles.actions}>
          <Button fullWidth leadingIcon="health" onClick={flow.connect}>Connect Apple Health</Button>
          <Button fullWidth variant="secondary" onClick={flow.manual}>Enter them myself</Button>
        </div>
      ) : (
        <MessageBubble role="user" text={p.choice === 'import' ? 'Connect Apple Health' : 'I’ll enter them myself'} />
      )}
      {p.step === 'connecting' && <ThinkingIndicator label="Connecting to Apple Health…" />}

      {/* Step C: free text or voice. */}
      {p.choice === 'manual' && (
        <>
          <MessageBubble role="deborah" turnStart text="In a sentence or two, tell me about yourself: age, any medications or supplements, allergies, anything you’re dealing with. Typing or voice is fine.">
          </MessageBubble>
          {p.step === 'about' && (
            <div className={styles.actions}>
              <Button variant="link" onClick={flow.skipAbout}>Skip</Button>
            </div>
          )}
          {p.aboutText && <MessageBubble role="user" text={p.aboutText} />}
          {p.aboutSkipped && <MessageBubble role="user" text="Skip" />}
          {p.step === 'reading' && <ThinkingIndicator label="Reading that…" />}
        </>
      )}

      {/* Step D: confirm + fill the gaps. */}
      {(p.step === 'confirm' || past('confirm')) && (
        <>
          <MessageBubble role="deborah" turnStart text={p.choice === 'import' ? 'Here’s what Apple Health shared. Is this right?' : 'Here’s what I have so far. Is this right?'} />
          <ProfileCard health={profile?.health} now={now} onPatch={flow.patchHealth} onConfirm={flow.confirm} onScan={onScan} completed={Boolean(p.completedAt)} />
          {p.step === 'confirm' && (
            <div className={styles.actions}>
              <Button variant="link" onClick={flow.later}>Not now</Button>
            </div>
          )}
        </>
      )}

      {/* Step F: hand-off to value. */}
      {p.step === 'done' && (
        <>
          <MessageBubble role="deborah" turnStart text={`Thanks, ${name}. What would you like help with today?`} />
          <div className={styles.picks} role="list">
            {handOffSuggestions(profile?.health).map((s) => (
              <div role="listitem" key={s}>
                <OptionRow chevron onSelect={() => onPick(s)}>{s}</OptionRow>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
