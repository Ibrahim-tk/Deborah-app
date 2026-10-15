import { CORE_JOURNEYS } from './coreJourneys';
import { EXTENDED_JOURNEYS } from './extendedJourneys';
export const MANUAL_JOURNEYS = [...CORE_JOURNEYS, ...EXTENDED_JOURNEYS];
export const DEMO_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_JOURNEY_DEMO === 'true';
