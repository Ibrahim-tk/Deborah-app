/**
 * @ui Icon — adapter → Hugeicons (stroke-rounded, 1.5 stroke). The ONLY file that imports the
 * icon library; to switch libraries, change the map (docs/08-component-system.md §4).
 */
import { HugeiconsIcon } from '@hugeicons/react';
import { DeborahBlob } from '../DeborahBlob';
import {
  StethoscopeIcon,
  Menu01Icon,
  SidebarLeftIcon,
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
  ChatAddIcon,
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
  Download01Icon,
  UserIcon,
  Video01Icon,
  VolumeHighIcon,
  ViewIcon,
  ViewOffSlashIcon,
  Sun03Icon,
  Shield01Icon,
  Brain02Icon,
  BrainIcon,
  HourglassIcon,
  ZapIcon,
  PulseRectangle01Icon,
  CubeIcon,
  Target02Icon,
  HelpCircleIcon,
} from '@hugeicons/core-free-icons';

const map = {
  chat: BubbleChatIcon,
  health: FavouriteIcon,
  account: UserIcon,
  sidebar: SidebarLeftIcon,
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
  download: Download01Icon,
  camera: Camera01Icon,
  file: File01Icon,
  /** New chat — speech bubble with a plus. */
  newChat: ChatAddIcon,
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
  symptoms: StethoscopeIcon,
  // M-7.9 Symptoms map areas
  sun: Sun03Icon,
  shield: Shield01Icon,
  brain: Brain02Icon,
  hypothalamus: BrainIcon,
  hourglass: HourglassIcon,
  pain: ZapIcon,
  pulse: PulseRectangle01Icon,
  metabolic: CubeIcon,
  target: Target02Icon,
  help: HelpCircleIcon,
} as const;

/** `deborah` is not a glyph: it renders the small Deborah orb wherever an action means "Ask Oracle". */
/**
 * Body-area glyphs for the Symptoms map (M-7.9), drawn in-house (designer, 2026-11-07): one 24-unit grid,
 * outline only, round caps/joins, same stroke as the rest of the set — each one literal to its label.
 */
const BODY: Record<BodyGlyph, string> = {
  // Circadian Rhythm — clock (the body clock)
  areaClock: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM12 7.5V12l3 2',
  // Neuroendocrine — a signal sent out from one point
  areaSignal: 'M12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8',
  // Autoimmunity — shield (the immune system)
  areaShield: 'M12 3.5 5.5 6v5.5c0 4 2.8 7.4 6.5 8.5 3.7-1.1 6.5-4.5 6.5-8.5V6L12 3.5Z',
  // Mood & Memory — head in profile with a thought
  areaMind: 'M9 21v-3.2A7 7 0 1 1 18.6 12l1.4 2.6-1.4.6V17a1.5 1.5 0 0 1-1.5 1.5H15V21M11.5 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
  // Premature Aging — hourglass
  areaHourglass: 'M7 3.5h10M7 20.5h10M8 3.5v2.8c0 1.9 4 3.9 4 5.7 0-1.8 4-3.8 4-5.7V3.5M8 20.5v-2.8c0-1.9 4-3.9 4-5.7 0 1.8 4 3.8 4 5.7v2.8',
  // Chronic Pain — pain radiating from a point
  areaAche: 'M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.8 2.8M15.2 15.2 18 18M18 6l-2.8 2.8M8.8 15.2 6 18',
  // Dysautonomia — heart with its rhythm (heart rate, blood pressure)
  areaHeart: 'M12 19.5s-7.5-4.4-7.5-9.8A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 9.8-7.5 9.8ZM7.8 12.2h2.4l1.1-1.8 1.5 3.4 1.1-1.6h2.3',
  // Metabolic — flame (how the body burns energy)
  areaFlame: 'M12 21c-3.6 0-6-2.5-6-5.8 0-3.2 2.4-5 3.4-7.9.5 1.5 1.3 2.6 2.4 3.1.3-2.5 1.3-4.8 3.2-6.4.3 3.1 3 5.3 3 9.4 0 4.4-2.4 7.6-6 7.6Z',
};

type BodyGlyph = 'areaClock' | 'areaSignal' | 'areaShield' | 'areaMind' | 'areaHourglass' | 'areaAche' | 'areaHeart' | 'areaFlame';
export type IconName = keyof typeof map | BodyGlyph | 'deborah' | 'appleFilled';

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
  if (name in BODY) {
    const d = BODY[name as BodyGlyph];
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
        <path d={d} />
      </svg>
    );
  }
  return <HugeiconsIcon icon={map[name as keyof typeof map]} size={size} strokeWidth={strokeWidth} color="currentColor" aria-hidden className={className} />;
}
