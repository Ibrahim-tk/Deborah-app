/**
 * @pattern ProfileCard — intake V2 Step D: one card in the chat with every required row. Answered
 *          rows show the value and where it came from (tap to edit); missing rows show their widget
 *          inline. "Looks right" stays disabled until every row has a value or "None"; saving fills
 *          the progress ring. Country is inferred from the device and only shown in the footer.
 * @usedBy  M-2.1 (intake V2), M-2.10 (Build your health profile)
 * @spec    intake V2 brief §3 Step D (design direction 2026-10-12) — OPEN: not in docs/ux yet
 * @xref    web: apps/web/patterns/intake/ProfileCard — not built
 */
import { useState } from 'react';
import { intakeSuggestionData } from '@flow-v1/shared/data';
import { profileCompletion } from '@flow-v1/shared/engine';
import type { HealthField, HealthProfile, RequiredField } from '@flow-v1/shared/types/health';
import { Button, ProgressRing, Select } from '@flow-v1/apps/mobile/ui';
import { ListField } from './parts/ListField';
import { Row } from './parts/Row';
import { AgeWidget, MeasureWidget, SEX_CHOICES, SexWidget } from './parts/Widgets';
import { formatHeight, formatWeight, localeUnits, type Units } from './units';
import styles from './ProfileCard.module.css';

type ListKey = 'medications' | 'allergies' | 'conditions';

export interface ProfileCardProps {
  health?: HealthProfile;
  now: Date;
  /** Writes one or more fields (source manual unless the caller says otherwise). */
  onPatch: (patch: Partial<HealthProfile>) => void;
  onConfirm: () => void;
  onScan: (field: ListKey) => void;
  completed?: boolean;
}

const COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'DE', 'FR', 'IN', 'ZA'];
const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
};

export function ProfileCard({ health = {}, now, onPatch, onConfirm, onScan, completed }: ProfileCardProps) {
  const [editing, setEditing] = useState<RequiredField | null>(null);
  const [units, setUnits] = useState<Units>(localeUnits);
  const [countryOpen, setCountryOpen] = useState(false);
  const thisYear = now.getFullYear();
  const stamp = now.toISOString();
  const manual = <T,>(value: T): HealthField<T> => ({ value, source: 'manual', updatedAt: stamp });
  const set = (key: RequiredField, field: HealthField<unknown>) => {
    onPatch({ [key]: field } as Partial<HealthProfile>);
    setEditing(null);
  };
  const row = (key: RequiredField) => ({ editing: editing === key, onEdit: () => setEditing(key), source: health[key]?.source, confidence: health[key]?.confidence });
  const listText = (key: ListKey) => {
    const v = health[key]?.value as { name?: string; substance?: string; dose?: string }[] | undefined;
    if (!v) return undefined;
    return v.length ? v.map((x) => [x.name ?? x.substance, x.dose].filter(Boolean).join(' ')).join(', ') : 'None';
  };
  const listNames = (key: ListKey) => (health[key]?.value as { name?: string; substance?: string }[] | undefined)?.map((x) => x.name ?? x.substance ?? '');
  const setList = (key: ListKey, names: string[]) =>
    onPatch({ [key]: manual(names.map((n) => (key === 'allergies' ? { substance: n } : { name: n }))) } as Partial<HealthProfile>);

  const progress = profileCompletion(health);
  const ready = progress === 1;
  const by = health.birthYear?.value;
  const region = health.country?.value;

  const lists: { key: ListKey; label: string; suggestions: string[] }[] = [
    { key: 'medications', label: 'Medications & supplements', suggestions: [...intakeSuggestionData.medications, ...intakeSuggestionData.supplements] },
    { key: 'allergies', label: 'Allergies', suggestions: intakeSuggestionData.allergies },
    { key: 'conditions', label: 'Conditions', suggestions: intakeSuggestionData.conditions },
  ];

  return (
    <section className={styles.root} aria-labelledby="profile-card-title" data-placeholder>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h3 id="profile-card-title" className={styles.title}>Your health profile</h3>
          <p className={styles.sub}>{completed ? 'Saved. You can change it any time.' : 'Check what I have, fill in the rest.'}</p>
        </div>
        <ProgressRing value={completed ? 1 : progress * 0.9} label="Health profile progress" />
      </header>

      <ul className={styles.rows}>
        <Row label="Age" value={by ? `${thisYear - by} (born ${by})` : undefined} {...row('birthYear')}>
          <AgeWidget initial={by ?? thisYear - 35} thisYear={thisYear} onSet={(y) => set('birthYear', manual(y))} />
        </Row>
        <Row label="Sex at birth" value={SEX_CHOICES.find((c) => c.value === health.sexAtBirth?.value)?.label} {...row('sexAtBirth')}>
          <SexWidget value={health.sexAtBirth?.value} onSet={(v) => set('sexAtBirth', manual(v))} />
        </Row>
        <Row label="Height" value={health.heightCm && formatHeight(health.heightCm.value, units)} {...row('heightCm')}>
          <MeasureWidget kind="height" initial={health.heightCm?.value ?? 165} units={units} onUnits={setUnits} onSet={(v) => set('heightCm', manual(v))} />
        </Row>
        <Row label="Weight" value={health.weightKg && formatWeight(health.weightKg.value, units)} {...row('weightKg')}>
          <MeasureWidget kind="weight" initial={health.weightKg?.value ?? 70} units={units} onUnits={setUnits} onSet={(v) => set('weightKg', manual(v))} />
        </Row>
        {lists.map((l) => (
          <Row key={l.key} label={l.label} value={listText(l.key)} {...row(l.key)}>
            <ListField
              label={l.label}
              items={listNames(l.key)}
              suggestions={l.suggestions}
              onChange={(names) => setList(l.key, names)}
              onDone={() => setEditing(null)}
              onScan={() => onScan(l.key)}
            />
          </Row>
        ))}
      </ul>

      <footer className={styles.foot}>
        <p className={styles.country}>
          Country: {region ? countryName(region) : '—'}{' '}
          <button type="button" className={styles.inline} aria-expanded={countryOpen} onClick={() => setCountryOpen((o) => !o)}>
            Change
          </button>
        </p>
        {countryOpen && (
          <Select
            label="Country"
            value={region}
            options={COUNTRIES.map((c) => ({ value: c, label: countryName(c) }))}
            onChange={(c) => {
              onPatch({ country: manual(c) });
              setCountryOpen(false);
            }}
          />
        )}
        {!completed && (
          <Button fullWidth disabled={!ready} onClick={onConfirm}>
            Looks right
          </Button>
        )}
      </footer>
    </section>
  );
}
