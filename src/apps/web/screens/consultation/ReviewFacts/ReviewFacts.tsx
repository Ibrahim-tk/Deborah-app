/**
 * @screen  M-2.13 · Review what Deborah noted
 * @flow    Core experience · Review and Confirm (meeting 2026-10-12 · B, plan C-12, node DN-13)
 * @presentation sheet, large — from Edit on the ReviewFactsCard
 * @states  list · editing one fact (options, or text for facts picked up from a message) · empty (all handled)
 * @figma   — not in wireframes
 * @spec    docs/ux/F02b-profile-aware-chat-intake.md › Review and Confirm
 * @xref    web: W-2.13 — not built
 *
 * Each fact can be changed before it is saved. Save to my profile confirms everything still pending;
 * Don't save drops it all. Nothing reaches the profile from here except through confirmFacts.
 */
import { useState } from 'react';
import { answerPatch, optionLabels, pendingFacts, question } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { PendingFact } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { Button, Input, ListRow, OptionList, OptionRow, Sheet } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useScreenParams } from '@web/navigation';
import styles from './ReviewFacts.module.css';

/** A typed list ("Levothyroxine, Vitamin D") for facts that came from what she wrote. */
const typedPatch = (f: PendingFact, text: string): PendingFact['patch'] => {
  const items = text.split(',').map((x) => x.trim()).filter(Boolean);
  const current = f.patch.intake?.[f.key as keyof NonNullable<PendingFact['patch']['intake']>];
  return { intake: { [f.key]: Array.isArray(current) ? (items.length ? items : ['none']) : text.trim() } };
};

export default function ReviewFacts() {
  const { conversationId = '' } = useScreenParams<{ conversationId: string }>();
  const { dismissSheet } = useNav();
  const toast = useToast();
  const conversation = useAppStore((s) => s.conversations.byId[conversationId]);
  const profile = useAppStore((s) => (conversation ? s.profiles.byId[conversation.profileId] : undefined));
  const [editing, setEditing] = useState<PendingFact>();
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState('');
  const facts = pendingFacts(conversation);
  if (!conversation || !profile) return null;
  const s = useAppStore.getState();

  const startEdit = (f: PendingFact) => {
    const q = f.questionId ? question(f.questionId) : undefined;
    const current = f.patch.intake?.[f.key as never] as unknown;
    setPicked(q ? (Array.isArray(current) ? current.map(String) : current ? [String(current)] : []) : []);
    setText(f.value);
    setEditing(f);
  };

  const saveEdit = () => {
    if (!editing) return;
    const q = editing.questionId ? question(editing.questionId) : undefined;
    if (q) {
      const patch = answerPatch(q, picked, undefined, nowFrom(s), profile);
      s.editFact(conversation.id, editing.id, { patch, value: optionLabels(q, picked) });
    } else {
      s.editFact(conversation.id, editing.id, { patch: typedPatch(editing, text), value: text.trim() || 'None' });
    }
    setEditing(undefined);
  };

  const finish = (save: boolean) => {
    const ids = facts.map((f) => f.id);
    if (save) s.confirmFacts(conversation.id, ids);
    else s.discardFacts(conversation.id, ids);
    dismissSheet();
    toast(save ? 'Saved to your health profile' : 'Nothing was saved');
  };

  if (editing) {
    const q = editing.questionId ? question(editing.questionId) : undefined;
    const toggle = (id: string) =>
      setPicked((xs) => (!q?.multi ? [id] : id === 'none' ? ['none'] : xs.includes(id) ? xs.filter((x) => x !== id) : [...xs.filter((x) => x !== 'none'), id]));
    return (
      <div data-xref="M-2.13 · Review what Deborah noted">
        <Sheet title={editing.label} detent="large" footer={
          <div className={styles.footer}>
            <Button fullWidth disabled={q ? !picked.length : false} onClick={saveEdit}>Use this</Button>
            <Button variant="link" onClick={() => setEditing(undefined)}>Cancel</Button>
          </div>
        }>
          <div className={styles.body}>
            {q ? (
              <>
                <p className={styles.prompt}>{q.prompt}</p>
                <OptionList label={q.prompt} multi={q.multi}>
                  {q.options.map((o) => (
                    <OptionRow key={o.id} multi={q.multi} selected={picked.includes(o.id)} onSelect={() => toggle(o.id)}>{o.label}</OptionRow>
                  ))}
                </OptionList>
              </>
            ) : (
              <Input label={editing.label} value={text} placeholder="Separate several with commas" onChange={(e) => setText(e.target.value)} />
            )}
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div data-xref="M-2.13 · Review what Deborah noted">
      <Sheet title="What Deborah noted" detent="large" footer={
        <div className={styles.footer}>
          {facts.length ? (
            <>
              <Button fullWidth onClick={() => finish(true)}>Save to my profile</Button>
              <Button variant="link" onClick={() => finish(false)}>Don’t save</Button>
            </>
          ) : (
            <Button fullWidth onClick={dismissSheet}>Done</Button>
          )}
        </div>
      }>
        <div className={styles.body}>
          <p className={styles.intro}>{facts.length ? 'Tap anything that isn’t quite right. Nothing is saved until you confirm.' : 'Everything from this conversation has been handled.'}</p>
          <ul className={styles.list}>
            {facts.map((f) => (
              <li key={f.id}>
                <ListRow title={f.label} subtitle={f.value} onPress={() => startEdit(f)} />
              </li>
            ))}
          </ul>
        </div>
      </Sheet>
    </div>
  );
}
