/**
 * @screen  M-6.2 · Add family member
 * @flow    F06 Family profiles
 * @states  empty · filling · describe (relationship / gender / pronouns) · minor (Boy / Girl labels) · DOB in future
 *          · valid · consent sheet (on Create profile) · discard confirm
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203
 * @spec    docs/ux/F06-family-profiles.md#m-62--add-family-member
 * @xref    mobile twin; web: W-6.2 (apps/web/screens/profiles/AddMember) — not built
 *
 * Same questions and branches as the onboarding intake for someone else (M-1.8), as one form.
 * The medical-advocate consent opens as a bottom sheet only after "Create profile".
 * OPEN: "teen privacy (can the teen have her own login?), adult consent model (husband), whether
 * male health is in scope." Prototype: no separate login; "Male" has no male-specific content.
 */
import { useState } from 'react';
import { Button, DateField, Input, Select, useAlert } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { useToast } from '@web/hooks/toast.store';
import { useNav } from '@web/navigation';
import { choiceLabel, orderedChoices, type Step } from '@web/screens/onboarding/HealthBasics/steps';
import { saveOnboarding } from '@web/screens/onboarding/HealthBasics/saveOnboarding';
import { ConsentSheet } from '@web/screens/onboarding/HealthBasics/parts/ConsentSheet';
import { useMemberForm } from './useMemberForm';
import styles from './AddMember.module.css';

/** Short field labels for the intake questions (the intake asks them as full sentences). */
const LABELS: Record<string, string> = {
  relationship: 'Relationship',
  memberName: 'First name',
  birthDate: 'Date of birth',
  sex: 'Sex assigned at birth',
  gender: 'Gender',
  pronouns: 'Pronouns',
};

export default function AddMember() {
  const { pop, switchProfile, openAsk } = useNav();
  const alert = useAlert();
  const toast = useToast();
  const { answers, set, fields, today, age, dobError, valid, dirty } = useMemberForm();
  const thisYear = Number(today.slice(0, 4));
  const [consentOpen, setConsentOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const close = async () => {
    if (!dirty) return pop();
    const choice = await alert({
      title: 'Discard this profile?',
      message: 'What you’ve entered won’t be saved.',
      buttons: [{ label: 'Keep editing', style: 'cancel' }, { label: 'Discard', style: 'destructive' }],
    });
    if (choice === 1) pop();
  };

  const create = () => {
    if (creating) return;
    setCreating(true);
    setConsentOpen(false);
    const id = saveOnboarding(answers);
    // switchProfile closes the modal and resets Ask + My Health; openAsk lands on a fresh Conversation.
    switchProfile(id);
    openAsk();
    toast(`Now asking for ${answers.memberName?.trim()}`);
  };

  const field = (s: Step) => {
    const label = LABELS[s.key] ?? s.title;
    const value = answers[s.key] ?? '';
    if (s.kind === 'name') {
      return <Input key={s.key} label={label} autoComplete="off" autoCapitalize="words" maxLength={40} value={value} onChange={(e) => set(s.key, e.target.value)} />;
    }
    if (s.kind === 'date') {
      // Our own date wheel, not the browser picker (designer, 2026-10-29).
      return <DateField key={s.key} label={label} value={value} minYear={thisYear - 100} maxYear={thisYear} defaultYear={thisYear - 10} error={dobError} onChange={(d) => set(s.key, d)} />;
    }
    const options = orderedChoices(s, answers).map((c) => ({ value: c.value, label: choiceLabel(s, c.value, c.label, answers) }));
    const describing = Boolean(s.describeKey && value === s.describeValue);
    return (
      <div key={s.key} className={styles.group}>
        <Select label={label} options={options} value={value || undefined} onChange={(v) => set(s.key, v)} />
        {describing && (
          <Input
            label={s.describeLabel ?? label}
            hideLabel
            placeholder={s.describePlaceholder}
            autoComplete="off"
            maxLength={80}
            value={answers[s.describeKey!] ?? ''}
            onChange={(e) => set(s.describeKey!, e.target.value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.root} data-xref="M-6.2 · Add family member">
      <DerivedPage contentWidth={560} title="Add family member" onBack={() => void close()}>
        <form className={styles.body} noValidate onSubmit={(e) => { e.preventDefault(); if (valid) setConsentOpen(true); }}>
          {fields.map(field)}
          {/* Under 13 (Oct 26 legal): parent or guardian records and asks; the child never chats. Mirrors web. */}
          {age !== undefined && age < 13 && <p className={styles.hint}>Profiles for children under 13 are for parents and guardians only. You’ll ask questions on their behalf.</p>}
          <p className={styles.hint}>You’ll manage this profile as their medical advocate. Their history stays on this profile — separate from yours.</p>
          <Button type="submit" fullWidth disabled={!valid} loading={creating}>Create profile</Button>
        </form>
      </DerivedPage>
      <ConsentSheet
        open={consentOpen}
        name={answers.memberName ?? ''}
        value={answers.consent ?? ''}
        onChange={(v) => set('consent', v)}
        onBack={() => setConsentOpen(false)}
        onContinue={create}
      />
    </div>
  );
}
