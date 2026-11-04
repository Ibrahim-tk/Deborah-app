/** @nav NavSheet — phone navigation: the sidebar in a leading-edge Sheet. Picking a section closes it (`go`). */
import { Sheet } from '@admin/ui';
import { AdminSidebar } from '../AdminSidebar';
import { useAdminNav } from '../nav.store';

export function NavSheet() {
  const open = useAdminNav((s) => s.navOpen);
  const setOpen = useAdminNav((s) => s.setNavOpen);
  return (
    <Sheet open={open} onOpenChange={setOpen} label="Navigation">
      <AdminSidebar inSheet />
    </Sheet>
  );
}
