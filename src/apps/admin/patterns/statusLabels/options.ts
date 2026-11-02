import type { SubscriptionStatus } from '@shared/admin';
import { SUB } from './tones';

export const SUBSCRIPTION_OPTIONS = Object.entries(SUB).map(([value, [label]]) => ({ value: value as SubscriptionStatus, label }));
