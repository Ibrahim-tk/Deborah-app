/** Opens the A-13.3 upload / edit modal: 'new', 'new:<gapId>' (answer a gap) or a content id (edit). */
import { useKnowledge } from '@shared/admin';
import { useAdminNav } from '@admin/navigation';

export function openEditor(param: string) {
  useKnowledge.getState().setNotice('');
  const nav = useAdminNav.getState();
  nav.closeDrawer();
  if (nav.stack[0].id !== 'knowledge') nav.go('knowledge');
  useKnowledge.getState().setEditor(param);
}
