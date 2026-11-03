/** @ui Icon (admin adapter) — adds the console's own glyphs and falls back to the web Icon for the rest.
 *  The only admin file that imports the icon library (CLAUDE.md §7). */
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUp02Icon, CreditCardIcon, CustomerSupportIcon, DashboardSquare01Icon, LicenseIcon, Logout01Icon, MoreVerticalIcon, Shield01Icon, StripeIcon, DropboxIcon, ShopifyIcon, GoogleDocIcon, Plug01Icon, JusticeScale01Icon, ArrowUpRight01Icon,
  UserMultipleIcon, UserSettings01Icon, WorkHistoryIcon,
} from '@hugeicons/core-free-icons';
import { Icon as WebIcon, type IconName as WebIconName } from '@web/ui';

const own = {
  dashboard: DashboardSquare01Icon,
  clients: UserMultipleIcon,
  support: CustomerSupportIcon,
  billing: CreditCardIcon,
  admins: UserSettings01Icon,
  audit: WorkHistoryIcon,
  shield: Shield01Icon,
  consent: LicenseIcon,
  signOut: Logout01Icon,
  sortArrow: ArrowUp02Icon,
  columnMenu: MoreVerticalIcon,
  stripe: StripeIcon,
  dropbox: DropboxIcon,
  shopify: ShopifyIcon,
  googleDocs: GoogleDocIcon,
  integrations: Plug01Icon,
  compliance: JusticeScale01Icon,
  arrowUpRight: ArrowUpRight01Icon,
};

export type IconName = WebIconName | keyof typeof own;

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  if (name in own) {
    return <HugeiconsIcon icon={own[name as keyof typeof own]} size={size} strokeWidth={1.5} color="currentColor" aria-hidden className={className} />;
  }
  return <WebIcon name={name as WebIconName} size={size} className={className} />;
}
