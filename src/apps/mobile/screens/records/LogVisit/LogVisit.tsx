/**
 * @screen  M-9.8 · Log your visit
 * @flow    F09c Log your visit (Miro Step 6)
 * @presentation sheet, large — not drag-dismissible so unsaved edits can be guarded
 * @states  empty (manual) · prefilled (from debrief, log-visit phase 3) · read (saved) · unsaved changes on close · delete confirm
 * @figma   — not in wireframes
 * @spec    docs/ux/F09c-log-visit.md#m-98--log-your-visit
 * @xref    web: W-9.8 — not built
 *
 * Profile updates (phase 4) apply only the ticked rows, on Save, with source 'visit'. Opened from a debrief (`conversationId`), saving hands back to the chat.
 */
import { useState } from 'react';
import { emptyVisitOutcome, hasProviderSpecialty, isVisitOutcomeEmpty, visitOutcomeToText, visitProfileUpdates } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { VisitOutcome } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { ActionSheet, Button, IconButton, ListRow, Sheet, useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useConversation } from '@mobile/hooks/useConversation';
import { useNav, useScreenParams } from '@mobile/navigation';
import { EditSections } from './parts/EditSections';
import { ProfileUpdates } from './parts/ProfileUpdates';
import { ReadView } from './parts/ReadView';
import { useVisitDraft } from './parts/useVisitDraft';
import styles from './LogVisit.module.css';

type Params = {
  noteId?: string;
  profileId?: string;
  /** Step 5 provider-brief this visit follows. */
  briefNoteId?: string;
  /** Prefill from this conversation's debrief (log-visit phase 3). */
  conversationId?: string;
};

export default function LogVisit() {
  const params = useScreenParams<Params>();
  const { dismissSheet, open } = useNav();
  const toast = useToast();
  const alert = useAlert();
  const s = useAppStore.getState();
  const today = nowFrom(s).toISOString();
  // Read once: the sheet owns the draft while open.
  const [noteId, setNoteId] = useState(params.noteId);
  const saved = noteId ? s.notes.byId[noteId] : undefined;
  const profileId = saved?.profileId ?? params.profileId ?? s.activeProfileId;
  const profile = useAppStore((st) => st.profiles.byId[profileId]);
  const profileName = profile?.name ?? '';
  const debrief = params.conversationId ? s.conversations.byId[params.conversationId]?.debrief : undefined;
  const [initial] = useState<VisitOutcome>(() =>
    saved?.visit ?? debrief?.outcome ?? emptyVisitOutcome(today, params.briefNoteId ? s.notes.byId[params.briefNoteId] : undefined),
  );
  const { draft, update, dirty, cleaned, reset } = useVisitDraft(initial);
  const chat = useConversation();
  const [mode, setMode] = useState<'edit' | 'read'>(saved?.visit ? 'read' : 'edit');
  const [menu, setMenu] = useState(false);
  const [off, setOff] = useState<string[]>([]);
  const updates = profile ? visitProfileUpdates(draft, profile) : [];
  const briefId = draft.briefNoteId && s.notes.byId[draft.briefNoteId] ? draft.briefNoteId : undefined;

  const save = () => {
    const outcome = cleaned();
    if (!hasProviderSpecialty(outcome)) {
      void alert({
        title: 'Add the kind of provider',
        message: 'A visit note needs the provider’s specialty before it can be saved.',
        buttons: [{ label: 'OK' }],
      });
      return;
    }
    const st = useAppStore.getState();
    const id = st.saveVisitOutcome(profileId, outcome, noteId);
    const applied = st.applyVisitUpdates(profileId, updates.filter((u) => !off.includes(u.key)));
    setNoteId(id);
    reset(outcome);
    // Opened from a debrief: Deborah confirms and asks "Discuss this with Deborah?".
    if (params.conversationId && !noteId) void chat.debriefSaved(id, outcome, applied);
    toast(applied ? 'Saved — health profile updated' : 'Saved to My Visit Notes');
    dismissSheet();
  };

  const close = async () => {
    if (mode === 'edit' && dirty && !isVisitOutcomeEmpty(draft)) {
      const choice = await alert({
        title: 'Save this visit?',
        message: 'You have changes that aren’t saved yet.',
        buttons: [{ label: 'Discard', style: 'destructive' }, { label: 'Save' }],
      });
      if (choice === 1) return save();
    }
    // Editing a saved visit: back to read mode instead of closing.
    if (mode === 'edit' && saved?.visit) {
      reset(saved.visit);
      setMode('read');
      return;
    }
    dismissSheet();
  };

  const share = async () => {
    setMenu(false);
    try {
      await navigator.clipboard.writeText(visitOutcomeToText(draft, profileName));
      toast('Copied — ready to share');
    } catch {
      toast('Couldn’t copy');
    }
  };

  const remove = async () => {
    setMenu(false);
    const choice = await alert({
      title: 'Delete this visit?',
      message: 'This can’t be undone.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive' }],
    });
    if (choice !== 1 || !noteId) return;
    useAppStore.getState().deleteNote(noteId);
    dismissSheet();
    toast('Deleted');
  };

  const openBrief = () => {
    dismissSheet();
    open('M-9.7', { noteId: briefId });
  };

  // Edit mode exits through the footer's "Not now" (same unsaved-changes check); no separate X.
  const titleEnd = mode === 'read' ? <IconButton icon="more" label="More" onClick={() => setMenu(true)} /> : undefined;

  const footer =
    mode === 'read' ? (
      <div className={styles.footer}>
        <Button fullWidth onClick={dismissSheet}>Done</Button>
      </div>
    ) : (
      <div className={styles.footer}>
        <Button fullWidth disabled={isVisitOutcomeEmpty(draft) || !hasProviderSpecialty(draft)} onClick={save}>Save</Button>
        <Button variant="link" onClick={close}>Not now</Button>
      </div>
    );

  return (
    <div data-xref="M-9.8 · Log your visit">
      <Sheet title={mode === 'read' ? saved?.title ?? 'After my visit' : 'Log your visit'} titleEnd={titleEnd} detent="large" footer={footer}>
        <div className={styles.body}>
          {mode === 'edit' && <p className={styles.intro}>Kind of provider is required. Everything else you can fill in as you remember it.</p>}
          {mode === 'read' ? <ReadView visit={draft} /> : (
            <>
              <EditSections draft={draft} update={update} confidence={debrief?.confidence} today={today} />
              <ProfileUpdates updates={updates} off={off} onToggle={(k) => setOff((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]))} />
            </>
          )}
          {briefId && <ListRow title="Your notes before the visit" subtitle="My Visit Notes for your provider" onPress={openBrief} />}
        </div>
      </Sheet>
      <ActionSheet
        open={menu}
        onClose={() => setMenu(false)}
        actions={[
          { label: 'Edit', onSelect: () => { setMenu(false); setMode('edit'); } },
          { label: 'Share', onSelect: share },
          { label: 'Delete', onSelect: remove, destructive: true },
        ]}
      />
    </div>
  );
}
