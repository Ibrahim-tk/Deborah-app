/**
 * @screen  M-6.2 · Add family member
 * @flow    F06 Family profiles
 * @states  empty · filling · minor (guardian consent) · adult (agreement consent) · DOB in future · under 13 (blocked) · valid · discard confirm
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-203
 * @spec    docs/ux/F06-family-profiles.md#m-62--add-family-member
 * @xref    web: W-6.2 (apps/web/screens/profiles/AddMember) — not built
 *
 * OPEN: "teen privacy (can the teen have her own login?), adult consent model (husband), whether
 * male health is in scope." Prototype: no separate login; medical-advocate radios for consent;
 * "Male" is offered as sex at birth but the engine has no male-specific content.
 */
import { Fragment, useState, type ReactNode } from 'react';
import { consentDoc } from '@shared/data';
import { ageBandFor, ageGroupFor } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { Profile } from '@shared/types/domain';
import { nowFrom, uid } from '@shared/utils';
import { Button, Checkbox, Input, Modal, Panel, Select, useAlert } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav } from '@mobile/navigation';
import { useMemberForm } from './useMemberForm';
import styles from './AddMember.module.css';

/** Split `{name}` placeholders and wrap the person name at medium weight (≤500). */
function withName(template: string, who: string): ReactNode {
  const parts = template.split('{name}');
  if (parts.length === 1) return template;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <strong className={styles.name}>{who}</strong>}
      {part}
    </Fragment>
  ));
}

type Relation = Exclude<Profile['relationship'], 'self'>;
type Sex = NonNullable<Profile['sexAtBirth']>;

const RELATIONSHIPS: { value: Relation; label: string }[] = [
  { value: 'daughter', label: 'Daughter' },
  { value: 'son', label: 'Son' },
  { value: 'partner', label: 'Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Other' },
];

const SEXES: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

export default function AddMember() {
  const { dismissModal, switchProfile, openAsk } = useNav();
  const alert = useAlert();
  const toast = useToast();
  const form = useMemberForm();
  const { values, set, age, minor, dobError, underThirteen, valid, dirty, today, consentValue, setConsent } = form;
  const [creating, setCreating] = useState(false);
  const { body, options } = consentDoc.profileConsent;
  const consentName = values.name.trim() || 'them';

  const close = async () => {
    if (!dirty) return dismissModal();
    const choice = await alert({
      title: 'Discard this profile?',
      message: 'What you’ve entered won’t be saved.',
      buttons: [{ label: 'Keep editing', style: 'cancel' }, { label: 'Discard', style: 'destructive' }],
    });
    if (choice === 1) dismissModal();
  };

  const create = () => {
    if (!valid || age === null || creating) return;
    setCreating(true);
    const s = useAppStore.getState();
    const now = nowFrom(s).toISOString();
    const id = uid('p');
    const name = values.name.trim();
    const group = ageGroupFor(age);
    const path: NonNullable<Profile['consent']>['path'] =
      consentValue === 'guardian'
        ? group === 'adult'
          ? 'adult-agreement'
          : group === 'child'
            ? 'guardian-child'
            : 'guardian-teen'
        : 'adult-agreement';
    s.addProfile({
      id,
      name,
      relationship: values.relationship ?? 'other',
      // Noon local time so the stored date never shifts a day across time zones.
      dob: new Date(`${values.dob}T12:00:00`).toISOString(),
      sexAtBirth: values.sex,
      intake: { ageBand: ageBandFor(age), conditions: [], medications: [] },
      createdAt: now,
      guardianConsentAt: minor ? now : undefined,
      consent: { path, attestedAt: now, attestedBy: s.accountId ?? s.profiles.order[0] },
    });
    // switchProfile closes the modal and resets Ask + My Health; openAsk lands on a fresh
    // Conversation, which is empty for the new profile ("Let's talk about {name}." + teen suggestions).
    switchProfile(id);
    openAsk();
    toast(`Now asking for ${name}`);
  };

  return (
    <div className={styles.root} data-xref="M-6.2 · Add family member">
      <Modal
        title="Add family member"
        onClose={close}
        footer={<Button fullWidth disabled={!valid} loading={creating} onClick={create}>Create profile</Button>}
      >
        <form className={styles.body} noValidate onSubmit={(e) => { e.preventDefault(); create(); }}>
          <Input
            label="First name"
            autoComplete="off"
            autoCapitalize="words"
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
          />
          <Select label="Relationship" options={RELATIONSHIPS} value={values.relationship} onChange={(relationship) => set({ relationship })} />
          <Input
            label="Date of birth"
            type="date"
            max={today}
            value={values.dob}
            error={dobError}
            onChange={(e) => set({ dob: e.target.value })}
          />
          {underThirteen && (
            // OPEN: "COPPA rules — prototype blocks under 13" (F06 M-6.2 validation).
            <Panel tone="warning" icon="alert">
              <p className={styles.notice}>Profiles for children under 13 need extra consent steps.</p>
            </Panel>
          )}
          <Select label="Sex at birth" options={SEXES} value={values.sex} onChange={(sex) => set({ sex })} />
          {!underThirteen && (
            <div className={styles.consent} data-placeholder>
              <p className={styles.consentBody}>{withName(body, consentName)}</p>
              <div className={styles.consentChecks} role="group" aria-label="Confirm your authority">
                {options.map((o) => (
                  <Checkbox
                    key={o.value}
                    checked={consentValue === o.value}
                    onChange={(on) => (on ? setConsent(o.value) : setConsent(''))}
                    label={withName(o.label, consentName)}
                  />
                ))}
              </div>
            </div>
          )}
          <p className={styles.hint}>Each person has their own private history. Nothing is shared between profiles.</p>
        </form>
      </Modal>
    </div>
  );
}
