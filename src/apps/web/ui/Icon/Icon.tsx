/**
 * @ui      Icon — adapter → Hugeicons (stroke-rounded, 1.5 stroke). The ONLY web file that imports the
 *          icon library; to switch libraries, change the map (docs/08-component-system.md §4).
 * @usedBy  everywhere in apps/web
 * @xref    mobile: apps/mobile/ui/Icon (same semantic names, separate implementation)
 */
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  Book02Icon,
  BubbleChatIcon,
  Calendar03Icon,
  CallIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  FavouriteIcon,
  File01Icon,
  InformationCircleIcon,
  LinkSquare02Icon,
  Location01Icon,
  Logout01Icon,
  Mail01Icon,
  MedicineBottle01Icon,
  Menu01Icon,
  Mic01Icon,
  MoreHorizontalIcon,
  Note01Icon,
  Pdf01Icon,
  PencilEdit02Icon,
  PlayIcon,
  RefreshIcon,
  Search01Icon,
  Share08Icon,
  ShoppingBag02Icon,
  SquareLock02Icon,
  StopIcon,
  TestTube01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Tick02Icon,
  Upload04Icon,
  UserAdd01Icon,
  UserIcon,
  Video01Icon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons';

const map = {
  chat: BubbleChatIcon,
  health: FavouriteIcon,
  account: UserIcon,
  mic: Mic01Icon,
  send: ArrowUp02Icon,
  stop: StopIcon,
  back: ArrowLeft01Icon,
  close: Cancel01Icon,
  info: InformationCircleIcon,
  check: Tick02Icon,
  chevron: ArrowRight01Icon,
  chevronDown: ArrowDown01Icon,
  plus: Add01Icon,
  lock: SquareLock02Icon,
  shop: ShoppingBag02Icon,
  calendar: Calendar03Icon,
  upload: Upload04Icon,
  file: File01Icon,
  phone: CallIcon,
  alert: Alert02Icon,
  copy: Copy01Icon,
  listen: VolumeHighIcon,
  thumbsUp: ThumbsUpIcon,
  thumbsDown: ThumbsDownIcon,
  share: Share08Icon,
  pdf: Pdf01Icon,
  note: Note01Icon,
  book: Book02Icon,
  video: Video01Icon,
  refresh: RefreshIcon,
  more: MoreHorizontalIcon,
  medicine: MedicineBottle01Icon,
  location: Location01Icon,
  external: LinkSquare02Icon,
  mail: Mail01Icon,
  delete: Delete02Icon,
  edit: PencilEdit02Icon,
  labs: TestTube01Icon,
  success: CheckmarkCircle02Icon,
  play: PlayIcon,
  search: Search01Icon,
  menu: Menu01Icon,
  logout: Logout01Icon,
  'user-add': UserAdd01Icon,
} as const;

export type IconName = keyof typeof map;

export interface IconProps {
  name: IconName;
  /** px; 24 default, 22 in buttons and sidebar rows. */
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/** Decorative by default (aria-hidden): give the surrounding control the accessible name. */
export function Icon({ name, size = 24, strokeWidth = 1.5, className }: IconProps) {
  return <HugeiconsIcon icon={map[name]} size={size} strokeWidth={strokeWidth} color="currentColor" aria-hidden className={className} />;
}
