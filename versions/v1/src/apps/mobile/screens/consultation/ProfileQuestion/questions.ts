/** Deferred profile questions (intake V2 §4): never asked in the first run. Placeholder copy. */
export type DeferredTopic = 'genderIdentity' | 'lifestyle' | 'careContext' | 'fullDob';

export interface DeferredQuestion {
  key: string;
  prompt: string;
  choices: string[];
}

export const DEFERRED: Record<DeferredTopic, { title: string; questions: DeferredQuestion[] }> = {
  genderIdentity: {
    title: 'Gender identity',
    questions: [{ key: 'gender', prompt: 'How do you describe your gender? (optional)', choices: ['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'] }],
  },
  lifestyle: {
    title: 'Lifestyle',
    questions: [
      { key: 'sleep', prompt: 'How do you usually sleep?', choices: ['Well', 'On and off', 'Poorly'] },
      { key: 'diet', prompt: 'How would you describe how you eat?', choices: ['Mostly whole foods', 'Mixed', 'Lots of convenience food'] },
      { key: 'exercise', prompt: 'How often do you move or exercise?', choices: ['Most days', 'A few times a week', 'Rarely'] },
      { key: 'stress', prompt: 'How’s your stress lately?', choices: ['Low', 'Some', 'High'] },
      { key: 'alcohol', prompt: 'Alcohol or smoking?', choices: ['Neither', 'Alcohol sometimes', 'I smoke', 'Both'] },
    ],
  },
  careContext: {
    title: 'Your care',
    questions: [
      { key: 'provider', prompt: 'Do you have a primary care provider?', choices: ['Yes', 'No'] },
      { key: 'specialists', prompt: 'Do you see any specialists?', choices: ['No', 'Endocrinologist', 'Gynecologist', 'Other'] },
      { key: 'appointments', prompt: 'Any appointments coming up?', choices: ['No', 'In the next month', 'Later'] },
    ],
  },
  fullDob: { title: 'Date of birth', questions: [] },
};
