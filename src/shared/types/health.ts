/** Health profile for intake V2 (frictionless intake). Every field remembers where it came from. */
/** `chat`: confirmed through Review and Confirm (plan DN-13). */
export type FieldSource = 'healthkit' | 'inferred' | 'manual' | 'scan' | 'chat';
export type SexAtBirth = 'female' | 'male' | 'intersex';

export interface HealthField<T> {
  value: T;
  source: FieldSource;
  updatedAt: string;
  /** Extraction confidence 0–1; below 0.8 the confirm card asks "Check this". */
  confidence?: number;
}

export interface Medication {
  name: string;
  dose?: string;
  frequency?: string;
}
export interface Allergy {
  substance: string;
  reaction?: string;
}
export interface Condition {
  name: string;
}

/** List rows answer "None" with an empty array; undefined means not answered yet. */
export interface HealthProfile {
  birthYear?: HealthField<number>;
  sexAtBirth?: HealthField<SexAtBirth>;
  heightCm?: HealthField<number>;
  weightKg?: HealthField<number>;
  medications?: HealthField<Medication[]>;
  allergies?: HealthField<Allergy[]>;
  conditions?: HealthField<Condition[]>;
  /** Region code, inferred from the device; editable in the card footer, never asked. */
  country?: HealthField<string>;
  /** Deferred fields: asked only when relevant, or from Home "Complete your profile". */
  genderIdentity?: HealthField<string>;
  lifestyle?: HealthField<Record<string, string>>;
  careContext?: HealthField<Record<string, string>>;
  fullDob?: HealthField<string>;
}

export type IntakeStep = 'consent' | 'connecting' | 'about' | 'reading' | 'confirm' | 'done';

/** Where the in-chat intake stands, so a half-answered intake resumes exactly where it stopped. */
export interface IntakeProgress {
  step: IntakeStep;
  choice?: 'import' | 'manual';
  aboutText?: string;
  aboutSkipped?: boolean;
  completedAt?: string;
  /** Hand-off done: she picked a starting point (or typed), so new empty chats show the normal greeting. */
  closedAt?: string;
}

/** The rows on the confirm card (Step D); all must be answered before "Looks right". */
export const REQUIRED_FIELDS = ['birthYear', 'sexAtBirth', 'heightCm', 'weightKg', 'medications', 'allergies', 'conditions'] as const;
export type RequiredField = (typeof REQUIRED_FIELDS)[number];

/** Mock LLM extraction schema (section 5 of the intake brief). */
export interface Extraction {
  birthYear?: number;
  sexAtBirth?: SexAtBirth;
  heightCm?: number;
  weightKg?: number;
  medications: Medication[];
  supplements: Medication[];
  allergies: Allergy[];
  conditions: Condition[];
  confidence: Partial<Record<'birthYear' | 'sexAtBirth' | 'heightCm' | 'weightKg' | 'medications' | 'allergies' | 'conditions', number>>;
}
