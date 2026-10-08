/**
 * @ui Icon — adapter → Hugeicons (stroke-rounded, 1.5 stroke). The ONLY file that imports the
 * icon library; to switch libraries, change the map (docs/08-component-system.md §4).
 */
import { HugeiconsIcon } from '@hugeicons/react';
import { DeborahBlob } from '../DeborahBlob';
import {
  Menu01Icon,
  Notification03Icon,
  AiSearch02Icon,
  UserGroupIcon,
  Add01Icon,
  Alert02Icon,
  AppleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  Book02Icon,
  BubbleChatIcon,
  Calendar03Icon,
  CallIcon,
  Camera01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  FavouriteIcon,
  GoogleIcon,
  File01Icon,
  InformationCircleIcon,
  LinkSquare02Icon,
  Location01Icon,
  Mail01Icon,
  MedicineBottle01Icon,
  Mic01Icon,
  MoreHorizontalIcon,
  Note01Icon,
  PencilEdit02Icon,
  PlayIcon,
  Pdf01Icon,
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
  UserIcon,
  Video01Icon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons';

const map = {
  chat: BubbleChatIcon,
  health: FavouriteIcon,
  account: UserIcon,
  mic: Mic01Icon,
  bell: Notification03Icon,
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
  camera: Camera01Icon,
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
  apple: AppleIcon,
  google: GoogleIcon,
  mail: Mail01Icon,
  delete: Delete02Icon,
  edit: PencilEdit02Icon,
  labs: TestTube01Icon,
  success: CheckmarkCircle02Icon,
  play: PlayIcon,
  search: Search01Icon,
  menu: Menu01Icon,
  aiSearch: AiSearch02Icon,
  family: UserGroupIcon,
} as const;

/** `deborah` is not a glyph: it renders the small Deborah orb wherever an action means "Ask Deborah". */
export type IconName = keyof typeof map | 'deborah';

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 24, strokeWidth = 1.5, className }: IconProps) {
  if (name === 'deborah') return <DeborahBlob size={size} className={className} />;
  return <HugeiconsIcon icon={map[name]} size={size} strokeWidth={strokeWidth} color="currentColor" aria-hidden className={className} />;
}
