/**
 * @ui Icon — adapter → Hugeicons (stroke-rounded, 1.5 stroke). The ONLY file that imports the
 * icon library; to switch libraries, change the map (docs/08-component-system.md §4).
 */
import { HugeiconsIcon } from '@hugeicons/react';
import { DeborahBlob } from '../DeborahBlob';
import {
  Menu01Icon,
  Notification03Icon,
  Settings01Icon,
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
  FlashIcon,
  FlashOffIcon,
  FlaskConicalIcon,
  Image01Icon,
  InformationCircleIcon,
  Moon02Icon,
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
  Download04Icon,
  UserIcon,
  Video01Icon,
  VolumeHighIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';

const map = {
  chat: BubbleChatIcon,
  health: FavouriteIcon,
  account: UserIcon,
  mic: Mic01Icon,
  bell: Notification03Icon,
  settings: Settings01Icon,
  send: ArrowUp02Icon,
  stop: StopIcon,
  back: ArrowLeft01Icon,
  close: Cancel01Icon,
  info: InformationCircleIcon,
  check: Tick02Icon,
  chevron: ArrowRight01Icon,
  chevronDown: ArrowDown01Icon,
  plus: Add01Icon,
  eye: ViewIcon,
  eyeOff: ViewOffSlashIcon,
  lock: SquareLock02Icon,
  shop: ShoppingBag02Icon,
  calendar: Calendar03Icon,
  upload: Upload04Icon,
  download: Download04Icon,
  camera: Camera01Icon,
  file: File01Icon,
  flash: FlashIcon,
  flashOff: FlashOffIcon,
  image: Image01Icon,
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
  flask: FlaskConicalIcon,
  moon: Moon02Icon,
  success: CheckmarkCircle02Icon,
  play: PlayIcon,
  search: Search01Icon,
  menu: Menu01Icon,
  aiSearch: AiSearch02Icon,
  family: UserGroupIcon,
} as const;

/** `deborah` is not a glyph: it renders the small Deborah orb wherever an action means "Ask Deborah". */
export type IconName = keyof typeof map | 'deborah' | 'appleFilled';

// Solid Apple logo — Hugeicons' free set only ships the outline.
const APPLE_SOLID = 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 24, strokeWidth = 1.5, className }: IconProps) {
  if (name === 'deborah') return <DeborahBlob size={size} className={className} />;
  if (name === 'appleFilled') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d={APPLE_SOLID} /></svg>;
  return <HugeiconsIcon icon={map[name]} size={size} strokeWidth={strokeWidth} color="currentColor" aria-hidden className={className} />;
}
