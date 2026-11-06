/** Drawer registry: which screen renders each record kind in the side drawer. Rows mirror docs/xref.md (A-*). */
import type { ComponentType } from 'react';
import ClientDrawer from '@admin/screens/clients/ClientDrawer';
import EscalationDrawer from '@admin/screens/escalations/EscalationDrawer';
import SupportDrawer from '@admin/screens/support/SupportDrawer';
import DeletionDrawer from '@admin/screens/deletion/DeletionDrawer';
import AdminDrawer from '@admin/screens/admins/AdminDrawer';
import PlanDrawer from '@admin/screens/subscriptions/PlanDrawer';
import AuditDrawer from '@admin/screens/audit/AuditDrawer';
import ConsentDrawer from '@admin/screens/compliance/ConsentDrawer';
import StripeEventsDrawer from '@admin/screens/subscriptions/StripeEventsDrawer';
import ContentDrawer from '@admin/screens/knowledge/ContentDrawer';
import GapDrawer from '@admin/screens/knowledge/GapDrawer';
import type { DrawerTarget } from './types';

export const DRAWERS: Record<DrawerTarget['kind'], ComponentType<{ id: string | null }>> = {
  client: ({ id }) => <ClientDrawer clientId={id!} />,
  escalation: ({ id }) => <EscalationDrawer escalationId={id!} />,
  support: SupportDrawer,
  deletion: DeletionDrawer,
  admin: AdminDrawer,
  plan: PlanDrawer,
  audit: AuditDrawer,
  consent: ConsentDrawer,
  stripeEvents: StripeEventsDrawer,
  content: ContentDrawer,
  gap: ({ id }) => <GapDrawer id={id!} />,
};
