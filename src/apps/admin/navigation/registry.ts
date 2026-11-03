/** Admin screen registry: route id → screen ID + component. Rows mirror docs/xref.md (A-*). */
import type { ComponentType } from 'react';
import Dashboard from '@admin/screens/dashboard/Dashboard';
import Clients from '@admin/screens/clients/Clients';
import Escalations from '@admin/screens/escalations/Escalations';
import Support from '@admin/screens/support/Support';
import Subscriptions from '@admin/screens/subscriptions/Subscriptions';
import Admins from '@admin/screens/admins/Admins';
import AuditLog from '@admin/screens/audit/AuditLog';
import Consent from '@admin/screens/compliance/Consent';
import type { AdminRoute } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Screen = { screenId: string; component: ComponentType<any> };

export const REGISTRY: Record<AdminRoute['id'], Screen> = {
  dashboard: { screenId: 'A-2.1', component: Dashboard },
  clients: { screenId: 'A-3.1', component: Clients },
  escalations: { screenId: 'A-4.1', component: Escalations },
  support: { screenId: 'A-5.1', component: Support },
  subscriptions: { screenId: 'A-7.1', component: Subscriptions },
  admins: { screenId: 'A-6.1', component: Admins },
  audit: { screenId: 'A-8.1', component: AuditLog },
  compliance: { screenId: 'A-9.1', component: Consent },
};
