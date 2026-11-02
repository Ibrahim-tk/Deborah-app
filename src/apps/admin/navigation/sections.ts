/** Sidebar destinations, in rail order. `superOnly` sections are hidden from plain admins. */
import type { IconName } from '@admin/ui';
import type { SectionId } from './types';

export const SECTIONS: { id: SectionId; label: string; icon: IconName; superOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'clients', label: 'Clients', icon: 'clients' },
  { id: 'escalations', label: 'Escalations', icon: 'alert' },
  { id: 'support', label: 'Support requests', icon: 'support' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'billing', superOnly: true },
  { id: 'admins', label: 'Admin users', icon: 'admins', superOnly: true },
  { id: 'audit', label: 'Audit log', icon: 'audit' },
  { id: 'compliance', label: 'Consent', icon: 'consent' },
];
