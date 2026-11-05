/** Sidebar destinations in rail order. `superOnly` sections are hidden from plain admins. */
import type { IconName } from '@admin/ui';
import type { SectionId } from './types';

export const SECTIONS: { id: SectionId; label: string; icon: IconName; superOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'clients', label: 'Clients', icon: 'clients' },
  { id: 'admins', label: 'Admin users', icon: 'admins', superOnly: true },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'billing', superOnly: true },
  { id: 'escalations', label: 'Escalations', icon: 'alert' },
  { id: 'integrations', label: 'Integrations', icon: 'integrations', superOnly: true },
  { id: 'compliance', label: 'Consent', icon: 'consent' },
  { id: 'knowledge', label: 'Knowledge Base', icon: 'book' },
  { id: 'audit', label: 'Audit log', icon: 'audit' },
  { id: 'support', label: 'Support requests', icon: 'support' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
