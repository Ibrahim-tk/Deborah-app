/** Audit log categories and roles (story 10.1). Entries record that something happened, never what was said,
 *  and can't be edited or deleted by anyone. */
export type AuditRole = 'client' | 'teen' | 'admin' | 'super' | 'system';
export type AuditCategory = 'security' | 'clients' | 'consent' | 'data' | 'escalations' | 'support' | 'knowledge' | 'admins' | 'plans' | 'views';

export const AUDIT_ROLE: Record<AuditRole, string> = { client: 'Client', teen: 'Teen', admin: 'Admin', super: 'Super Admin', system: 'System' };

export const AUDIT_CATEGORY: Record<AuditCategory, string> = {
  security: 'Sign-in and security',
  clients: 'Client accounts',
  consent: 'Consent',
  data: 'Data',
  escalations: 'Escalations',
  support: 'Support requests',
  knowledge: 'Knowledge base',
  admins: 'Admins',
  plans: 'Plans',
  views: 'Admin views',
};

/** Picks a category from the action text, for entries written by the console's own actions. */
export function categorize(text: string): AuditCategory {
  const t = text.toLowerCase();
  if (/sign|password|verification|session|locked/.test(t)) return 'security';
  if (/viewed/.test(t)) return 'views';
  if (/escalation/.test(t)) return 'escalations';
  if (/support request|note to support/.test(t)) return 'support';
  if (/deletion|legal hold|transfer|export/.test(t)) return 'data';
  if (/consent|policy|version/.test(t)) return 'consent';
  if (/admin|invite/.test(t)) return 'admins';
  if (/plan|price|stripe/.test(t)) return 'plans';
  if (/content|knowledge|gap/.test(t)) return 'knowledge';
  return 'clients';
}
