/** Admin screen registry: route id → screen ID + component. Rows mirror docs/xref.md (A-*). */
import type { ComponentType } from 'react';
import Dashboard from '@admin/screens/dashboard/Dashboard';
import Clients from '@admin/screens/clients/Clients';
import ClientDetail from '@admin/screens/clients/ClientDetail';
import DependentProfile from '@admin/screens/clients/DependentProfile';
import Escalations from '@admin/screens/escalations/Escalations';
import EscalationDetail from '@admin/screens/escalations/EscalationDetail';
import Support from '@admin/screens/support/Support';
import DeletionRequest from '@admin/screens/support/DeletionRequest';
import Subscriptions from '@admin/screens/subscriptions/Subscriptions';
import PlanEditor from '@admin/screens/subscriptions/PlanEditor';
import Admins from '@admin/screens/admins/Admins';
import AuditLog from '@admin/screens/audit/AuditLog';
import Consent from '@admin/screens/compliance/Consent';
import type { AdminRoute } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Screen = { screenId: string; component: ComponentType<any> };

export const REGISTRY: Record<AdminRoute['id'], Screen> = {
  dashboard: { screenId: 'A-2.1', component: Dashboard },
  clients: { screenId: 'A-3.1', component: Clients },
  client: { screenId: 'A-3.2', component: ClientDetail },
  dependent: { screenId: 'A-3.3', component: DependentProfile },
  escalations: { screenId: 'A-4.1', component: Escalations },
  escalation: { screenId: 'A-4.2', component: EscalationDetail },
  support: { screenId: 'A-5.1', component: Support },
  deletion: { screenId: 'A-5.2', component: DeletionRequest },
  subscriptions: { screenId: 'A-7.1', component: Subscriptions },
  plan: { screenId: 'A-7.3', component: PlanEditor },
  admins: { screenId: 'A-6.1', component: Admins },
  audit: { screenId: 'A-8.1', component: AuditLog },
  compliance: { screenId: 'A-9.1', component: Consent },
};
